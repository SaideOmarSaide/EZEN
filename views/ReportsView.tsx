
import React, { useState } from 'react';
import { User } from '../types';
import { Sidebar } from '../components/Sidebar';

export const ReportsView = ({ user, setView, isOnline, isSyncing, handleLogout }: any) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display overflow-hidden text-white">
      <Sidebar 
        activeView="reports" 
        setView={setView} 
        userName={user.name} 

        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isOnline={isOnline}
        isSyncing={isSyncing}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-y-auto p-4 lg:p-8 gap-6">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-2 lg:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="size-10 flex items-center justify-center rounded-xl bg-surface-highlight/50 text-white border border-border-dark"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <span className="material-symbols-outlined text-xl">analytics</span>
            </div>
            <span className="font-bold text-sm tracking-tight">Relatórios</span>
          </div>
          <div className="size-10"></div>
        </div>

        <div className="border-b border-border-dark pb-4 mb-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">Relatórios Financeiros</h1>
          <p className="text-text-secondary text-sm">Análise de desempenho e saúde do negócio</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-surface-dark border border-border-dark p-6 rounded-2xl shadow-xl">
              <h3 className="font-bold text-primary mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
                <span className="material-symbols-outlined text-sm">trending_up</span> Vendas por Período
              </h3>
              <div className="h-48 bg-background-dark/30 rounded-xl flex items-end justify-around p-6 gap-2 border border-white/5">
                 {[40, 70, 45, 90, 65, 80].map((h, i) => (
                   <div key={i} className="group relative flex-1 flex flex-col items-center">
                     <div className="bg-primary/40 w-full rounded-t-lg transition-all hover:bg-primary/60 cursor-pointer" style={{height: `${h}%`}}></div>
                     <span className="absolute -top-6 text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">MT {h * 10}</span>
                   </div>
                 ))}
              </div>
              <div className="flex justify-between mt-3 text-[10px] text-gray-500 font-bold px-2 uppercase tracking-tighter">
                <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span>
              </div>
           </div>

           <div className="bg-surface-dark border border-border-dark p-6 rounded-2xl shadow-xl">
              <h3 className="font-bold text-red-400 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
                <span className="material-symbols-outlined text-sm">pie_chart</span> Despesas por Categoria
              </h3>
              <div className="space-y-4 pt-2">
                 {[
                   {label: 'Aluguel', value: 45, color: 'bg-red-400'},
                   {label: 'Fornecedores', value: 30, color: 'bg-orange-400'},
                   {label: 'Salários', value: 15, color: 'bg-blue-400'},
                   {label: 'Outros', value: 10, color: 'bg-gray-400'}
                 ].map((item, idx) => (
                   <div key={idx} className="space-y-1.5">
                     <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                       <span className="text-text-secondary">{item.label}</span>
                       <span className="text-white">{item.value}%</span>
                     </div>
                     <div className="w-full bg-background-dark/50 rounded-full h-2 border border-white/5 overflow-hidden">
                       <div className={`${item.color} h-full rounded-full transition-all`} style={{width: `${item.value}%`}}></div>
                     </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
           <div className="bg-surface-highlight/20 border border-border-dark p-6 rounded-2xl text-center">
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2">Ticket Médio</p>
              <p className="text-2xl font-black">450 MT</p>
           </div>
           <div className="bg-surface-highlight/20 border border-border-dark p-6 rounded-2xl text-center">
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2">Vendas/Mês</p>
              <p className="text-2xl font-black">1.240</p>
           </div>
           <div className="bg-surface-highlight/20 border border-border-dark p-6 rounded-2xl text-center">
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2">Taxa Fiado</p>
              <p className="text-2xl font-black text-orange-400">12%</p>
           </div>
        </div>
      </main>
    </div>
  );
};
