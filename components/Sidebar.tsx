
import React from 'react';
import { Logo } from './Logo';
import { SyncManager } from '../sync/syncManager';

interface SidebarProps {
  activeView: string;
  setView: (view: 'dashboard' | 'reports' | 'cashier' | 'receivables' | 'payables' | 'suppliers' | 'financial_education') => void;
  userName: string;
  handleLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isOnline: boolean;
  isSyncing: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  setView, 
  userName, 
  handleLogout, 
  isOpen = false, 
  onClose,
  isOnline,
  isSyncing
}) => {
  const handleNavClick = (view: any) => {
    setView(view);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Overlay para Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[70] bg-background-dark/80 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-[80] w-72 bg-background-dark border-r border-border-dark 
        transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:flex lg:w-64 lg:flex-col shrink-0
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Logo size={36} className="text-primary" />
                <div className="flex flex-col">
                  <h1 className="text-white text-base font-bold tracking-tight">EZEN</h1>
                  <p className="text-text-secondary text-[10px] font-bold uppercase tracking-wider">{userName}</p>
                </div>
              </div>
              
              {/* Botão de fechar (apenas mobile) */}
              <button 
                onClick={onClose}
                className="lg:hidden text-text-secondary hover:text-white p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <nav className="flex flex-col gap-1.5 mt-4">
              <NavItem icon="dashboard" label="Visão Geral" active={activeView === 'dashboard'} onClick={() => handleNavClick('dashboard')} />
              <NavItem icon="storefront" label="Caixa Diário" active={activeView === 'cashier'} onClick={() => handleNavClick('cashier')} />
              <NavItem icon="payments" label="Contas a Pagar" active={activeView === 'payables'} onClick={() => handleNavClick('payables')} />
              <NavItem icon="group" label="Contas a Receber" active={activeView === 'receivables'} onClick={() => handleNavClick('receivables')} />
              <NavItem icon="business_center" label="Fornecedores" active={activeView === 'suppliers'} onClick={() => handleNavClick('suppliers')} />
              <NavItem icon="analytics" label="Relatórios" active={activeView === 'reports'} onClick={() => handleNavClick('reports')} />
              <NavItem icon="school" label="Educação Financeira" active={activeView === 'financial_education'} onClick={() => handleNavClick('financial_education')} />
            </nav>
          </div>

          <div className="px-2 border-t border-border-dark pt-4">
            <SyncStatus isOnline={isOnline} isSyncing={isSyncing} />
            <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-3 rounded-xl text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors mt-2">
              <span className="material-symbols-outlined">logout</span>
              <span className="text-sm font-bold uppercase tracking-tighter">Sair do Sistema</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

const NavItem = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`
      flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all relative group
      ${active 
        ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(19,236,91,0.2)]' 
        : 'text-text-secondary hover:bg-surface-dark hover:text-white'
      }
    `}
  >
    {active && <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full"></div>}
    <span className="material-symbols-outlined">{icon}</span>
    <span className="text-sm font-bold tracking-tight">{label}</span>
  </button>
);

const SyncStatus = ({ isOnline, isSyncing }: { isOnline: boolean, isSyncing: boolean }) => {
  const getStatus = () => {
    if (isSyncing) return {
      text: 'Sincronizando...',
      icon: 'sync',
      color: 'text-blue-400',
      pulse: true
    };
    if (isOnline) return {
      text: 'Sincronizado',
      icon: 'cloud_done',
      color: 'text-primary',
      pulse: false
    };
    return {
      text: 'Offline',
      icon: 'cloud_off',
      color: 'text-orange-400',
      pulse: false
    };
  };

  const status = getStatus();

  return (
    <div className="p-3 rounded-xl bg-surface-highlight/30 mb-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-text-secondary font-black uppercase mb-1">Status</p>
        <button 
          onClick={() => SyncManager.sync()} 
          disabled={isSyncing || !isOnline}
          className="text-text-secondary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={`material-symbols-outlined text-base ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className={`size-2 rounded-full ${isSyncing ? 'bg-blue-400 animate-pulse' : isOnline ? 'bg-primary' : 'bg-orange-400'}`}></div>
        <span className={`text-xs font-bold ${status.color}`}>{status.text}</span>
      </div>
      <p className="text-[9px] text-gray-600 font-bold mt-1">Última: há 2 min</p> 
    </div>
  );
};
