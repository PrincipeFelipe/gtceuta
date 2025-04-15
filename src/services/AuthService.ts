import { openDB, DBSchema, IDBPDatabase } from 'idb';

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
  async login(username: string, password: string): Promise<User | null> {
    try {
      const db = await this.db;
      
      // Buscar el usuario por nombre de usuario
      const user = await db.getFromIndex(USERS_STORE, 'by-username', username);
      
      // Verificar si existe y la contraseña es correcta
      if (user && this.checkPassword(password, user.passwordHash)) {
        // Generar token de sesión
        const sessionId = this.generateSessionId();
        const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 días
        
        // Guardar sesión
        await db.put(SESSIONS_STORE, {
          id: sessionId,
          userId: user.id,
          expiresAt
        });
        
        // Guardar token en localStorage
        localStorage.setItem('authToken', sessionId);
        
        // No devolver la contraseña en la respuesta
        const { passwordHash, ...userData } = user;
        return userData as User;
      }
      
      return null;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return null;
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
  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    try {
      const db = await this.db;
      const session = await db.get(SESSIONS_STORE, token);
      
      if (!session || session.expiresAt < Date.now()) {
        await this.logout();
        return null;
      }
      
      const user = await db.get(USERS_STORE, session.userId);
      if (!user) {
        await this.logout();
        return null;
      }
      
      // No devolver la contraseña en la respuesta
      const { passwordHash, ...userData } = user;
      return userData as User;
    } catch (error) {
      console.error('Error al obtener el usuario actual:', error);
      return null;
    }
  }
  
  // Cerrar sesión
  async logout(): Promise<boolean> {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const db = await this.db;
        await db.delete(SESSIONS_STORE, token);
        localStorage.removeItem('authToken');
        return true;
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        return false;
      }
    }
    return true;
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

const authService = new AuthService();
export default authService;