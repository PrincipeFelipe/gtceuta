import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Función para decodificar base64 y guardar como archivo
const saveBase64Image = (base64Data: string, directory: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Extraer tipo y datos
      const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      
      if (!matches || matches.length !== 3) {
        return reject(new Error('Datos de imagen no válidos'));
      }
      
      const imageType = matches[1];
      const imageData = matches[2];
      const extension = imageType.split('/')[1];
      const fileName = `${uuidv4()}.${extension}`;
      const filePath = path.join(directory, fileName);
      
      // Crear directorio si no existe
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      
      // Guardar el archivo
      fs.writeFile(filePath, imageData, { encoding: 'base64' }, (err) => {
        if (err) return reject(err);
        
        // Crear path relativo para la URL
        const relativePath = path.relative(path.join(__dirname, '../../uploads'), directory);
        const urlPath = relativePath.split(path.sep).join('/');
        
        // URL completa con el servidor
        const fullUrl = `http://localhost:4000/uploads/${urlPath}/${fileName}`;
        
        resolve(fullUrl);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Subir imagen para blog (imágenes destacadas)
export const uploadBlogImage = async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen' });
    }

    const uploadsDir = path.join(__dirname, '../../uploads/images/blog');
    const imageUrl = await saveBase64Image(image, uploadsDir);
    
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Error al subir imagen del blog:', error);
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
};

// Subir imagen para patrocinador
export const uploadSponsorImage = async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen' });
    }

    const uploadsDir = path.join(__dirname, '../../uploads/images/sponsors');
    const imageUrl = await saveBase64Image(image, uploadsDir);
    
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Error al subir imagen del patrocinador:', error);
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
};

// Subir imagen para contenido HTML (editor TipTap o Quill)
export const uploadContentImage = async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen' });
    }

    const uploadsDir = path.join(__dirname, '../../uploads/images/blog/content');
    const imageUrl = await saveBase64Image(image, uploadsDir);
    
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Error al subir imagen de contenido:', error);
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
};

// Punto de entrada general para todo tipo de imágenes
export const uploadImage = async (req: Request, res: Response) => {
  try {
    const { image, type = 'blog' } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen' });
    }

    let uploadsDir: string;
    
    // Determinar el directorio según el tipo de imagen
    switch (type) {
      case 'blog':
        uploadsDir = path.join(__dirname, '../../uploads/images/blog');
        break;
      case 'blog-content':
        uploadsDir = path.join(__dirname, '../../uploads/images/blog/content');
        break;
      case 'sponsor':
        uploadsDir = path.join(__dirname, '../../uploads/images/sponsors');
        break;
      default:
        uploadsDir = path.join(__dirname, '../../uploads/images/misc');
    }
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const imageUrl = await saveBase64Image(image, uploadsDir);
    
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
};