const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imageDir = path.join(__dirname, '../public/images');
const outputDir = path.join(__dirname, '../public/images/optimized');

// Crear directorio de salida si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Procesar todas las imágenes JPG y PNG
const processImages = async () => {
  const files = fs.readdirSync(imageDir).filter(file => 
    file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
  );

  for (const file of files) {
    const inputPath = path.join(imageDir, file);
    const outputPath = path.join(outputDir, file);
    
    // Optimizar JPG/JPEG
    if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      await sharp(inputPath)
        .resize({ width: 1400, withoutEnlargement: true })
        .jpeg({ quality: 80, progressive: true })
        .toFile(outputPath);
      console.log(`Optimized: ${file}`);
    }
    // Optimizar PNG
    else if (file.endsWith('.png')) {
      await sharp(inputPath)
        .resize({ width: 1400, withoutEnlargement: true })
        .png({ compressionLevel: 9, palette: true })
        .toFile(outputPath);
      console.log(`Optimized: ${file}`);
    }
  }
};

// Generar WebP versions
const generateWebP = async () => {
  const files = fs.readdirSync(imageDir).filter(file => 
    file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
  );

  for (const file of files) {
    const inputPath = path.join(imageDir, file);
    const outputPath = path.join(
      outputDir, 
      `${file.substring(0, file.lastIndexOf('.'))}.webp`
    );
    
    await sharp(inputPath)
      .resize({ width: 1400, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(outputPath);
    console.log(`WebP created: ${outputPath}`);
  }
};

// Generar imágenes responsive
const generateResponsiveImages = async () => {
  const files = fs.readdirSync(imageDir).filter(file => 
    file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
  );

  const sizes = [400, 800, 1200];
  
  for (const file of files) {
    const inputPath = path.join(imageDir, file);
    const fileNameWithoutExt = file.substring(0, file.lastIndexOf('.'));
    
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `${fileNameWithoutExt}-${size}.webp`);
      
      await sharp(inputPath)
        .resize({ width: size, withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(outputPath);
      console.log(`Responsive image created: ${outputPath} (${size}px)`);
    }
  }
};

// Ejecutar las funciones
processImages()
  .then(() => generateWebP())
  .then(() => generateResponsiveImages())
  .catch(err => console.error('Error optimizing images:', err));