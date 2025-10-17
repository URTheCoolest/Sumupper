const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng() {
  const sizes = [192, 512];
  
  for (const size of sizes) {
    const svgPath = path.join(__dirname, '..', 'public', 'icons', `icon-${size}x${size}.svg`);
    const pngPath = path.join(__dirname, '..', 'public', 'icons', `icon-${size}x${size}.png`);
    
    if (fs.existsSync(svgPath)) {
      try {
        await sharp(svgPath)
          .resize(size, size)
          .png()
          .toFile(pngPath);
        
        console.log(`Created ${pngPath}`);
      } catch (error) {
        console.error(`Error converting ${svgPath} to PNG:`, error);
      }
    } else {
      console.error(`SVG file not found: ${svgPath}`);
    }
  }
}

convertSvgToPng();