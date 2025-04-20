import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { API_URL } from '../config/api';

// Tipos y interfaces
// Añadir "export" antes de la definición de la interfaz
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string; // El rol lo determinaremos según los permisos del usuario
}

interface AuthTokens {
  access: string;
  refresh: string;
}

// Esquema de base de datos
interface AuthDB extends DBSchema {
  'users': {
    key: number;
    value: User;
    indexes: {
      'by-username': string;
      'by-email': string;
    };
  };
  'sessions': {
    key: string;
    value: {
      userId: number;
      expiresAt: number;
    };
  };
}

// Constantes
const DB_NAME = 'gt-ceuta-auth-db';
const USERS_STORE = 'users';
const SESSIONS_STORE = 'sessions';
const DB_VERSION = 1;

// Clase de autenticación
class AuthService {
  private db: Promise<IDBPDatabase<AuthDB>>;
  
  constructor() {
    this.db = this.initDB();
    this.initAdminUser();
  }
  
  private async initDB(): Promise<IDBPDatabase<AuthDB>> {
    return openDB<AuthDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Crear store de usuarios si no existe
        if (!db.objectStoreNames.contains(USERS_STORE)) {
          const userStore = db.createObjectStore(USERS_STORE, { 
            keyPath: 'id',
            autoIncrement: true 
          });
          userStore.createIndex('by-username', 'username', { unique: true });
          userStore.createIndex('by-email', 'email', { unique: true });
        }
        
        // Crear store de sesiones si no existe
        if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
          db.createObjectStore(SESSIONS_STORE, { keyPath: 'id' });
        }
      }
    });
  }
  
  // Inicializar el usuario administrador por defecto (solo desarrollo)
  private async initAdminUser() {
    try {
      const db = await this.db;
      
      // Verificar si ya hay usuarios en la base de datos
      const count = await db.count(USERS_STORE);
      if (count === 0) {
        // Crear usuario admin por defecto
        const adminUser: Omit<User, 'id'> = {
          username: 'admin',
          passwordHash: this.hashPassword('admin123'), // En producción usar un hash real
          role: 'admin',
          name: 'Administrador',
          email: 'admin@gtceuta.com'
        };
        
        await db.add(USERS_STORE, adminUser);
        console.log('Usuario administrador creado');
      }
    } catch (error) {
      console.error('Error al inicializar el usuario administrador:', error);
    }
  }
  
  // Hash de contraseña simplificado (usar bcrypt o similar en producción)
  private hashPassword(password: string): string {
    // Esta es una función de hash simple para desarrollo
    // En producción, usa una librería como bcrypt
    return btoa(password) + '_hashed';
  }
  
  // Verificar contraseña
  private checkPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }
  
  // Iniciar sesión
  async login(username: string, password: string): Promise<User | null> {
    try {
      console.log("Intentando login con:", { username });
      
      // Corregir la URL para evitar la duplicación de 'api'
      const tokenUrl = API_URL.endsWith('/api') 
        ? `${API_URL}/token/` 
        : `${API_URL}/api/token/`;
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) {
        console.error("Error en login:", response.status, response.statusText);
        return null;
      }
      
      const tokens: AuthTokens = await response.json();
      
      // Guardar tokens en localStorage
      localStorage.setItem('accessToken', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
      
      // Obtener datos del usuario
      const userData = await this.getCurrentUser();
      return userData;
    } catch (error) {
      console.error('Error en login:', error);
      return null;
    }
  }
  
  // Obtener el usuario actual
  async getCurrentUser(): Promise<User | null> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        return null;
      }
      
      // Aplicar la misma corrección para la URL de usuario actual
      const userUrl = API_URL.endsWith('/api') 
        ? `${API_URL}/users/me/` 
        : `${API_URL}/api/users/me/`;
      
      const response = await fetch(userUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado, intentar renovar
          const refreshed = await this.refreshToken();
          if (refreshed) {
            return this.getCurrentUser();
          } else {
            this.logout();
            return null;
          }
        }
        return null;
      }
      
      const user = await response.json();
      
      // Determinar rol basado en permisos (esto es un ejemplo, ajustar según tu backend)
      if (!user.role) {
        if (user.is_superuser) {
          user.role = 'admin';
        } else if (user.is_staff) {
          user.role = 'editor';
        } else {
          user.role = 'user';
        }
      }
      
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error("Error obteniendo usuario actual:", error);
      return null;
    }
  }
  
  // Refrescar el token
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        return false;
      }
      
      // Aplicar la misma corrección para la URL de refresh token
      const refreshUrl = API_URL.endsWith('/api') 
        ? `${API_URL}/token/refresh/` 
        : `${API_URL}/api/token/refresh/`;
      
      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken })
      });
      
      if (!response.ok) {
        return false;
      }
      
      const tokens = await response.json();
      localStorage.setItem('accessToken', tokens.access);
      return true;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      return false;
    }
  }
  
  // Verificar si el usuario está autenticado
  async isAuthenticated(): Promise<boolean> {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;
    
    try {
      // Aplicar la misma corrección para la URL de verificación
      const verifyUrl = API_URL.endsWith('/api') 
        ? `${API_URL}/token/verify/` 
        : `${API_URL}/api/token/verify/`;
      
      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error al verificar token:', error);
      return false;
    }
  }
  
  // Cerrar sesión
  async logout(): Promise<void> {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
  
  // Actualizar usuario
  async updateUser(user: User): Promise<boolean> {
    try {
      const db = await this.db;
      await db.put(USERS_STORE, user);
      return true;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return false;
    }
  }
  
  // Cambiar contraseña
  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      const db = await this.db;
      const user = await db.get(USERS_STORE, userId);
      
      if (!user) return false;
      
      // Verificar contraseña actual
      if (!this.checkPassword(oldPassword, user.passwordHash)) {
        return false;
      }
      
      // Actualizar contraseña
      user.passwordHash = this.hashPassword(newPassword);
      await db.put(USERS_STORE, user);
      return true;
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return false;
    }
  }
  
  // Listar todos los usuarios (solo para admin)
  async getAllUsers(): Promise<Omit<User, 'passwordHash'>[]> {
    try {
      const db = await this.db;
      const users = await db.getAll(USERS_STORE);
      
      // Eliminar los hash de contraseñas de la respuesta
      return users.map(({ passwordHash, ...user }) => user) as User[];
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  }
  
  // Crear un nuevo usuario (solo para admin)
  async createUser(user: Omit<User, 'id' | 'passwordHash'>, password: string): Promise<boolean> {
    try {
      const db = await this.db;
      
      // Verificar si ya existe un usuario con ese username o email
      const existingByUsername = await db.getFromIndex(USERS_STORE, 'by-username', user.username);
      if (existingByUsername) return false;
      
      const existingByEmail = await db.getFromIndex(USERS_STORE, 'by-email', user.email);
      if (existingByEmail) return false;
      
      // Crear nuevo usuario
      const newUser = {
        ...user,
        passwordHash: this.hashPassword(password)
      };
      
      await db.add(USERS_STORE, newUser);
      return true;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      return false;
    }
  }
  
  // Eliminar usuario (solo para admin)
  async deleteUser(userId: number): Promise<boolean> {
    try {
      const db = await this.db;
      await db.delete(USERS_STORE, userId);
      return true;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      return false;
    }
  }
}

export default new AuthService();