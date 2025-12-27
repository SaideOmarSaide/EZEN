
import React, { useState, useEffect, useMemo } from 'react';
import { CashSession, Sale, User, CashMovement } from '../types';
import { Repository } from '../db/repository';
import { SyncManager } from '../sync/syncManager';
import { Sidebar } from '../components/Sidebar';

const sessionRepo = new Repository<CashSession>('cash_sessions');
const salesRepo = new Repository<Sale>('sales');
const movementRepo = new Repository<CashMovement>('cash_movements');

export const CashierView = ({ user, setView, isOnline, isSyncing }: any) => {
  const [activeSession, setActiveSession] = useState<CashSession | null>(null);
  const [sessionSales, setSessionSales] = useState<Sale[]>([]);
  const [sessionMovements, setSessionMovements] = useState<CashMovement[]>([]);
  const [isOpeningModal, setIsOpeningModal] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [movementModal, setMovementModal] = useState<{ open: boolean, type: 'entrance' | 'exit' | null }>({ open: false, type: null });
  const [isCloseSessionModalOpen, setIsCloseSessionModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [saleQty, setSaleQty] = useState(1);
  const [salePrice, setSalePrice] = useState(0);

  useEffect(() => { loadSession(); }, []);

  const loadSession = async () => {
    const allSessions = await sessionRepo.getAll();
    const open = allSessions.find(s => s.status === 'open');
    setActiveSession(open || null);
    
    if (open) {
      const [allSales, allMovements] = await Promise.all([
        salesRepo.getAll(),
        movementRepo.getAll()
      ]);
      
      const filteredSales = allSales.filter(s => s.createdAt >= open.openingTime);
      const filteredMovements = allMovements.filter(m => m.sessionId === open.id || m.createdAt >= open.openingTime);
      
      setSessionSales(filteredSales);
      setSessionMovements(filteredMovements);
    } else {
      setSessionSales([]);
      setSessionMovements([]);
    }
  };

  const handleOpenCash = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);
    const formData = new FormData(e.currentTarget);
    try {
      await sessionRepo.save({
        operatorName: user.name,
        openingBalance: parseFloat(formData.get('saldo') as string),
        status: 'open',
        openingTime: new Date().toISOString(),
        notes: formData.get('notas') as string
      });
      setIsOpeningModal(false);
      await loadSession();
      SyncManager.sync();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewSale = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isProcessing || !activeSession) return;
    setIsProcessing(true);
    const formData = new FormData(e.currentTarget);
    try {
      await salesRepo.save({
        itemDescription: formData.get('descricao') as string,
        quantity: saleQty,
        unitPrice: salePrice,
        total: saleQty * salePrice,
        paymentMethod: formData.get('metodo') as any
      });
      setIsSaleModalOpen(false);
      setSaleQty(1);
      setSalePrice(0);
      await loadSession();
      SyncManager.sync();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMovement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isProcessing || !activeSession || !movementModal.type) return;
    setIsProcessing(true);
    const formData = new FormData(e.currentTarget);
    try {
      await movementRepo.save({
        sessionId: activeSession.id,
        type: movementModal.type,
        description: formData.get('descricao') as string,
        category: formData.get('categoria') as string,
        amount: parseFloat(formData.get('valor') as string)
      });
      setMovementModal({ open: false, type: null });
      await loadSession();
      SyncManager.sync();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseCash = async () => {
    if (isProcessing || !activeSession) return;
    setIsProcessing(true);
    try {
      await sessionRepo.update(activeSession!.id, { status: 'closed', closingTime: new Date().toISOString() });
      setIsCloseSessionModalOpen(false);
      await loadSession();
      SyncManager.sync();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const totals = useMemo(() => {
    const salesInCash = sessionSales.filter(s => s.paymentMethod === 'cash').reduce((a, c) => a + (c.total ?? 0), 0);
    const otherSales = sessionSales.filter(s => s.paymentMethod !== 'cash').reduce((a, c) => a + (c.total ?? 0), 0);
    const entrances = sessionMovements.filter(m => m.type === 'entrance').reduce((a, c) => a + (c.amount ?? 0), 0);
    const exits = sessionMovements.filter(m => m.type === 'exit').reduce((a, c) => a + (c.amount ?? 0), 0);
    const inDrawer = (activeSession?.openingBalance ?? 0) + salesInCash + entrances - exits;

    return { salesInCash, otherSales, entrances, exits, inDrawer };
  }, [sessionSales, sessionMovements, activeSession]);

  const combinedActivities = useMemo(() => {
    const activities = [
      ...sessionSales.map(s => ({ ...s, activityType: 'sale' as const })),
      ...sessionMovements.map(m => ({ ...m, activityType: 'movement' as const }))
    ];
    return activities.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [sessionSales, sessionMovements]);

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display overflow-hidden text-white">
      <Sidebar 
        activeView="cashier" 
        setView={setView} 
        userName={user.name} 
        handleLogout={() => { localStorage.removeItem('finmanager_user'); window.location.reload(); }} 
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
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">storefront</span>
            </div>
            <span className="font-bold text-sm tracking-tight">Caixa Diário</span>
          </div>
          <div className="size-10"></div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-border-dark pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Caixa Diário</h1>
            <p className="text-text-secondary text-sm">Gerenciamento de fluxo de caixa em tempo real</p>
          </div>
          {activeSession && (
             <div className="flex items-center justify-between w-full sm:w-auto gap-3 bg-background-dark/30 p-2 rounded-xl border border-border-dark sm:bg-transparent sm:border-none sm:p-0">
               <div className="text-left sm:text-right">
                  <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest leading-none">Sessão Ativa</p>
                  <p className="text-xs font-bold text-white">{new Date(activeSession.openingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
               </div>
               <button onClick={() => setIsCloseSessionModalOpen(true)} className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-xs font-black hover:bg-red-500/20 transition-colors uppercase">FECHAR</button>
             </div>
          )}
        </div>

        {!activeSession ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6 bg-surface-dark/20 rounded-3xl border border-dashed border-border-dark">
             <div className="size-24 rounded-full bg-surface-dark border border-border-dark flex items-center justify-center text-primary shadow-2xl relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping"></div>
                <span className="material-symbols-outlined text-5xl relative z-10">lock_open</span>
             </div>
             <div className="max-w-xs">
                <h2 className="text-xl font-black mb-2 uppercase tracking-tight">Caixa Fechado</h2>
                <p className="text-sm text-text-secondary">Abra uma nova sessão para começar a registrar vendas e movimentações financeiras.</p>
             </div>
             <button onClick={() => setIsOpeningModal(true)} className="bg-primary text-background-dark px-10 py-4 rounded-2xl font-black text-base shadow-xl shadow-primary/20 hover:scale-105 transition-transform uppercase tracking-tighter">ABRIR CAIXA AGORA</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-surface-dark border border-border-dark rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <span className="material-symbols-outlined text-[120px]">point_of_sale</span>
                  </div>
                  <h3 className="text-center text-xl font-black mb-8 uppercase tracking-widest relative z-10">Operações de Caixa</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                    <button onClick={() => setIsSaleModalOpen(true)} className="bg-primary text-background-dark px-6 py-5 rounded-2xl font-black text-sm flex flex-col items-center gap-3 hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                      <span className="material-symbols-outlined text-3xl">add_shopping_cart</span> 
                      <span>NOVA VENDA</span>
                    </button>
                    <button onClick={() => setMovementModal({ open: true, type: 'entrance' })} className="bg-blue-500 text-white px-6 py-5 rounded-2xl font-black text-sm flex flex-col items-center gap-3 hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
                      <span className="material-symbols-outlined text-3xl">arrow_downward</span> 
                      <span>ENTRADA</span>
                    </button>
                    <button onClick={() => setMovementModal({ open: true, type: 'exit' })} className="bg-orange-500 text-white px-6 py-5 rounded-2xl font-black text-sm flex flex-col items-center gap-3 hover:scale-105 transition-transform shadow-lg shadow-orange-500/20">
                      <span className="material-symbols-outlined text-3xl">arrow_upward</span> 
                      <span>SAÍDA</span>
                    </button>
                  </div>
               </div>

               <div className="bg-surface-dark border border-border-dark rounded-3xl overflow-hidden shadow-lg">
                 <div className="px-6 py-5 border-b border-border-dark bg-[#152a1d]/50 flex justify-between items-center">
                    <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-primary">list_alt</span>
                        Atividade da Sessão
                    </h4>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-text-secondary border-b border-border-dark uppercase font-black tracking-widest">
                        <tr>
                          <th className="px-6 py-4">Hora</th>
                          <th className="px-6 py-4">Descrição</th>
                          <th className="px-6 py-4 text-right">Valor</th>
                          <th className="px-6 py-4 text-center">Tipo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-dark">
                        {combinedActivities.length === 0 ? (
                          <tr><td colSpan={4} className="px-6 py-12 text-center italic text-text-secondary bg-background-dark/10">Nenhuma movimentação registrada nesta sessão.</td></tr>
                        ) : combinedActivities.map((act: any) => (
                          <tr key={act.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4 text-gray-500 font-bold">{new Date(act.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                            <td className="px-6 py-4">
                              <p className="font-black group-hover:text-primary transition-colors">
                                {act.activityType === 'sale' ? act.itemDescription : act.description}
                              </p>
                              {act.activityType === 'sale' && <p className="text-[10px] text-gray-500 font-bold uppercase">{act.quantity} unidade(s) • {(act.unitPrice ?? 0).toLocaleString()} MT</p>}
                            </td>
                            <td className={`px-6 py-4 text-right font-black text-sm ${act.activityType === 'movement' && act.type === 'exit' ? 'text-red-400' : 'text-primary'}`}>
                              {(act.total ?? act.amount ?? 0).toLocaleString('pt-MZ')}
                            </td>
                            <td className="px-6 py-4 text-center">
                               <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${act.activityType === 'sale' ? 'bg-primary/5 text-primary border-primary/20' : act.type === 'entrance' ? 'bg-blue-500/5 text-blue-400 border-blue-500/20' : 'bg-red-500/5 text-red-400 border-red-500/20'}`}>
                                 {act.activityType === 'sale' ? 'VENDA' : act.type === 'entrance' ? 'ENTRADA' : 'SAÍDA'}
                               </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               </div>
            </div>

            <div className="space-y-6">
               <div className="bg-surface-dark border border-border-dark rounded-3xl p-6 lg:sticky lg:top-8 shadow-2xl">
                  <h4 className="text-[10px] font-black text-text-secondary uppercase mb-6 tracking-[0.2em] flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">analytics</span>
                    Balanço Atual
                  </h4>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center pb-3 border-b border-border-dark">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Fundo de Caixa</span>
                        <span className="font-black">{(activeSession?.openingBalance ?? 0).toLocaleString('pt-MZ')} MT</span>
                     </div>
                     <div className="flex justify-between items-center pb-3 border-b border-border-dark">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Vendas (Cash)</span>
                        <span className="font-black text-primary">+{(totals.salesInCash ?? 0).toLocaleString('pt-MZ')} MT</span>
                     </div>
                     <div className="flex justify-between items-center pb-3 border-b border-border-dark">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Entradas Avulsas</span>
                        <span className="font-black text-blue-400">+{(totals.entrances ?? 0).toLocaleString('pt-MZ')} MT</span>
                     </div>
                     <div className="flex justify-between items-center pb-3 border-b border-border-dark">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Saídas/Sangrias</span>
                        <span className="font-black text-red-400">-{(totals.exits ?? 0).toLocaleString('pt-MZ')} MT</span>
                     </div>
                     <div className="p-5 mt-6 rounded-2xl bg-primary/5 border border-primary/20 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary/30"></div>
                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] block mb-2">Dinheiro em Gaveta</span>
                        <span className="text-3xl font-black text-primary group-hover:scale-110 transition-transform inline-block">{(totals.inDrawer ?? 0).toLocaleString('pt-MZ')} MT</span>
                     </div>
                     
                     <div className="pt-4 mt-2">
                        <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase">
                           <span>Outros Métodos (M-Pesa/Transf.)</span>
                           <span className="text-white">{(totals.otherSales ?? 0).toLocaleString('pt-MZ')} MT</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-surface-highlight/10 border border-border-dark rounded-3xl p-6">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs">info</span>
                        Sessão
                    </h5>
                    <div className="flex justify-between text-xs items-center">
                        <span className="text-gray-500 font-bold uppercase">Operador Responsável</span>
                        <span className="text-white font-black bg-white/5 px-2 py-1 rounded">{user.name.split(' ')[0]}</span>
                    </div>
               </div>
            </div>
          </div>
        )}
      </main>
      
      {/* MODAL: ABERTURA DE CAIXA */}
      {isOpeningModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background-dark/90 backdrop-blur-md p-4">
          <form onSubmit={handleOpenCash} className="bg-surface-dark w-full max-w-md rounded-3xl border border-border-dark shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-border-dark bg-[#152a1d] flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-tight">Iniciar Sessão de Caixa</h3>
              <button type="button" onClick={() => setIsOpeningModal(false)} className="text-text-secondary hover:text-white p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest pl-1">Saldo Inicial / Troco (MT)</label>
                <input required name="saldo" type="number" step="0.01" className="w-full bg-background-dark border border-border-dark rounded-2xl px-5 py-4 text-white text-xl font-black focus:border-primary focus:ring-1 focus:ring-primary shadow-inner" placeholder="0.00" autoFocus />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest pl-1">Observações de Abertura</label>
                <textarea name="notas" className="w-full bg-background-dark border border-border-dark rounded-2xl px-5 py-4 text-white h-24 resize-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner" placeholder="Opcional: Detalhes do turno ou contagem inicial..."></textarea>
              </div>
            </div>
            <div className="p-6 bg-[#152a1d]/50 border-t border-border-dark">
              <button type="submit" className="w-full bg-primary text-background-dark py-5 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform" disabled={isProcessing}>
                {isProcessing ? 'PROCESSANDO...' : 'ABRIR CAIXA AGORA'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: NOVA VENDA */}
      {isSaleModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background-dark/90 backdrop-blur-md p-4">
          <form onSubmit={handleNewSale} className="bg-surface-dark w-full max-w-lg rounded-3xl border border-border-dark shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-border-dark bg-[#152a1d] flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">shopping_cart</span>
                Registrar Nova Venda
              </h3>
              <button type="button" onClick={() => setIsSaleModalOpen(false)} className="text-text-secondary hover:text-white p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest pl-1">Descrição do Item</label>
                <input required name="descricao" className="w-full bg-background-dark border border-border-dark rounded-2xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary shadow-inner" placeholder="Ex: Arroz 5kg, Coca-cola 2L..." autoFocus />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest pl-1">Quantidade</label>
                  <input 
                    required 
                    type="number" 
                    step="1" 
                    min="1" 
                    value={saleQty}
                    onChange={(e) => setSaleQty(parseInt(e.target.value) || 1)}
                    className="w-full bg-background-dark border border-border-dark rounded-2xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary shadow-inner font-bold" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest pl-1">Preço Unitário (MT)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    value={salePrice}
                    onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-background-dark border border-border-dark rounded-2xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary shadow-inner font-bold text-primary" 
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest pl-1">Método de Pagamento</label>
                <select name="metodo" className="w-full bg-background-dark border border-border-dark rounded-2xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary">
                  <option value="cash">Dinheiro (Em Mão)</option>
                  <option value="m-pesa">M-Pesa</option>
                  <option value="transfer">Transferência Bancária</option>
                </select>
              </div>

              <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 flex justify-between items-center">
                 <span className="text-xs font-black uppercase tracking-widest">Total da Venda</span>
                 <span className="text-2xl font-black text-primary">{(saleQty * salePrice).toLocaleString('pt-MZ')} MT</span>
              </div>
            </div>
            <div className="p-6 bg-[#152a1d]/50 border-t border-border-dark">
              <button type="submit" className="w-full bg-primary text-background-dark py-5 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform" disabled={isProcessing}>
                {isProcessing ? 'PROCESSANDO...' : 'FINALIZAR VENDA'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: MOVIMENTAÇÃO (ENTRADA/SAÍDA) */}
      {movementModal.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background-dark/90 backdrop-blur-md p-4">
          <form onSubmit={handleMovement} className="bg-surface-dark w-full max-w-md rounded-3xl border border-border-dark shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className={`p-6 border-b border-border-dark flex justify-between items-center ${movementModal.type === 'entrance' ? 'bg-blue-500/20' : 'bg-orange-500/20'}`}>
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined">{movementModal.type === 'entrance' ? 'arrow_downward' : 'arrow_upward'}</span>
                {movementModal.type === 'entrance' ? 'Registrar Entrada' : 'Registrar Saída / Sangria'}
              </h3>
              <button type="button" onClick={() => setMovementModal({ open: false, type: null })} className="text-text-secondary hover:text-white p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest pl-1">Valor do Lançamento (MT)</label>
                <input required name="valor" type="number" step="0.01" className={`w-full bg-background-dark border border-border-dark rounded-2xl px-5 py-4 text-2xl font-black focus:ring-1 shadow-inner ${movementModal.type === 'entrance' ? 'text-blue-400 focus:border-blue-500 focus:ring-blue-500' : 'text-orange-400 focus:border-orange-500 focus:ring-orange-500'}`} placeholder="0.00" autoFocus />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest pl-1">Motivo / Descrição</label>
                <input 
                  required 
                  name="descricao" 
                  className="w-full bg-background-dark border border-border-dark rounded-2xl px-4 py-3 text-white focus:ring-1 focus:ring-primary shadow-inner" 
                  placeholder={movementModal.type === 'entrance' 
                    ? "Ex: Suprimento de troco, Reembolso..." 
                    : "Ex: Sangria, Pagamento fornecedor, Despesa operacional..."
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest pl-1">Categoria</label>
                <select name="categoria" className="w-full bg-background-dark border border-border-dark rounded-2xl px-4 py-3 text-white">
                  {movementModal.type === 'entrance' ? (
                    <>
                      <option value="suprimento_de_troco">Suprimento de Troco</option>
                      <option value="reembolso">Reembolso</option>
                      <option value="capital_adicional">Capital Adicional</option>
                      <option value="devolucao_de_fornecedor">Devolução de Fornecedor</option>
                      <option value="outros">Outros</option>
                    </>
                  ) : (
                    <>
                      <option value="sangria">Sangria</option>
                      <option value="despesa_operacional">Despesa Operacional</option>
                      <option value="pagamento_a_fornecedor">Pagamento a Fornecedor</option>
                      <option value="vale_adiantamento">Vale/Adiantamento</option>
                      <option value="transporte">Transporte</option>
                      <option value="manutencao">Manutenção</option>
                      <option value="outros">Outros</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            <div className="p-6 bg-[#152a1d]/50 border-t border-border-dark">
              <button type="submit" className={`w-full py-5 rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] transition-transform text-white ${movementModal.type === 'entrance' ? 'bg-blue-600 shadow-blue-500/20' : 'bg-orange-600 shadow-orange-500/20'}`} disabled={isProcessing}>
                {isProcessing ? 'PROCESSANDO...' : (movementModal.type === 'entrance' ? 'CONFIRMAR ENTRADA' : 'CONFIRMAR RETIRADA')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: FECHAR CAIXA CONFIRMATION */}
      {isCloseSessionModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background-dark/90 backdrop-blur-md p-4">
          <div className="bg-surface-dark w-full max-w-md rounded-3xl border border-border-dark shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-border-dark bg-red-500/10 flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-red-400">
                <span className="material-symbols-outlined">lock</span>
                Encerrar Sessão de Caixa
              </h3>
              <button type="button" onClick={() => setIsCloseSessionModalOpen(false)} className="text-text-secondary hover:text-white p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 text-center">
              <p className="text-text-secondary mb-8">Tem a certeza que quer fechar o caixa? Esta ação irá finalizar a sessão atual e calcular o balanço final. Não poderá registrar mais vendas ou movimentações nesta sessão.</p>
            </div>
            <div className="p-6 bg-[#152a1d]/50 border-t border-border-dark grid grid-cols-2 gap-4">
              <button onClick={() => setIsCloseSessionModalOpen(false)} className="w-full bg-white/5 text-white py-4 rounded-2xl font-black text-base hover:bg-white/10 transition-colors" disabled={isProcessing}>
                CANCELAR
              </button>
              <button onClick={handleCloseCash} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-transform" disabled={isProcessing}>
                {isProcessing ? 'A FECHAR...' : 'SIM, FECHAR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
