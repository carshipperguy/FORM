
import fs from 'fs';
import path from 'path';

// Replace environment variables in HTML files
function replaceEnvVars() {
  const htmlPath = path.join(process.cwd(), 'client/index.html');
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Replace META_PIXEL_ID placeholder
  const metaPixelId = process.env.META_PIXEL_ID || '953087976815191';
  htmlContent = htmlContent.replace(/%META_PIXEL_ID%/g, metaPixelId);
  
  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`✅ Replaced META_PIXEL_ID with: ${metaPixelId}`);
}

replaceEnvVars();
