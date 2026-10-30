import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; full_name: string; phone?: string; role?: UserRole }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AUTH_STORAGE_KEY = 'itaclean_auth_user_v1';

const DEMO_ADMIN_USER: UserProfile = {
  id: 'usr-admin-01',
  email: 'admin@itaclean.com.br',
  full_name: 'Administrador Itaclean',
  phone: '(73) 4141-9517',
  document_type: 'CNPJ',
  document_number: '38.452.190/0001-44',
  company_name: 'Itaclean Produtos de Limpeza e Descartáveis',
  role: 'admin',
  created_at: new Date().toISOString(),
};

const DEMO_CUSTOMER_USER: UserProfile = {
  id: 'usr-cust-01',
  email: 'compras@condominiopassaro.com.br',
  full_name: 'Carlos Alberto (Síndico)',
  phone: '(73) 98877-6655',
  document_type: 'CPF',
  document_number: '123.456.789-00',
  role: 'customer',
  created_at: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  // Check Supabase session if configured
  useEffect(() => {
    const client = supabase;
    if (isSupabaseConfigured && client) {
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          // Check role in user_roles table
          client
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle()
            .then(({ data: roleData }) => {
              const role: UserRole = roleData?.role || 'customer';
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.user_metadata?.full_name || 'Cliente Itaclean',
                role,
                created_at: session.user.created_at,
              });
            });
        }
      });
    }
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle();

        const loggedUser: UserProfile = {
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name || email.split('@')[0],
          role: roleData?.role || 'customer',
          created_at: data.user.created_at,
        };
        setUser(loggedUser);
        setIsLoading(false);
        return { success: true };
      }

      // Offline / Demo auth
      if (email.toLowerCase().includes('admin')) {
        setUser(DEMO_ADMIN_USER);
      } else {
        setUser({
          ...DEMO_CUSTOMER_USER,
          email,
          full_name: email.split('@')[0],
        });
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Falha na autenticação' };
    }
  };

  const register = async (data: {
    email: string;
    full_name: string;
    phone?: string;
    role?: UserRole;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: data.email,
      full_name: data.full_name,
      phone: data.phone,
      role: data.role || 'customer',
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
    setIsLoading(false);
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (role === 'admin') {
      setUser(DEMO_ADMIN_USER);
    } else {
      setUser(DEMO_CUSTOMER_USER);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
