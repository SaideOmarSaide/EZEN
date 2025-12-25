
import React, { useState, useEffect, useMemo } from 'react';
import { Supplier, Purchase, User, Payable } from '../types';
import { Repository } from '../db/repository';
import { SyncManager } from '../sync/syncManager';
import { Sidebar } from '../components/Sidebar';

const supplierRepo = new Repository<Supplier>('suppliers');
const purchaseRepo = new Repository<Purchase>('purchases');
const payableRepo = new Repository<Payable>('payables');

interface SuppliersViewProps {
  user: User;
  isOnline: boolean;
  isSyncing: boolean;
  setView: (view: any) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({ user, isOnline, isSyncing, setView }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [history, setHistory] = useState<{purchases: Purchase[], payables: Payable[]}>({ purchases: [], payables: [] });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => { loadSuppliers(); }, []);
  useEffect(() => { if (selectedSupplierId) loadHistory(selectedSupplierId); }, [selectedSupplierId, suppliers]);

  const loadSuppliers = async () => {
    const all = await supplierRepo.getAll();
    setSuppliers(all.sort((a, b) => a.name.localeCompare(b.name)));
  };

  const loadHistory = async (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;

    const [allPurchases, allPayables] = await Promise.all([
      purchaseRepo.getAll(),
      payableRepo.getAll()
    ]);

    setHistory({
      purchases: allPurchases.filter(p => p.supplierId === supplierId).sort((a, b) => b.date.localeCompare(a.date)),
      payables: allPayables.filter(p => p.supplierName === supplier.name).sort((a, b) => b.dueDate.localeCompare(a.dueDate))
    });
  };

