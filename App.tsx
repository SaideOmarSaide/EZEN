
import React, { useState, useEffect } from 'react';
import { User } from './types';
import { SyncManager } from './sync/syncManager';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { SuppliersView } from './views/SuppliersView';
import { PayablesView } from './views/PayablesView';
import { ReceivablesView } from './views/ReceivablesView';
import { CashierView } from './views/CashierView';
import { ReportsView } from './views/ReportsView';
import { LandingView } from './views/LandingView';
import { FinancialEducationView } from './views/FinancialEducationView';
import { CashierHistoryView } from './views/CashierHistoryView';
import { supabase } from './lib/supabase';

type ViewName = 'dashboard' | 'reports' | 'cashier' | 'receivables' | 'payables' | 'suppliers' | 'financial_education' | 'cashier_history';

type View =
  | { name: 'dashboard' }
  | { name: 'reports' }
  | { name: 'cashier' }
  | { name: 'receivables' }
  | { name: 'payables' }
  | { name: 'suppliers' }
  | { name: 'financial_education' }
  | { name: 'cashier_history' };

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setViewInternal] = useState<View>({ name: 'dashboard' });
  const [unauthView, setUnauthView] = useState<'landing' | 'auth'>('landing');
  const [initialAuthMode, setInitialAuthMode] = useState<'login' | 'register'>('login');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const setView = (newView: View | ViewName) => {
    if (typeof newView === 'string') {
      // Handle simple string-based navigation for backward compatibility
      setViewInternal({ name: newView } as View);
    } else {
      // Handle object-based navigation
      setViewInternal(newView);
    }
  };

  useEffect(() => {
    // Gerenciador de status da Sincronização
    SyncManager.onSyncStatusChange = setIsSyncing;
    
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    
    // Verificar sessão ativa no Supabase
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fix: Cast as User to ensure syncStatus matches literal type constraints
        setCurrentUser({
          id: session.user.id,
          name: session.user.user_metadata.full_name || 'Usuário',
          email: session.user.email!,
          createdAt: session.user.created_at,
          updatedAt: new Date().toISOString(),
          syncStatus: 'synced'
        } as User);
        // Iniciar sincronização completa
        SyncManager.sync();
      } else {
        // Tentar recuperar do localStorage se estiver offline (cache local)
        const savedUser = localStorage.getItem('finmanager_user');
        if (savedUser) {
          try {
            setCurrentUser(JSON.parse(savedUser));
          } catch (e) {
            localStorage.removeItem('finmanager_user');
          }
        }
      }
      setIsInitializing(false);
    }

    checkSession();

    // Ouvir mudanças na autenticação (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          name: session.user.user_metadata.full_name || 'Usuário',
          email: session.user.email!,
          createdAt: session.user.created_at,
          updatedAt: new Date().toISOString(),
          syncStatus: 'synced'
        };
        setCurrentUser(user);
        localStorage.setItem('finmanager_user', JSON.stringify(user));
      } else {
        setCurrentUser(null);
        localStorage.removeItem('finmanager_user');
      }
    });

    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
      subscription.unsubscribe();
      SyncManager.onSyncStatusChange = null;
    };
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('finmanager_user', JSON.stringify(user));
    setView('dashboard');
    SyncManager.sync(); // Trigger sync after login
  };

  const startAuth = (mode: 'login' | 'register' = 'login') => {
    setInitialAuthMode(mode);
    setUnauthView('auth');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // The onAuthStateChange listener in the useEffect hook will automatically
    // handle clearing currentUser and localStorage, and the UI will update accordingly.
    // No explicit window.location.reload() or localStorage.removeItem() is needed here.
  };

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full bg-background-dark items-center justify-center">
        <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!currentUser) {
    if (unauthView === 'landing') {
      return <LandingView onStartAuth={startAuth} />;
    }
    return (
      <AuthView 
        onLoginSuccess={handleLoginSuccess} 
        isOnline={isOnline} 
        initialMode={initialAuthMode}
        onBack={() => setUnauthView('landing')}
      />
    );
  }

  const renderView = () => {
    const commonProps = {
      user: currentUser,
      isOnline,
      isSyncing,
      setView,
      handleLogout
    };
    switch (view.name) {
      case 'dashboard': return <DashboardView {...commonProps} />;
      case 'suppliers': return <SuppliersView {...commonProps} />;
      case 'payables': return <PayablesView {...commonProps} />;
      case 'receivables': return <ReceivablesView {...commonProps} />;
      case 'cashier': return <CashierView {...commonProps} />;
      case 'reports': return <ReportsView {...commonProps} />;
      case 'financial_education': return <FinancialEducationView {...commonProps} />;
      case 'cashier_history': return <CashierHistoryView {...commonProps} />;
      default: return <DashboardView {...commonProps} />;
    }
  };

  return renderView();
}
