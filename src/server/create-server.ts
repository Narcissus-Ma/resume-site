import { randomUUID } from 'node:crypto';

import cors from 'cors';
import express, {
  json as expressJson,
  type NextFunction,
  type Request,
  type Response,
} from 'express';

import type { HomeCatalogRepository } from './home-catalog-repository';
import type { ResumeCatalogRepository } from './resume-catalog-repository';
import {
  copyHomeProfile,
  createHomeProfile,
  deleteHomeProfile,
  HomeCatalogError,
  renameHomeProfile,
  setActiveHomeProfile,
  updateHomeContent,
} from '../domain/home/rules/home-catalog';
import {
  copyResumeProfile,
  createResumeProfile,
  deleteResumeProfile,
  renameResumeProfile,
  ResumeCatalogError,
  setActiveResumeProfile,
  updateResumeContent,
} from '../domain/resume/rules/resume-catalog';
import { HOME_LANGUAGES, type HomeLanguage } from '../types';
import { RESUME_LANGUAGES, type ResumeLanguage } from '../types/resume';

interface CreateServerOptions {
  repository: ResumeCatalogRepository;
  homeRepository?: HomeCatalogRepository;
  createId?: () => string;
}

interface HttpError extends Error {
  status?: number;
  code?: string;
}

const createHttpError = (status: number, code: string, message: string): HttpError => {
  const error = new Error(message) as HttpError;
  error.status = status;
  error.code = code;
  return error;
};

const getCatalogErrorStatus = (error: ResumeCatalogError): number => {
  if (error.code === 'RESUME_NOT_FOUND' || error.code === 'ACTIVE_RESUME_NOT_FOUND') {
    return 404;
  }

  if (
    error.code === 'DUPLICATE_RESUME_NAME' ||
    error.code === 'LAST_RESUME' ||
    error.code === 'RESUME_IS_ACTIVE'
  ) {
    return 409;
  }

  return 400;
};

const getHomeCatalogErrorStatus = (error: HomeCatalogError): number => {
  if (error.code === 'HOME_NOT_FOUND' || error.code === 'ACTIVE_HOME_NOT_FOUND') return 404;
  if (
    error.code === 'DUPLICATE_HOME_NAME' ||
    error.code === 'LAST_HOME' ||
    error.code === 'HOME_IS_ACTIVE'
  ) {
    return 409;
  }
  return 400;
};

const isResumeLanguage = (value: unknown): value is ResumeLanguage =>
  typeof value === 'string' && RESUME_LANGUAGES.some((language) => language === value);

const isHomeLanguage = (value: unknown): value is HomeLanguage =>
  typeof value === 'string' && HOME_LANGUAGES.some((language) => language === value);