  const handleAddSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await supplierRepo.save({
        name: formData.get('name') as string,
        representative: formData.get('representative') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        category: formData.get('category') as string,
        bankDetails: formData.get('bankDetails') as string,
        status: 'active'
      });
      if (form) form.reset();
      await loadSuppliers();
      SyncManager.sync();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPurchase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || !selectedSupplierId) return;
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const supplier = suppliers.find(s => s.id === selectedSupplierId)!;
    
    const qty = parseFloat(formData.get('quantity') as string);
    const price = parseFloat(formData.get('unitPrice') as string);
    const total = qty * price;
    const createPayable = formData.get('createPayable') === 'on';

    try {
      await purchaseRepo.save({
        supplierId: selectedSupplierId,
        date: new Date().toISOString(),
        description: formData.get('description') as string,
        quantity: qty,
        unitPrice: price,
        totalPrice: total,
        invoiceNumber: formData.get('invoice') as string
      });

      if (createPayable) {
        await payableRepo.save({
          supplierName: supplier.name,
          description: `Compra: ${formData.get('description')}`,
          amount: total,
          dueDate: formData.get('dueDate') as string,
          status: 'pending'
        });
      }

      setIsPurchaseModalOpen(false);
      await loadHistory(selectedSupplierId);
      SyncManager.sync();
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.representative.toLowerCase().includes(search.toLowerCase())
    );
  }, [suppliers, search]);

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  const stats = useMemo(() => {
    if (!selectedSupplier) return { total: 0, paid: 0, pending: 0 };
    const totalPurchased = history.purchases.reduce((acc, curr) => acc + (curr.totalPrice ?? 0), 0);
    const pendingAmount = history.payables.filter(p => p.status !== 'paid').reduce((acc, curr) => acc + (curr.amount ?? 0), 0);
    const paidAmount = history.payables.filter(p => p.status === 'paid').reduce((acc, curr) => acc + (curr.amount ?? 0), 0);
    return { total: totalPurchased, pending: pendingAmount, paid: paidAmount };
  }, [selectedSupplier, history]);

  const timeline = useMemo(() => {
    const items = [
      ...history.purchases.map(p => ({ ...p, type: 'PURCHASE', sortDate: p.date })),
      ...history.payables.map(p => ({ ...p, type: 'PAYMENT', sortDate: p.createdAt }))
    ];
    return items.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
  }, [history]);

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display overflow-hidden text-white">
      <Sidebar 
        activeView="suppliers" 
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
              <span className="material-symbols-outlined text-xl">business_center</span>
            </div>
            <span className="font-bold text-sm tracking-tight">Fornecedores</span>
          </div>
          <div className="size-10"></div>
        </div>

        <div className="flex justify-between items-end border-b border-border-dark pb-4">
          <div className="hidden sm:block">
            <h1 className="text-3xl font-bold text-white tracking-tight">Fornecedores</h1>
            <p className="text-text-secondary">Gestão de parceiros e suprimentos</p>
          </div>
          <div className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${isOnline ? 'text-primary border-primary/20 bg-primary/5' : 'text-orange-400 border-orange-400/20 bg-orange-400/5'}`}>
            {isOnline ? '● CONECTADO' : '○ OFFLINE'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-border-dark bg-[#152a1d]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                  <span className="material-symbols-outlined text-primary">person_add</span> Novo Fornecedor
                </h3>
              </div>
              <form onSubmit={handleAddSupplier} className="p-5 space-y-4">
                <input required name="name" className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white focus:border-primary" placeholder="Nome da Empresa" disabled={isLoading} />
                <input name="representative" className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white" placeholder="Representante" disabled={isLoading} />
                <input name="phone" className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white" placeholder="Telefone" disabled={isLoading} />
                <select name="category" className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white">
                  <option value="mercearia">Mercearia</option>
                  <option value="bebidas">Bebidas</option>
                  <option value="limpeza">Limpeza</option>
                  <option value="outro">Outro</option>
                </select>
                <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-background-dark font-black py-3 rounded-lg transition-all shadow-lg shadow-primary/20 disabled:opacity-50" disabled={isLoading}>
                  {isLoading ? 'SALVANDO...' : 'CADASTRAR'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
             <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-border-dark flex items-center gap-4 bg-background-dark/30">
                   <span className="material-symbols-outlined text-text-secondary">search</span>
                   <input value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent border-none text-white focus:ring-0 w-full text-sm" placeholder="Buscar na lista de parceiros..." />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs uppercase font-bold">
                    <thead className="bg-[#152a1d] text-text-secondary">
                      <tr>
                        <th className="px-6 py-4">Empresa</th>
                        <th className="px-6 py-4 hidden sm:table-cell">Categoria</th>
                        <th className="px-6 py-4 hidden sm:table-cell">Contato</th>
                        <th className="px-6 py-4 text-center">Ver</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-dark">
                      {filteredSuppliers.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-10 text-center text-text-secondary italic font-normal">Nenhum parceiro encontrado.</td></tr>
                      ) : filteredSuppliers.map(s => (
                        <tr key={s.id} className={`hover:bg-white/5 cursor-pointer transition-colors ${selectedSupplierId === s.id ? 'bg-primary/5 ring-1 ring-inset ring-primary/30' : ''}`} onClick={() => setSelectedSupplierId(s.id)}>
                          <td className="px-6 py-4">
                            <p className="text-white font-black">{s.name}</p>
                            <p className="text-[10px] text-text-secondary font-normal sm:hidden">{s.category}</p>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">{s.category}</span>
                          </td>
                          <td className="px-6 py-4 font-normal text-gray-400 hidden sm:table-cell">{s.phone}</td>
                          <td className="px-6 py-4 text-center">
                             <span className="material-symbols-outlined text-primary text-sm">visibility</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>

             {selectedSupplier && (
               <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 shadow-2xl">
                 <div className="p-6 border-b border-border-dark bg-[#152a1d] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                       <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                          <span className="material-symbols-outlined text-3xl">business</span>
                       </div>
                       <div>
                          <h3 className="text-lg font-black">{selectedSupplier.name}</h3>
                          <p className="text-xs text-text-secondary">Desde {new Date(selectedSupplier.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                       <button onClick={() => setIsPurchaseModalOpen(true)} className="flex-1 sm:flex-none bg-primary text-background-dark px-4 py-2 rounded-lg text-xs font-black flex items-center justify-center gap-2 hover:scale-105 transition-transform">
                          <span className="material-symbols-outlined text-sm">add_shopping_cart</span> NOVA COMPRA
                       </button>
                       <button onClick={() => setSelectedSupplierId(null)} className="text-text-secondary hover:text-white p-2">
                          <span className="material-symbols-outlined">close</span>
                       </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b border-border-dark">
                    <div className="p-4 sm:p-6 text-center border-b sm:border-b-0 sm:border-r border-border-dark">
                       <p className="text-[10px] font-bold text-text-secondary uppercase mb-1">Volume Total</p>
                       <p className="text-xl font-black">{(stats.total ?? 0).toLocaleString('pt-MZ')} MT</p>
                    </div>
                    <div className="p-4 sm:p-6 text-center border-b sm:border-b-0 sm:border-r border-border-dark bg-red-400/5">
                       <p className="text-[10px] font-bold text-red-400 uppercase mb-1">Pendente</p>
                       <p className="text-xl font-black text-red-400">{(stats.pending ?? 0).toLocaleString('pt-MZ')} MT</p>
                    </div>
                    <div className="p-4 sm:p-6 text-center bg-primary/5">
                       <p className="text-[10px] font-bold text-primary uppercase mb-1">Total Pago</p>
                       <p className="text-xl font-black text-primary">{(stats.paid ?? 0).toLocaleString('pt-MZ')} MT</p>
                    </div>
                 </div>

                 <div className="p-6">
                    <h4 className="text-xs font-black text-text-secondary uppercase mb-6 tracking-widest flex items-center gap-2">
                       <span className="material-symbols-outlined text-sm">history</span> Timeline
                    </h4>
                    
                    <div className="space-y-4">
                       {timeline.length === 0 ? (
                         <div className="text-center py-12 border-2 border-dashed border-border-dark rounded-2xl">
                            <span className="material-symbols-outlined text-4xl text-border-dark mb-2">inventory_2</span>
                            <p className="text-sm text-text-secondary">Nenhuma transação registrada.</p>
                         </div>
                       ) : timeline.map((item: any) => (
                         <div key={item.id} className="flex gap-4 group">
                            <div className="flex flex-col items-center">
                               <div className={`size-8 rounded-full flex items-center justify-center border-2 ${item.type === 'PURCHASE' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-primary/10 border-primary/30 text-primary'}`}>
                                  <span className="material-symbols-outlined text-sm">{item.type === 'PURCHASE' ? 'receipt' : 'payments'}</span>
                               </div>
                               <div className="w-0.5 flex-1 bg-border-dark group-last:hidden mt-2"></div>
                            </div>
                            <div className="flex-1 pb-8">
                               <div className="flex justify-between items-start mb-1">
                                  <h5 className="text-sm font-black truncate max-w-[150px] sm:max-w-none">{item.description}</h5>
                                  <span className="text-[10px] text-text-secondary font-bold shrink-0">{new Date(item.sortDate).toLocaleDateString('pt-MZ')}</span>
                               </div>
                               <div className="flex justify-between items-center">
                                  <p className="text-[10px] sm:text-xs text-gray-400">
                                     {item.type === 'PURCHASE' ? `${item.quantity} un.` : `Status: ${item.status === 'paid' ? 'Pago' : 'Pendente'}`}
                                  </p>
                                  <p className={`text-sm font-black ${item.type === 'PURCHASE' ? 'text-white' : item.status === 'paid' ? 'text-primary' : 'text-red-400'}`}>
                                     {(item.totalPrice ?? item.amount ?? 0).toLocaleString('pt-MZ')} MT
                                  </p>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               </div>
             )}
          </div>
        </div>
      </main>

      {isPurchaseModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background-dark/90 backdrop-blur-md p-4">
           <form onSubmit={handleAddPurchase} className="bg-surface-dark w-full max-w-lg rounded-2xl border border-border-dark shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-6 border-b border-border-dark bg-[#152a1d] flex justify-between items-center">
                 <h3 className="font-black flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">shopping_cart</span> Nova Compra
                 </h3>
                 <button type="button" onClick={() => setIsPurchaseModalOpen(false)} className="text-text-secondary hover:text-white"><span className="material-symbols-outlined">close</span></button>
              </div>
              <div className="p-6 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Descrição do Pedido</label>
                    <input required name="description" className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary" placeholder="Ex: Carga de Arroz 25kg x10" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-text-secondary uppercase">Quantidade</label>
                       <input required name="quantity" type="number" step="0.01" className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary" placeholder="0" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-text-secondary uppercase">Preço Unitário (MT)</label>
                       <input required name="unitPrice" type="number" step="0.01" className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary" placeholder="0.00" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Número da Fatura (Opcional)</label>
                    <input name="invoice" className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary" placeholder="Ex: INV-2024-001" />
                 </div>

                 <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                       <input type="checkbox" name="createPayable" className="rounded border-border-dark text-primary focus:ring-primary bg-background-dark" defaultChecked />
                       <span className="text-xs font-bold text-white uppercase">Gerar conta a pagar?</span>
                    </label>
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-text-secondary uppercase">Vencimento</label>
                       <input name="dueDate" type="date" className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-xs text-white" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                 </div>
              </div>
              <div className="p-6 bg-[#152a1d] border-t border-border-dark">
                 <button type="submit" className="w-full bg-primary text-background-dark py-4 rounded-xl font-black shadow-lg shadow-primary/20" disabled={isLoading}>
                    {isLoading ? 'REGISTRANDO...' : 'CONFIRMAR COMPRA'}
                 </button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};
