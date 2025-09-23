// Production-ready server that works with workflow configuration
// This runs the built production server instead of development server

import { spawn } from 'child_process';
import { existsSync } from 'fs';

console.log('🔄 Checking for production build...');

if (!existsSync('dist/index.js')) {
  console.log('❌ Production build not found. Building now...');
  const buildProcess = spawn('npm', ['run', 'build'], { 
    stdio: 'inherit',
    shell: true 
  });
  
  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Build completed. Starting production server...');
      startProductionServer();
    } else {
      console.error('❌ Build failed with code', code);
      process.exit(1);
    }
  });
} else {
  console.log('✅ Production build found. Starting server...');
  startProductionServer();
}

function startProductionServer() {
  const productionProcess = spawn('node', ['dist/index.js'], {
    env: { 
      ...process.env, 
      NODE_ENV: 'production',
      PORT: '5000'
    },
    stdio: 'inherit',
    shell: false
  });
  
  productionProcess.on('error', (err) => {
    console.error('❌ Production server error:', err);
    process.exit(1);
  });
  
  productionProcess.on('close', (code) => {
    console.log(`🛑 Production server exited with code ${code}`);
    process.exit(code || 0);
  });
}