export const createServer = ({
  repository,
  homeRepository,
  createId = randomUUID,
}: CreateServerOptions) => {
  const app = express();

  app.use(cors());
  app.use(expressJson());

  app.get('/api/resume-catalog', async (_request, response) => {
    response.json(await repository.read());
  });

  app.put('/api/resume-catalog/content', async (request, response) => {
    const { resumeId, language, content } = request.body;

    if (typeof resumeId !== 'string' || !isResumeLanguage(language) || !content) {
      throw createHttpError(400, 'INVALID_REQUEST', '简历内容请求参数无效');
    }

    const catalog = updateResumeContent(await repository.read(), resumeId, language, content);
    await repository.write(catalog);
    response.json(catalog);
  });

  app.post('/api/resume-catalog/resumes', async (request, response) => {
    const { mode, name, sourceResumeId } = request.body;

    if (typeof name !== 'string' || (mode !== 'empty' && mode !== 'copy')) {
      throw createHttpError(400, 'INVALID_REQUEST', '创建岗位请求参数无效');
    }

    const currentCatalog = await repository.read();
    const result =
      mode === 'copy'
        ? copyResumeProfile(currentCatalog, {
            name,
            sourceResumeId,
            createId,
          })
        : createResumeProfile(currentCatalog, { name, createId });

    await repository.write(result.catalog);
    response.status(201).json(result);
  });

  app.patch('/api/resume-catalog/resumes/:resumeId', async (request, response) => {
    const { name } = request.body;

    if (typeof name !== 'string') {
      throw createHttpError(400, 'INVALID_REQUEST', '重命名请求参数无效');
    }

    const catalog = renameResumeProfile(await repository.read(), request.params.resumeId, name);
    await repository.write(catalog);
    response.json(catalog);
  });

  app.delete('/api/resume-catalog/resumes/:resumeId', async (request, response) => {
    const catalog = deleteResumeProfile(await repository.read(), request.params.resumeId);
    await repository.write(catalog);
    response.json(catalog);
  });

  app.put('/api/resume-catalog/active', async (request, response) => {
    const { resumeId } = request.body;

    if (typeof resumeId !== 'string') {
      throw createHttpError(400, 'INVALID_REQUEST', '启用岗位请求参数无效');
    }

    const catalog = setActiveResumeProfile(await repository.read(), resumeId);
    await repository.write(catalog);
    response.json(catalog);
  });

  if (homeRepository) {
    app.get('/api/home-catalog', async (_request, response) => {
      response.json(await homeRepository.read());
    });

    app.put('/api/home-catalog/content', async (request, response) => {
      const { homeId, language, content } = request.body;
      if (typeof homeId !== 'string' || !isHomeLanguage(language) || !content) {
        throw createHttpError(400, 'INVALID_REQUEST', '主页内容请求参数无效');
      }
      const catalog = updateHomeContent(await homeRepository.read(), homeId, language, content);
      await homeRepository.write(catalog);
      response.json(catalog);
    });

    app.post('/api/home-catalog/homes', async (request, response) => {
      const { mode, name, sourceHomeId } = request.body;
      if (typeof name !== 'string' || (mode !== 'empty' && mode !== 'copy')) {
        throw createHttpError(400, 'INVALID_REQUEST', '创建主页岗位请求参数无效');
      }
      const currentCatalog = await homeRepository.read();
      const result =
        mode === 'copy'
          ? copyHomeProfile(currentCatalog, { name, sourceHomeId, createId })
          : createHomeProfile(currentCatalog, { name, createId });
      await homeRepository.write(result.catalog);
      response.status(201).json(result);
    });

    app.patch('/api/home-catalog/homes/:homeId', async (request, response) => {
      const { name } = request.body;
      if (typeof name !== 'string') {
        throw createHttpError(400, 'INVALID_REQUEST', '重命名主页岗位请求参数无效');
      }
      const catalog = renameHomeProfile(await homeRepository.read(), request.params.homeId, name);
      await homeRepository.write(catalog);
      response.json(catalog);
    });

    app.delete('/api/home-catalog/homes/:homeId', async (request, response) => {
      const catalog = deleteHomeProfile(await homeRepository.read(), request.params.homeId);
      await homeRepository.write(catalog);
      response.json(catalog);
    });

    app.put('/api/home-catalog/active', async (request, response) => {
      const { homeId } = request.body;
      if (typeof homeId !== 'string') {
        throw createHttpError(400, 'INVALID_REQUEST', '启用主页岗位请求参数无效');
      }
      const catalog = setActiveHomeProfile(await homeRepository.read(), homeId);
      await homeRepository.write(catalog);
      response.json(catalog);
    });
  }

  app.use((error: HttpError, _request: Request, response: Response, next: NextFunction) => {
    void next;
    const status =
      error instanceof ResumeCatalogError
        ? getCatalogErrorStatus(error)
        : error instanceof HomeCatalogError
          ? getHomeCatalogErrorStatus(error)
          : (error.status ?? 500);
    const code =
      error instanceof ResumeCatalogError || error instanceof HomeCatalogError
        ? error.code
        : (error.code ?? 'INTERNAL_SERVER_ERROR');

    if (status === 500) {
      console.error('服务端请求处理失败:', error);
    }

    response.status(status).json({
      error: {
        code,
        message: status === 500 ? '服务端处理请求失败' : error.message,
      },
    });
  });

  return app;
};
