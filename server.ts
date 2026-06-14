import path from 'path';

import { createServer } from './src/server/create-server';
import { FileHomeCatalogRepository } from './src/server/home-catalog-repository';
import { FileResumeCatalogRepository } from './src/server/resume-catalog-repository';

const port = Number(process.env.PORT ?? 3001);
const repository = new FileResumeCatalogRepository(
  path.join(process.cwd(), 'src', 'data', 'resume-catalog.json'),
);
const homeRepository = new FileHomeCatalogRepository(
  path.join(process.cwd(), 'src', 'data', 'home-catalog.json'),
);
const app = createServer({ repository, homeRepository });

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
