import pool from '../config/db';

async function initializeDatabase() {
  try {
    console.log('Inicializando la base de datos...');
    
    // Crear tabla de blog
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        excerpt TEXT,
        content TEXT NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        image VARCHAR(255),
        author VARCHAR(100),
        category VARCHAR(100),
        tags JSON,
        published BOOLEAN DEFAULT false,
        featured BOOLEAN DEFAULT false,
        meta_description TEXT,
        last_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    
    // Crear tabla de patrocinadores
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sponsors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        logo VARCHAR(255),
        url VARCHAR(255),
        description TEXT,
        tier VARCHAR(50),
        active BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Base de datos inicializada correctamente.');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  } finally {
    // Cerrar el pool de conexiones
    await pool.end();
  }
}

// Ejecutar la función
initializeDatabase();