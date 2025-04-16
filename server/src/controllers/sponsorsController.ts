import { Request, Response } from 'express';
import pool from '../config/db';

// Obtener todos los patrocinadores
export async function getAllSponsors(req: Request, res: Response) {
  try {
    const [rows] = await pool.query('SELECT * FROM sponsors ORDER BY tier, name');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener patrocinadores:', error);
    res.status(500).json({ error: 'Error al obtener los patrocinadores' });
  }
}

// Obtener un patrocinador por ID
export async function getSponsorById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM sponsors WHERE id = ?', [id]);
    
    if (Array.isArray(rows) && rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Patrocinador no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener patrocinador:', error);
    res.status(500).json({ error: 'Error al obtener el patrocinador' });
  }
}

// Crear un nuevo patrocinador
export async function createSponsor(req: Request, res: Response) {
  try {
    const { name, logo, url, description, tier, active } = req.body;
    
    // Validar datos necesarios
    if (!name) {
      return res.status(400).json({ error: 'Se requiere nombre del patrocinador' });
    }
    
    // Insertar en la base de datos
    const [result] = await pool.query(
      'INSERT INTO sponsors (name, logo, url, description, tier, active) VALUES (?, ?, ?, ?, ?, ?)',
      [name, logo || '', url || '', description || '', tier || 'standard', active !== undefined ? active : true]
    );
    
    const newSponsor = {
      id: (result as any).insertId,
      name,
      logo,
      url,
      description,
      tier,
      active: active !== undefined ? active : true,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    res.status(201).json(newSponsor);
  } catch (error) {
    console.error('Error al crear patrocinador:', error);
    res.status(500).json({ error: 'Error al crear el patrocinador' });
  }
}

// Actualizar un patrocinador
export async function updateSponsor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, logo, url, description, tier, active } = req.body;
    
    // Validar datos necesarios
    if (!name) {
      return res.status(400).json({ error: 'Se requiere nombre del patrocinador' });
    }
    
    // Verificar si el patrocinador existe
    const [existingSponsor] = await pool.query('SELECT id FROM sponsors WHERE id = ?', [id]);
    if (Array.isArray(existingSponsor) && existingSponsor.length === 0) {
      return res.status(404).json({ error: 'Patrocinador no encontrado' });
    }
    
    // Actualizar en la base de datos
    await pool.query(
      'UPDATE sponsors SET name = ?, logo = ?, url = ?, description = ?, tier = ?, active = ? WHERE id = ?',
      [name, logo || '', url || '', description || '', tier || 'standard', active !== undefined ? active : true, id]
    );
    
    res.json({ id, message: 'Patrocinador actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar patrocinador:', error);
    res.status(500).json({ error: 'Error al actualizar el patrocinador' });
  }
}

// Eliminar un patrocinador
export async function deleteSponsor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Verificar si el patrocinador existe
    const [existingSponsor] = await pool.query('SELECT id FROM sponsors WHERE id = ?', [id]);
    if (Array.isArray(existingSponsor) && existingSponsor.length === 0) {
      return res.status(404).json({ error: 'Patrocinador no encontrado' });
    }
    
    // Eliminar de la base de datos
    await pool.query('DELETE FROM sponsors WHERE id = ?', [id]);
    
    res.json({ message: 'Patrocinador eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar patrocinador:', error);
    res.status(500).json({ error: 'Error al eliminar el patrocinador' });
  }
}

// Importar múltiples patrocinadores
export async function importSponsors(req: Request, res: Response) {
  try {
    const sponsors = req.body;
    
    if (!Array.isArray(sponsors)) {
      return res.status(400).json({ error: 'El formato de los datos es incorrecto' });
    }
    
    const results = {
      created: 0,
      updated: 0,
      errors: 0
    };
    
    for (const sponsor of sponsors) {
      try {
        if (sponsor.id) {
          // Actualizar patrocinador existente
          const [existingSponsor] = await pool.query('SELECT id FROM sponsors WHERE id = ?', [sponsor.id]);
          
          if (Array.isArray(existingSponsor) && existingSponsor.length > 0) {
            await pool.query(
              'UPDATE sponsors SET name = ?, logo = ?, url = ?, description = ?, tier = ?, active = ? WHERE id = ?',
              [sponsor.name, sponsor.logo || '', sponsor.url || '', sponsor.description || '', sponsor.tier || 'standard', sponsor.active !== undefined ? sponsor.active : true, sponsor.id]
            );
            results.updated++;
          } else {
            // Crear nuevo patrocinador con ID específico
            await pool.query(
              'INSERT INTO sponsors (id, name, logo, url, description, tier, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [sponsor.id, sponsor.name, sponsor.logo || '', sponsor.url || '', sponsor.description || '', sponsor.tier || 'standard', sponsor.active !== undefined ? sponsor.active : true]
            );
            results.created++;
          }
        } else {
          // Crear nuevo patrocinador
          await pool.query(
            'INSERT INTO sponsors (name, logo, url, description, tier, active) VALUES (?, ?, ?, ?, ?, ?)',
            [sponsor.name, sponsor.logo || '', sponsor.url || '', sponsor.description || '', sponsor.tier || 'standard', sponsor.active !== undefined ? sponsor.active : true]
          );
          results.created++;
        }
      } catch (error) {
        console.error('Error al importar patrocinador:', error);
        results.errors++;
      }
    }
    
    res.json({
      message: `Importación completada: ${results.created} creados, ${results.updated} actualizados, ${results.errors} errores`,
      results
    });
  } catch (error) {
    console.error('Error al importar patrocinadores:', error);
    res.status(500).json({ error: 'Error al importar patrocinadores' });
  }
}