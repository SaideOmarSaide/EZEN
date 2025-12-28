
import React, { useState, useEffect, useMemo } from 'react';
import { User, Sale, Payable, Receivable, CashMovement } from '../types';
import { Sidebar } from '../components/Sidebar';
import { Repository } from '../db/repository';

const salesRepo = new Repository<Sale>('sales');
const payableRepo = new Repository<Payable>('payables');
const receivableRepo = new Repository<Receivable>('receivables');
const movementRepo = new Repository<CashMovement>('cash_movements');

export const DashboardView = ({ user, setView, isOnline, isSyncing, handleLogout }: any) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [payables, setPayables] = useState<Payable[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      const [s, p, r, m] = await Promise.all([
        salesRepo.getAll(),
        payableRepo.getAll(),
        receivableRepo.getAll(),
        movementRepo.getAll()
      ]);
      setSales(s || []);
      setPayables(p || []);
      setReceivables(r || []);
      setMovements(m || []);
      setLoading(false);
    }
    loadAllData();
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    const totalSales = sales.reduce((acc, curr) => acc + (curr.total ?? 0), 0);
    const todaySales = sales
      .filter(s => s.createdAt.startsWith(today))
      .reduce((acc, curr) => acc + (curr.total ?? 0), 0);

    const pendingPayables = payables
      .filter(p => p.status !== 'paid')
      .reduce((acc, curr) => acc + (curr.amount ?? 0), 0);

    const pendingReceivables = receivables
      .filter(r => r.status !== 'received')
      .reduce((acc, curr) => acc + (curr.amount ?? 0), 0);

    const totalEntrances = movements
      .filter(m => m.type === 'entrance')
      .reduce((acc, curr) => acc + (curr.amount ?? 0), 0);

    const totalExits = movements
      .filter(m => m.type === 'exit')
      .reduce((acc, curr) => acc + (curr.amount ?? 0), 0);

    const projectedBalance = (totalSales + totalEntrances + pendingReceivables) - (pendingPayables + totalExits);

    return { 
      totalSales, 
      todaySales, 
      pendingPayables, 
      pendingReceivables,
      projectedBalance,
      salesCount: sales.filter(s => s.createdAt.startsWith(today)).length
    };
  }, [sales, payables, receivables, movements]);

  const recentActivities = useMemo(() => {
    const combined = [
      ...sales.map(s => ({ ...s, activityType: 'sale' })),
      ...payables.map(p => ({ ...p, activityType: 'payable' })),
      ...movements.map(m => ({ ...m, activityType: 'movement' }))
    ];
    return combined.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10);
  }, [sales, payables, movements]);



  if (loading) {
    return (
      <div className="flex h-screen w-full bg-background-dark items-center justify-center">
        <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display overflow-hidden text-white">
      <Sidebar 
        activeView="dashboard" 
        setView={setView} 
        userName={user.name} 
        handleLogout={handleLogout}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isOnline={isOnline}
        isSyncing={isSyncing}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-y-auto p-4 lg:p-8">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="size-10 flex items-center justify-center rounded-xl bg-surface-highlight/50 text-white border border-border-dark"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">storefront</span>
            </div>
            <span className="font-bold text-sm tracking-tight">Dashboard</span>
          </div>
          <div className="size-10"></div> {/* Spacer to center title */}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <h1 className="text-white text-3xl font-black tracking-tight">Painel de Controle</h1>
            <p className="text-text-secondary text-sm">Olá, {user.name.split(' ')[0]}. Aqui está o resumo de hoje.</p>
          </div>
          <button onClick={() => setView('cashier')} className="w-full sm:w-auto px-6 py-4 bg-primary text-background-dark rounded-xl text-sm font-black flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined">point_of_sale</span> ABRIR CAIXA
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="payments" label="Vendas de Hoje" value={`${(stats.todaySales ?? 0).toLocaleString('pt-MZ')} MT`} trend={`${stats.salesCount} vendas`} color="primary" />
          <StatCard icon="pending_actions" label="Contas a Pagar" value={`${(stats.pendingPayables ?? 0).toLocaleString('pt-MZ')} MT`} trend="pendente" color="red" />
          <StatCard icon="group" label="Fiados" value={`${(stats.pendingReceivables ?? 0).toLocaleString('pt-MZ')} MT`} trend="em aberto" color="yellow" />
          <StatCard icon="account_balance" label="Saldo Projetado" value={`${(stats.projectedBalance ?? 0).toLocaleString('pt-MZ')} MT`} trend="Total" color="blue" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface-dark border border-border-dark rounded-2xl p-5 sm:p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span> Atividades Recentes
            </h3>
            <div className="space-y-3">
               {recentActivities.length === 0 ? (
                 <p className="text-text-secondary text-sm italic py-8 text-center bg-background-dark/20 rounded-xl">Nenhuma movimentação registrada.</p>
               ) : recentActivities.map((item: any) => (
                 <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-background-dark/30 border border-white/5 hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${
                        item.activityType === 'sale' ? 'bg-primary/10 text-primary' : 
                        item.activityType === 'payable' ? 'bg-red-500/10 text-red-400' : 
                        item.type === 'entrance' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
                      }`}>
                        <span className="material-symbols-outlined text-xl">
                          {item.activityType === 'sale' ? 'shopping_bag' : item.activityType === 'payable' ? 'receipt_long' : 'sync_alt'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{item.itemDescription || item.description || item.supplierName}</p>
                        <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tight">{new Date(item.createdAt).toLocaleTimeString('pt-MZ')}</p>
                      </div>
                    </div>
                    <p className={`font-black shrink-0 ml-2 ${
                      item.activityType === 'sale' || (item.activityType === 'movement' && item.type === 'entrance') ? 'text-primary' : 'text-red-400'
                    }`}>
                      {item.activityType === 'sale' || (item.activityType === 'movement' && item.type === 'entrance') ? '+' : '-'}
                      {(item.total ?? item.amount ?? 0).toLocaleString('pt-MZ')}
                    </p>
                 </div>
               ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 size-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
              <h3 className="text-lg font-bold mb-1">Resumo Total</h3>
              <p className="text-xs text-text-secondary mb-6 font-bold uppercase tracking-widest">Mantenha o foco nos seus números.</p>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                   <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">Vendas Acumuladas</p>
                   <p className="text-2xl font-black text-white">{(stats.totalSales ?? 0).toLocaleString('pt-MZ')} MT</p>
                </div>
                <div className="p-4 rounded-xl bg-red-400/5 border border-red-400/10">
                   <p className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-1">Compromissos</p>
                   <p className="text-2xl font-black text-white">{(stats.pendingPayables ?? 0).toLocaleString('pt-MZ')} MT</p>
                </div>
              </div>
            </div>

            <div className="bg-surface-highlight/20 border border-border-dark rounded-2xl p-6">
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">verified</span>
                    Gestão Inteligente
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                    Seus dados estão sendo salvos localmente e serão sincronizados assim que houver conexão.
                </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend, color }: any) => {
  const colorMap: any = {
    primary: "text-primary bg-primary/10 border-primary/20",
    red: "text-red-400 bg-red-400/10 border-red-400/20",
    yellow: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/20"
  };
  return (
    <div className="bg-surface-dark border border-border-dark rounded-2xl p-5 hover:border-primary/30 transition-all group shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.primary}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-white/5 uppercase tracking-tighter text-text-secondary border border-white/5">{trend}</span>
      </div>
      <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="text-white text-xl font-black group-hover:text-primary transition-colors truncate">{value}</p>
    </div>
  );
};
