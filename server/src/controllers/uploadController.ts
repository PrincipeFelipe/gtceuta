import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Modificar la función saveBase64Image

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
        
        // SIEMPRE usar URL relativa - IMPORTANTE
        const relativeUrl = `/uploads/${urlPath}/${fileName}`;
        console.log(`Imagen guardada: ${filePath}`);
        console.log(`URL relativa generada: ${relativeUrl}`);
        
        resolve(relativeUrl);
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

// Función para eliminar imágenes
export const deleteImage = async (req: Request, res: Response) => {
  try {
    console.log('Solicitud recibida para eliminar imagen:', req.body);
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ message: 'URL de imagen no proporcionada' });
    }
    
    // Extraer el nombre del archivo de la URL
    let fileName: string;
    try {
      // Intentar extraer el nombre del archivo de una URL completa
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      fileName = pathParts[pathParts.length - 1];
    } catch (error) {
      // Si no es una URL válida, intenta extraer el nombre del archivo de una ruta
      const pathParts = imageUrl.split('/');
      fileName = pathParts[pathParts.length - 1];
    }
    
    console.log('Intentando eliminar archivo:', fileName);
    
    // Determinar la carpeta donde se encuentra la imagen
    let folderPath = '';
    
    // Buscar en qué carpeta está ubicada la imagen
    if (imageUrl.includes('/blog') && !imageUrl.includes('/content/')) {
      folderPath = path.join(__dirname, '../../uploads/images/blog');
    } else if (imageUrl.includes('/content/')) {
      folderPath = path.join(__dirname, '../../uploads/images/blog/content');
    } else if (imageUrl.includes('/sponsors/')) {
      folderPath = path.join(__dirname, '../../uploads/images/sponsors');
    } else {
      // Si no se puede determinar la carpeta específica, buscar en todas
      console.log('No se pudo determinar la carpeta específica, buscando en todas');
      const basePath = path.join(__dirname, '../../uploads/images');
      
      // Buscar en todas las carpetas posibles
      const checkPaths = [
        path.join(basePath, 'blog'),
        path.join(basePath, 'blog/content'),
        path.join(basePath, 'sponsors')
      ];
      
      // Encontrar el archivo en alguna de las carpetas
      for (const checkPath of checkPaths) {
        if (!fs.existsSync(checkPath)) continue;
        
        const filePath = path.join(checkPath, fileName);
        if (fs.existsSync(filePath)) {
          folderPath = checkPath;
          break;
        }
      }
      
      if (!folderPath) {
        return res.status(404).json({ message: 'Archivo no encontrado en ninguna carpeta' });
      }
    }
    
    // Asegurar que la carpeta existe
    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ message: `Carpeta no encontrada: ${folderPath}` });
    }
    
    const filePath = path.join(folderPath, fileName);
    console.log('Ruta completa del archivo a eliminar:', filePath);
    
    // Verificar que el archivo existe antes de intentar eliminarlo
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: `Archivo no encontrado: ${filePath}` });
    }
    
    // Eliminar el archivo
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error al eliminar archivo:', err);
        return res.status(500).json({ message: 'Error al eliminar la imagen', error: err.message });
      }
      
      console.log('Imagen eliminada correctamente:', fileName);
      res.status(200).json({ message: 'Imagen eliminada correctamente' });
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ message: 'Error al eliminar la imagen', error: String(error) });
  }
};

// La función saveBase64Image es privada para este archivo
// Las demás funciones ya han sido exportadas individualmente