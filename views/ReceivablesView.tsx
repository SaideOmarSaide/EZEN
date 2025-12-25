
import React, { useState, useEffect } from 'react';
import { Receivable, User } from '../types';
import { Repository } from '../db/repository';
import { SyncManager } from '../sync/syncManager';
import { Sidebar } from '../components/Sidebar';

const receivableRepo = new Repository<Receivable>('receivables');

export const ReceivablesView = ({ user, setView, isOnline, isSyncing }: any) => {
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const all = await receivableRepo.getAll();
    setReceivables(all.sort((a, b) => a.dueDate.localeCompare(b.dueDate)));
  };

  const handleAddReceivable = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSaving) return;
    
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await receivableRepo.save({
        customerName: formData.get('cliente') as string,
        description: formData.get('descricao') as string,
        amount: parseFloat(formData.get('valor') as string),
        dueDate: formData.get('vencimento') as string,
        status: 'pending',
        notes: formData.get('notas') as string
      });
      
      setIsModalOpen(false);
      await loadData();
      SyncManager.sync();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkAsReceived = async (id: string) => {
    await receivableRepo.update(id, { status: 'received' });
    await loadData();
    SyncManager.sync();
  };

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display overflow-hidden text-white">
      <Sidebar 
        activeView="receivables" 
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
              <span className="material-symbols-outlined text-xl">group</span>
            </div>
            <span className="font-bold text-sm tracking-tight">Receber / Fiados</span>
          </div>
          <div className="size-10"></div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-border-dark pb-4 gap-4">
          <div className="hidden sm:block">
            <h1 className="text-3xl font-bold text-white tracking-tight">Contas a Receber</h1>
            <p className="text-text-secondary">Controle de fiados e créditos a clientes</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-primary text-background-dark px-6 py-2.5 rounded-xl font-black text-sm hover:bg-primary-hover shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">person_add</span>
            NOVO FIADO
          </button>
        </div>

        <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#152a1d] text-text-secondary font-medium border-b border-border-dark">
                <tr>
                  <th className="px-6 py-4">Data Limite</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4 hidden md:table-cell">Descrição</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark text-white">
                {receivables.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-text-secondary italic">Nenhum fiado registrado.</td></tr>
                ) : receivables.map(r => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-gray-400">{new Date(r.dueDate).toLocaleDateString('pt-MZ')}</td>
                    <td className="px-6 py-4 font-bold">
                      {r.customerName}
                      <p className="md:hidden text-[10px] text-gray-500 font-normal">{r.description}</p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">{r.description}</td>
                    <td className="px-6 py-4 text-right font-bold text-primary">{(r.amount ?? 0).toLocaleString('pt-MZ')} MT</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${r.status === 'received' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                        {r.status === 'received' ? 'RECEBIDO' : 'PENDENTE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status !== 'received' && (
                        <button onClick={() => handleMarkAsReceived(r.id)} className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors" title="Marcar como Recebido">
                          <span className="material-symbols-outlined">payments</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background-dark/80 backdrop-blur-sm p-4 overflow-y-auto">
          <form onSubmit={handleAddReceivable} className="bg-surface-dark w-full max-w-lg my-8 rounded-2xl border border-border-dark shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border-dark bg-[#152a1d] flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person_search</span>
                Novo Registro de Fiado
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-white" disabled={isSaving}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Nome do Cliente</label>
                <input required name="cliente" className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary" placeholder="Quem está devendo?" disabled={isSaving} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Descrição</label>
                <input required name="descricao" className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary" placeholder="Ex: Compras variadas" disabled={isSaving} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Valor (MT)</label>
                  <input required name="valor" type="number" step="0.01" className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary" placeholder="0.00" disabled={isSaving} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Vencimento</label>
                  <input required name="vencimento" type="date" className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary" disabled={isSaving} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Observações</label>
                <textarea name="notas" className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary h-24 resize-none" disabled={isSaving}></textarea>
              </div>
            </div>
            <div className="p-6 bg-[#152a1d] border-t border-border-dark flex flex-col sm:flex-row justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="py-3 text-sm font-bold text-text-secondary hover:text-white" disabled={isSaving}>CANCELAR</button>
              <button type="submit" className="bg-primary text-background-dark px-8 py-3 rounded-xl font-black text-sm shadow-lg disabled:opacity-50" disabled={isSaving}>
                {isSaving ? 'REGISTRANDO...' : 'REGISTRAR FIADO'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
