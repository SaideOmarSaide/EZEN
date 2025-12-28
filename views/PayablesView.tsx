
import React, { useState, useEffect, useRef } from 'react';
import { Payable, User, Supplier } from '../types';
import { Repository } from '../db/repository';
import { SyncManager } from '../sync/syncManager';
import { Sidebar } from '../components/Sidebar';

const payableRepo = new Repository<Payable>('payables');
const supplierRepo = new Repository<Supplier>('suppliers');

export const PayablesView = ({ user, setView, isOnline, isSyncing, handleLogout }: any) => {
  const [payables, setPayables] = useState<Payable[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [isDeletePayableModalOpen, setIsDeletePayableModalOpen] = useState(false);
  const [payableToDeleteId, setPayableToDeleteId] = useState<string | null>(null);

  const [supplierSearch, setSupplierSearch] = useState('');
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    loadData();
    loadSuppliers();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSupplierDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    const all = await payableRepo.getAll();
    setPayables(all.sort((a, b) => a.dueDate.localeCompare(b.dueDate)));
  };

  const loadSuppliers = async () => {
    const all = await supplierRepo.getAll();
    setSuppliers(all);
  };

  const handleAddPayable = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSaving) return;
    
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await payableRepo.save({
        supplierName: supplierSearch || (formData.get('fornecedor') as string),
        description: formData.get('descricao') as string,
        amount: parseFloat(formData.get('valor') as string),
        dueDate: formData.get('vencimento') as string,
        status: 'pending',
        notes: formData.get('notas') as string
      });
      
      setIsModalOpen(false);
      setSupplierSearch('');
      await loadData();
      SyncManager.sync();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    await payableRepo.update(id, { status: 'paid' });
    await loadData();
    SyncManager.sync();
  };

  const handleDeletePayable = (id: string) => {
    setPayableToDeleteId(id);
    setIsDeletePayableModalOpen(true);
  };

  const confirmDeletePayable = async () => {
    if (!payableToDeleteId || isSaving) return;
    setIsSaving(true);
    try {
      await payableRepo.delete(payableToDeleteId);
      setIsDeletePayableModalOpen(false);
      setPayableToDeleteId(null);
      await loadData();
      SyncManager.sync();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(supplierSearch.toLowerCase())
  ).slice(0, 5);


  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display overflow-hidden text-white">
      <Sidebar 
        activeView="payables" 
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
            <div className="size-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
            <span className="font-bold text-sm tracking-tight">Contas a Pagar</span>
          </div>
          <div className="size-10"></div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-border-dark pb-4 gap-4">
          <div className="hidden sm:block">
            <h1 className="text-3xl font-bold text-white tracking-tight">Contas a Pagar</h1>
            <p className="text-text-secondary">Gestão de obrigações e despesas</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-primary text-background-dark px-6 py-2.5 rounded-xl font-black text-sm hover:bg-primary-hover shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">add_card</span>
            NOVA CONTA
          </button>
        </div>

        <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#152a1d] text-text-secondary font-medium border-b border-border-dark">
                <tr>
                  <th className="px-6 py-4">Vencimento</th>
                  <th className="px-6 py-4">Fornecedor</th>
                  <th className="px-6 py-4 hidden md:table-cell">Descrição</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark text-white">
                {payables.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-text-secondary italic">Nenhuma conta pendente registrada.</td></tr>
                ) : payables.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-gray-400">{new Date(p.dueDate).toLocaleDateString('pt-MZ')}</td>
                    <td className="px-6 py-4 font-bold">
                      {p.supplierName}
                      <p className="md:hidden text-[10px] text-gray-500 font-normal">{p.description}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-300 hidden md:table-cell">{p.description}</td>
                    <td className="px-6 py-4 text-right font-bold text-red-400">{(p.amount ?? 0).toLocaleString('pt-MZ')} MT</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${p.status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                        {p.status === 'paid' ? 'PAGO' : 'PENDENTE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.status !== 'paid' && (
                          <button onClick={() => handleMarkAsPaid(p.id)} className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors" title="Marcar como Pago">
                            <span className="material-symbols-outlined">check_circle</span>
                          </button>
                        )}
                        <button onClick={() => handleDeletePayable(p.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors" title="Excluir">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
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
          <form onSubmit={handleAddPayable} className="bg-surface-dark w-full max-w-lg my-8 rounded-2xl border border-border-dark shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border-dark bg-[#152a1d] flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">payments</span>
                Nova Conta a Pagar
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-white" disabled={isSaving}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1 relative" ref={dropdownRef}>
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Fornecedor</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary text-sm">search</span>
                  <input 
                    required 
                    name="fornecedor" 
                    autoComplete="off"
                    value={supplierSearch}
                    onChange={(e) => {
                      setSupplierSearch(e.target.value);
                      setShowSupplierDropdown(true);
                    }}
                    onFocus={() => setShowSupplierDropdown(true)}
                    className="w-full bg-background-dark border border-border-dark rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary placeholder:text-gray-600" 
                    placeholder="Busque ou digite o nome..." 
                    disabled={isSaving} 
                  />
                </div>
                {showSupplierDropdown && supplierSearch.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-surface-highlight border border-border-dark rounded-xl shadow-2xl overflow-hidden">
                    {filteredSuppliers.length > 0 ? (
                      <div className="py-1">
                        {filteredSuppliers.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSupplierSearch(s.name);
                              setShowSupplierDropdown(false);
                            }}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between group"
                          >
                            <span className="font-bold">{s.name}</span>
                            <span className="text-[10px] opacity-0 group-hover:opacity-100 uppercase font-black text-primary">Selecionar</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-xs text-text-secondary italic">Não encontrado.</div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Descrição</label>
                <input required name="descricao" className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary" placeholder="Ex: Fatura de Energia" disabled={isSaving} />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Valor (MT)</label>
                  <input required name="valor" type="number" step="0.01" className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary font-bold" placeholder="0.00" disabled={isSaving} />
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
                {isSaving ? 'SALVANDO...' : 'SALVAR CONTA'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CONFIRMAÇÃO DE EXCLUSÃO DE CONTA A PAGAR */}
      {isDeletePayableModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background-dark/90 backdrop-blur-md p-4">
          <div className="bg-surface-dark w-full max-w-md rounded-3xl border border-border-dark shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-border-dark bg-red-500/10 flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-red-400">
                <span className="material-symbols-outlined">delete_forever</span>
                Confirmar Exclusão
              </h3>
              <button type="button" onClick={() => setIsDeletePayableModalOpen(false)} className="text-text-secondary hover:text-white p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 text-center">
              <p className="text-text-secondary mb-8">Tem a certeza que quer excluir esta conta a pagar? Esta ação é irreversível.</p>
            </div>
            <div className="p-6 bg-[#152a1d]/50 border-t border-border-dark grid grid-cols-2 gap-4">
              <button onClick={() => setIsDeletePayableModalOpen(false)} className="w-full bg-white/5 text-white py-4 rounded-2xl font-black text-base hover:bg-white/10 transition-colors" disabled={isSaving}>
                CANCELAR
              </button>
              <button onClick={confirmDeletePayable} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-transform" disabled={isSaving}>
                {isSaving ? 'A EXCLUIR...' : 'SIM, EXCLUIR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
