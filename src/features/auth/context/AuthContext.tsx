import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { AuthUser, UserRole, AdminModule, ROLE_METADATA } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  login: (email: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  canAccess: (module: AdminModule) => boolean;
}

const DEFAULT_ADMIN_USER: AuthUser = {
  id: 'usr_pastor_01',
  email: 'pastor.admin@elshaddai.org',
  fullName: 'Pastor David Ben-David',
  role: 'church_pastor_admin',
  churchId: 'church_elshaddai_central',
  churchName: 'Iglesia El-Shaddai Central',
  annexId: 'annex_central',
  annexName: 'Templo Principal',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  phone: '+1 (555) 019-2834',
};

const STORAGE_USER_KEY = 'sanctuary_auth_user';
const STORAGE_TOKEN_KEY = 'sanctuary_auth_jwt';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not parse stored auth user', e);
    }
    return DEFAULT_ADMIN_USER;
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_TOKEN_KEY) || 'mock_jwt_token_sanctuary_admin_2026';
    } catch {
      return 'mock_jwt_token_sanctuary_admin_2026';
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_USER_KEY);
      }
    } catch (e) {
      console.warn('Failed to persist user in storage', e);
    }
  }, [user]);

  useEffect(() => {
    try {
      if (token) {
        localStorage.setItem(STORAGE_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(STORAGE_TOKEN_KEY);
      }
    } catch (e) {
      console.warn('Failed to persist token in storage', e);
    }
  }, [token]);

  const switchRole = (newRole: UserRole) => {
    setUser((prev) => {
      const updated: AuthUser = {
        ...prev,
        role: newRole,
        // Customize display name based on role if helpful
        fullName:
          newRole === 'church_pastor_admin'
            ? 'Pastor David Ben-David'
            : newRole === 'sede_leader'
            ? 'Pastor Asociado Marcos Silva (Sede Norte)'
            : newRole === 'annex_pastor_leader'
            ? 'Pastor Gabriel Morales (Anexo San Pedro)'
            : newRole === 'celula_leader'
            ? 'Hno. Roberto Carrizo (Líder Célula Betel)'
            : newRole === 'membership_manager'
            ? 'Hermana Raquel Soto (Membresías)'
            : newRole === 'food_court_manager'
            ? 'Hno. Daniel Peña (Encargado Kiosko)'
            : newRole === 'event_coordinator'
            ? 'Hna. Sofía Valenzuela (Eventos)'
            : newRole === 'media_announcer'
            ? 'Hno. Gabriel Cruz (Medios)'
            : 'Miembro Activo El-Shaddai',
      };
      return updated;
    });
  };

  const login = async (email: string, role: UserRole = 'church_pastor_admin') => {
    const mockUser: AuthUser = {
      ...DEFAULT_ADMIN_USER,
      email,
      role,
    };
    setUser(mockUser);
    setToken(`jwt_${Date.now()}_${role}`);
  };

  const logout = () => {
    setUser({
      ...DEFAULT_ADMIN_USER,
      role: 'member',
      fullName: 'Usuario Invitado',
    });
    setToken(null);
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const currentRole = user.role;
    if (Array.isArray(roles)) {
      return roles.includes(currentRole);
    }
    return currentRole === roles;
  };

  const canAccess = (module: AdminModule): boolean => {
    if (!user) return false;
    const roleMeta = ROLE_METADATA[user.role];
    if (!roleMeta) return false;
    return roleMeta.allowedModules.includes(module);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      currentRole: user.role,
      isAuthenticated: !!user && !!token,
      switchRole,
      login,
      logout,
      hasRole,
      canAccess,
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
