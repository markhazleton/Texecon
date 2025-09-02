import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '5000', 10);

// Serve static files from dist/public directory
const staticPath = path.join(__dirname, '..', 'dist', 'public');
app.use(express.static(staticPath));

// Handle client-side routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Static server running on port ${port}`);
  console.log(`Serving files from: ${staticPath}`);
});