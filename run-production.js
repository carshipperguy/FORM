#!/usr/bin/env node
// Production runner script that bypasses development server detection

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting production server for deployment...');

// Check if production build exists
const buildPath = path.join(__dirname, 'dist', 'index.js');
if (!fs.existsSync(buildPath)) {
  console.log('❌ Production build not found. Please run: npm run build');
  process.exit(1);
}

// Start production server with proper environment
const productionServer = spawn('node', [buildPath], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || '5000'
  },
  stdio: 'inherit'
});

productionServer.on('error', (err) => {
  console.error('❌ Production server error:', err);
  process.exit(1);
});

productionServer.on('close', (code) => {
  console.log(`🛑 Production server exited with code ${code}`);
  process.exit(code || 0);
});

// Handle termination signals
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down...');
  productionServer.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down...');
  productionServer.kill('SIGINT');
});