import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { API_URL } from '../config/api';

// Tipos y interfaces
// Añadir "export" antes de la definición de la interfaz
export interface User {
  id: number;
  username: string;
  passwordHash: string; // En producción deberías usar un hash real
  role: 'admin' | 'editor' | 'user';
  name: string;
  email: string;
  avatar?: string;
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
  async login(username: string, password: string): Promise<any> {
    try {
      console.log("Intentando login con:", { username, API_URL });
      
      const response = await fetch(`${API_URL}/users/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'  // Importante para mantener la sesión
      });
      
      if (!response.ok) {
        console.error("Error en login:", response.status, response.statusText);
        throw new Error('Credenciales inválidas');
      }
      
      const userData = await response.json();
      console.log("Login exitoso:", userData);
      
      // Asegurarse de que el rol existe y viene del backend
      // AQUÍ ESTÁ EL PROBLEMA PRINCIPAL: userData.role es lo que viene del backend
      if (userData && !userData.role) {
        // Si no viene role del backend, intentamos agregarlo desde profile
        if (userData.profile && userData.profile.role) {
          userData.role = userData.profile.role;
        } else {
          userData.role = 'user'; // Solo como fallback
        }
      }
      
      // Guardar información del usuario en localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  // Generar ID de sesión
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) +
           Date.now().toString(36);
  }
  
  // Verificar si el usuario está autenticado
  async isAuthenticated(): Promise<boolean> {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      const db = await this.db;
      const session = await db.get(SESSIONS_STORE, token);
      
      if (!session) return false;
      
      // Verificar si la sesión expiró
      if (session.expiresAt < Date.now()) {
        await this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      return false;
    }
  }
  
  // Obtener el usuario actual
  async getCurrentUser(): Promise<any> {
    try {
      // Primero intentar obtener del localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return user;
      }
      
      // Si no hay usuario en localStorage, verificar con el backend
      const response = await fetch(`${API_URL}/users/me/`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        return null;
      }
      
      const user = await response.json();
      
      // Asegurarse de que el rol existe y viene del backend
      if (user && !user.role) {
        if (user.profile && user.profile.role) {
          user.role = user.profile.role;
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
  
  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await fetch(`${API_URL}/users/logout/`, {
        method: 'POST',
        credentials: 'include'
      });
      
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error en logout:', error);
    }
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