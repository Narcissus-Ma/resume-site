import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import translate from 'google-translate-api';
import { format, resolveConfig } from 'prettier';

const DATA_DIRECTORY = path.resolve(process.cwd(), 'src/data');
const HOME_CATALOG_PATH = path.join(DATA_DIRECTORY, 'home-catalog.json');
const RESUME_CATALOG_PATH = path.join(DATA_DIRECTORY, 'resume-catalog.json');
const SOURCE_LANGUAGE = 'zh-CN';
const TARGET_LANGUAGES = ['en-US', 'ja-JP'];

const writeJsonFile = async (filePath, value) => {
  const prettierConfig = await resolveConfig(path.join(process.cwd(), 'package.json'));
  const content = await format(JSON.stringify(value), {
    ...prettierConfig,
    parser: 'json',
  });
  await fs.writeFile(filePath, content, 'utf8');
};

const getGoogleLanguageCode = (language) => {
  const languageMap = {
    'en-US': 'en',
    'ja-JP': 'ja',
    'zh-CN': 'zh',
  };

  return languageMap[language] ?? language;
};

const translateText = async (text, targetLanguage) => {
  try {
    const result = await translate(text, {
      to: getGoogleLanguageCode(targetLanguage),
      host: 'translate.google.cn',
    });
    console.log(`翻译: ${text} -> ${result.text}`);
    return result.text;
  } catch (error) {
    console.error(`翻译失败: ${text}`, error.message);
    return text;
  } finally {
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
};

const translateJson = async (value, targetLanguage) => {
  if (typeof value === 'string') {
    return translateText(value, targetLanguage);
  }

  if (Array.isArray(value)) {
    return Promise.all(value.map((item) => translateJson(item, targetLanguage)));
  }

  if (typeof value === 'object' && value !== null) {
    const entries = await Promise.all(
      Object.entries(value).map(async ([key, item]) => [
        key,
        await translateJson(item, targetLanguage),
      ]),
    );
    return Object.fromEntries(entries);
  }

  return value;
};

const translateResumeCatalog = async (
  catalog,
  translateContent = (content, language) => translateJson(content, language),
) => {
  const nextCatalog = structuredClone(catalog);

  for (const resume of nextCatalog.resumes) {
    const sourceContent = resume.contents[SOURCE_LANGUAGE];

    for (const language of TARGET_LANGUAGES) {
      resume.contents[language] = await translateContent(sourceContent, language);
    }
  }

  return nextCatalog;
};

const translateHomeCatalog = async (
  catalog,
  translateContent = (content, language) => translateJson(content, language),
) => {
  const nextCatalog = structuredClone(catalog);
  for (const home of nextCatalog.homes) {
    const sourceContent = home.contents[SOURCE_LANGUAGE];
    for (const language of TARGET_LANGUAGES) {
      home.contents[language] = await translateContent(sourceContent, language);
    }
  }
  return nextCatalog;
};

const translateAllData = async () => {
  const catalog = JSON.parse(await fs.readFile(RESUME_CATALOG_PATH, 'utf8'));
  const translatedCatalog = await translateResumeCatalog(catalog);

  await writeJsonFile(RESUME_CATALOG_PATH, translatedCatalog);
  console.log(`简历目录翻译完成: ${RESUME_CATALOG_PATH}`);

  const homeCatalog = JSON.parse(await fs.readFile(HOME_CATALOG_PATH, 'utf8'));
  await writeJsonFile(HOME_CATALOG_PATH, await translateHomeCatalog(homeCatalog));
  console.log(`主页目录翻译完成: ${HOME_CATALOG_PATH}`);
  console.log('所有数据翻译完成');
};

const isDirectExecution =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectExecution) {
  await translateAllData();
}

export { translateAllData, translateHomeCatalog, translateJson, translateResumeCatalog };
