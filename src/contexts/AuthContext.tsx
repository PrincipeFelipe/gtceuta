import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { User } from '../services/AuthService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => false,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar si hay token y si es válido
        const isAuth = await authService.isAuthenticated();
        
        if (isAuth) {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            console.log("Usuario autenticado:", currentUser);
            setUser(currentUser);
            setIsAuthenticated(true);
          } else {
            console.log("Token válido pero no se pudo obtener el usuario");
            setIsAuthenticated(false);
          }
        } else {
          console.log("No autenticado o token inválido");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const userData = await authService.login(username, password);
      if (userData) {
        console.log("Login exitoso:", userData);
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error de login:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};