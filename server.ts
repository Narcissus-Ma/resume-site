import path from 'path';

import { createServer } from './src/server/create-server';
import { FileResumeCatalogRepository } from './src/server/resume-catalog-repository';

const port = Number(process.env.PORT ?? 3001);
const repository = new FileResumeCatalogRepository(
  path.join(process.cwd(), 'src', 'data', 'resume-catalog.json'),
);
const app = createServer({ repository });

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
