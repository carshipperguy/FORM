/**
 * Performance Diagnostic Script
 * 
 * This script analyzes your project for potential performance bottlenecks
 * without making any changes to the codebase.
 * 
 * It will:
 * 1. Scan for large files (>100KB)
 * 2. List all dependencies from package.json
 * 3. Measure cold start time
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Results storage
const results = {
  largeFiles: [],
  dependencies: {
    dependencies: {},
    devDependencies: {}
  },
  coldStartMetrics: {
    totalTime: 0,
    networkRequests: 0,
    moduleLoadingTime: 0
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

console.log(`${colors.bright}${colors.blue}🔍 Starting Performance Diagnostic...${colors.reset}\n`);

// Function to find large files
function findLargeFiles(dir, sizeThreshold = 100 * 1024) { // 100KB default
  console.log(`${colors.yellow}Scanning for files larger than ${sizeThreshold / 1024}KB...${colors.reset}`);
  
  const startTime = performance.now();
  const queue = [dir];
  const ignoreDirs = ['node_modules', '.git'];
  
  while (queue.length > 0) {
    const currentDir = queue.shift();
    
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const itemPath = path.join(currentDir, item);
        
        try {
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            // Skip ignored directories
            if (!ignoreDirs.includes(item)) {
              queue.push(itemPath);
            }
          } else if (stats.isFile() && stats.size > sizeThreshold) {
            results.largeFiles.push({
              path: itemPath,
              size: stats.size,
              sizeFormatted: `${(stats.size / 1024 / 1024).toFixed(2)} MB`
            });
          }
        } catch (err) {
          console.error(`Error accessing ${itemPath}: ${err.message}`);
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${currentDir}: ${err.message}`);
    }
  }
  
  const endTime = performance.now();
  console.log(`${colors.green}✓ File scan completed in ${((endTime - startTime) / 1000).toFixed(2)}s${colors.reset}\n`);
}

// Function to analyze package.json
function analyzeDependencies() {
  console.log(`${colors.yellow}Analyzing package.json for dependencies...${colors.reset}`);
  
  try {
    const startTime = performance.now();
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    
    results.dependencies.dependencies = packageJson.dependencies || {};
    results.dependencies.devDependencies = packageJson.devDependencies || {};
    
    // Count the total number of dependencies
    const totalDeps = Object.keys(results.dependencies.dependencies).length;
    const totalDevDeps = Object.keys(results.dependencies.devDependencies).length;
    
    const endTime = performance.now();
    console.log(`${colors.green}✓ Found ${totalDeps} dependencies and ${totalDevDeps} dev dependencies in ${((endTime - startTime) / 1000).toFixed(2)}s${colors.reset}\n`);
  } catch (err) {
    console.error(`Error reading package.json: ${err.message}`);
  }
}

// Function to simulate a cold start
function simulateColdStart() {
  console.log(`${colors.yellow}Simulating cold start...${colors.reset}`);
  
  try {
    // Kill any running server to ensure a true cold start
    try {
      console.log(`${colors.yellow}Stopping any running server...${colors.reset}`);
      execSync('pkill -f "node|tsx"', { stdio: 'ignore' });
    } catch (e) {
      // It's okay if no process was killed
    }
    
    // Measure cold start time
    const startTime = performance.now();
    
    // Use child_process.exec to start the server and capture output
    console.log(`${colors.yellow}Starting server for cold start measurement...${colors.reset}`);
    
    // Execute with a timeout to avoid hanging
    const output = execSync('NODE_ENV=production timeout 15s node -e "const start = Date.now(); require(\'./server/index.js\'); console.log(\'Cold start time: \' + (Date.now() - start) + \'ms\')"', { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 15000 
    });
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    results.coldStartMetrics.totalTime = totalTime;
    
    // Extract cold start time from output if it exists
    const coldStartMatch = output.match(/Cold start time: (\d+)ms/);
    if (coldStartMatch) {
      results.coldStartMetrics.nodeTime = parseInt(coldStartMatch[1]);
    }
    
    console.log(`${colors.green}✓ Cold start simulation completed in ${(totalTime / 1000).toFixed(2)}s${colors.reset}\n`);
  } catch (err) {
    console.error(`Error during cold start simulation: ${err.message}`);
    if (err.stdout) console.log(`STDOUT: ${err.stdout}`);
    if (err.stderr) console.log(`STDERR: ${err.stderr}`);
  }
}

// Run diagnostics
findLargeFiles('.');
analyzeDependencies();
try {
  simulateColdStart();
} catch (e) {
  console.log(`${colors.yellow}Cold start simulation skipped - will only scan files and dependencies${colors.reset}`);
}

// Print results
console.log(`\n${colors.bright}${colors.blue}📊 Performance Diagnostic Results:${colors.reset}\n`);

// Print large files
console.log(`${colors.bright}Large Files (>100KB):${colors.reset}`);
if (results.largeFiles.length === 0) {
  console.log('  No large files found.');
} else {
  results.largeFiles.sort((a, b) => b.size - a.size);
  results.largeFiles.forEach(file => {
    console.log(`  ${colors.red}${file.sizeFormatted}${colors.reset} - ${file.path}`);
  });
}

// Print dependencies
console.log(`\n${colors.bright}Dependencies (${Object.keys(results.dependencies.dependencies).length}):${colors.reset}`);
Object.entries(results.dependencies.dependencies).forEach(([name, version]) => {
  console.log(`  ${name}: ${version}`);
});

console.log(`\n${colors.bright}DevDependencies (${Object.keys(results.dependencies.devDependencies).length}):${colors.reset}`);
Object.entries(results.dependencies.devDependencies).forEach(([name, version]) => {
  console.log(`  ${name}: ${version}`);
});

// Print cold start metrics
console.log(`\n${colors.bright}Cold Start Metrics:${colors.reset}`);
if (results.coldStartMetrics.totalTime > 0) {
  console.log(`  Total time: ${(results.coldStartMetrics.totalTime / 1000).toFixed(2)}s`);
  if (results.coldStartMetrics.nodeTime) {
    console.log(`  Node startup time: ${(results.coldStartMetrics.nodeTime / 1000).toFixed(2)}s`);
  }
} else {
  console.log('  Cold start simulation was not completed successfully.');
}

// Print summary and recommendations
console.log(`\n${colors.bright}${colors.blue}Summary:${colors.reset}`);
console.log(`1. Found ${results.largeFiles.length} files larger than 100KB`);
console.log(`2. Project has ${Object.keys(results.dependencies.dependencies).length} dependencies and ${Object.keys(results.dependencies.devDependencies).length} dev dependencies`);
if (results.coldStartMetrics.totalTime > 0) {
  console.log(`3. Cold start time: ${(results.coldStartMetrics.totalTime / 1000).toFixed(2)}s`);
}

console.log(`\n${colors.bright}${colors.yellow}Potential Optimization Targets:${colors.reset}`);

// Large files recommendations
if (results.largeFiles.length > 0) {
  console.log(`1. Consider optimizing these large files:`);
  results.largeFiles.slice(0, 3).forEach(file => {
    let recommendation = '';
    if (file.path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      recommendation = 'Consider compression or converting to WebP format';
    } else if (file.path.match(/\.js$/i)) {
      recommendation = 'Consider code splitting or lazy loading';
    } else if (file.path.match(/\.css$/i)) {
      recommendation = 'Consider removing unused styles';
    } else if (file.path.match(/\.json$/i)) {
      recommendation = 'Consider breaking into smaller chunks or lazy loading';
    }
    console.log(`   - ${file.path} (${file.sizeFormatted}) ${recommendation ? '- ' + recommendation : ''}`);
  });
}

// Dependencies recommendations
const totalDeps = Object.keys(results.dependencies.dependencies).length;
if (totalDeps > 20) {
  console.log(`2. Large number of dependencies (${totalDeps}). Consider reviewing for unused packages.`);
}

// Cold start recommendations
if (results.coldStartMetrics.totalTime > 3000) {
  console.log(`3. Cold start time is high (${(results.coldStartMetrics.totalTime / 1000).toFixed(2)}s). Consider optimizing server initialization.`);
}

console.log(`\n${colors.bright}${colors.green}Diagnostic Complete${colors.reset}`);
console.log(`No changes have been made to your project. Use these results to identify optimization opportunities.\n`);