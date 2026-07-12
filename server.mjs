import next from 'next';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import app from './backend/src/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);
const frontendDir = path.join(__dirname, 'frontend');

const nextApp = next({ dev, dir: frontendDir });
const handle = nextApp.getRequestHandler();

// Forward everything not handled by the Express API to Next.js
app.all('*', (req, res) => handle(req, res));

nextApp.prepare().then(() => {
  app.listen(port, () => {
    console.log(`> SAVANT ready on http://localhost:${port} (dev=${dev})`);
  });
}).catch((err) => {
  console.error('Failed to prepare Next.js app:', err);
  process.exit(1);
});
