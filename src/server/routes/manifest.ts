import { defineEventHandler, setHeaders } from 'h3';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const manifestPath = resolve(process.cwd(), 'public/manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

export default defineEventHandler(event => {
  setHeaders(event, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=3600',
  });

  return manifest;
});
