import React, { useState, useEffect } from 'react';
import { CashSession, Sale, CashMovement } from '../types';
import { Repository } from '../db/repository';
import { Sidebar } from '../components/Sidebar';

const sessionRepo = new Repository<CashSession>('cash_sessions');
const salesRepo = new Repository<Sale>('sales');
const movementRepo = new Repository<CashMovement>('cash_movements');

interface CashierHistoryViewProps {
  user: any;
  setView: (view: any) => void;
  isOnline: boolean;
  isSyncing: boolean;
  handleLogout: () => void;
}

export const CashierHistoryView: React.FC<CashierHistoryViewProps> = ({
  user,
  setView,
  isOnline,
  isSyncing,
  handleLogout
}) => {
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<CashSession | null>(null);
  const [sessionDetails, setSessionDetails] = useState<{
    sales: Sale[];
    movements: CashMovement[];
  }>({ sales: [], movements: [] });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadSessionDetails(selectedSession);
    }
  }, [selectedSession]);

  const loadSessions = async () => {
    const allSessions = await sessionRepo.getAll();
    // Ordenar por data de abertura (mais recente primeiro)
    const sorted = allSessions.sort((a, b) => 
      new Date(b.openingTime).getTime() - new Date(a.openingTime).getTime()
    );
    setSessions(sorted);
    
    // Selecionar a sessão mais recente automaticamente
    if (sorted.length > 0) {
      setSelectedSession(sorted[0]);
    }
  };

  const loadSessionDetails = async (session: CashSession) => {
    const [allSales, allMovements] = await Promise.all([
      salesRepo.getAll(),
      movementRepo.getAll()
    ]);

    // Filtrar vendas e movimentos que pertencem a esta sessão
    const sessionStart = new Date(session.openingTime).getTime();
    const sessionEnd = session.closingTime 
      ? new Date(session.closingTime).getTime() 
      : Date.now();

    const filteredSales = allSales.filter(s => {
      const saleTime = new Date(s.createdAt).getTime();
      return saleTime >= sessionStart && saleTime <= sessionEnd;
    });

    const filteredMovements = allMovements.filter(m => {
      if (m.sessionId === session.id) return true;
      const movTime = new Date(m.createdAt).getTime();
      return movTime >= sessionStart && movTime <= sessionEnd;
    });

    setSessionDetails({
      sales: filteredSales.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      movements: filteredMovements.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    });
  };

  // Função segura para formatar data
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return date.toLocaleDateString('pt-MZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  // Função segura para formatar hora
  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '--:--';
      }
      return date.toLocaleTimeString('pt-MZ', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar hora:', error);
      return '--:--';
    }
  };

  // Calcular estatísticas da sessão selecionada
  const sessionStats = React.useMemo(() => {
    if (!selectedSession) {
      return {
        totalSales: 0,
        salesInCash: 0,
        entrances: 0,
        exits: 0,
        finalBalance: 0
      };
    }

    const totalSales = sessionDetails.sales.reduce((acc, s) => acc + (s.total ?? 0), 0);
    const salesInCash = sessionDetails.sales
      .filter(s => s.paymentMethod === 'cash')
      .reduce((acc, s) => acc + (s.total ?? 0), 0);
    const entrances = sessionDetails.movements
      .filter(m => m.type === 'entrance')
      .reduce((acc, m) => acc + (m.amount ?? 0), 0);
    const exits = sessionDetails.movements
      .filter(m => m.type === 'exit')
      .reduce((acc, m) => acc + (m.amount ?? 0), 0);
    const finalBalance = (selectedSession.openingBalance ?? 0) + salesInCash + entrances - exits;

    return {
      totalSales,
      salesInCash,
      entrances,
      exits,
      finalBalance
    };
  }, [selectedSession, sessionDetails]);

  return (
    <div className="flex h-screen w-full bg-background-dark font-display overflow-hidden text-white">
      <Sidebar
        activeView="cashier"
        setView={setView}
        userName={user.name}
        handleLogout={handleLogout}
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
              <span className="material-symbols-outlined text-xl">history</span>
            </div>
            <span className="font-bold text-sm tracking-tight">Histórico de Caixa</span>
          </div>
          <div className="size-10"></div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-border-dark pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Histórico de Sessões</h1>
            <p className="text-text-secondary text-sm">Consulte movimentações anteriores</p>
          </div>
          <button
            onClick={() => setView('cashier')}
            className="w-full sm:w-auto bg-primary text-background-dark px-6 py-2.5 rounded-xl font-black text-sm hover:bg-primary-hover shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">point_of_sale</span>
            VOLTAR AO CAIXA
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Lista de Sessões */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-surface-dark border border-border-dark rounded-xl p-4">
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4">
                Sessões Anteriores
              </h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {sessions.length === 0 ? (
                  <p className="text-center text-text-secondary text-sm italic py-8">
                    Nenhuma sessão encontrada
                  </p>
                ) : (
                  sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`w-full text-left p-4 rounded-xl transition-all ${
                        selectedSession?.id === session.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-background-dark/30 hover:bg-background-dark/50 border border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-sm">
                            {formatDate(session.openingTime)}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {formatTime(session.openingTime)} - {session.closingTime ? formatTime(session.closingTime) : 'Em aberto'}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            session.status === 'open'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-gray-500/10 text-gray-400'
                          }`}
                        >
                          {session.status === 'open' ? 'ABERTA' : 'FECHADA'}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">
                        Operador: {session.operatorName}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Detalhes da Sessão Selecionada */}
          <div className="lg:col-span-8 space-y-6">
            {!selectedSession ? (
              <div className="bg-surface-dark border border-border-dark rounded-xl p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-text-secondary mb-4 block">
                  info
                </span>
                <p className="text-text-secondary">
                  Selecione uma sessão para ver os detalhes
                </p>
              </div>
            ) : (
              <>
                {/* Estatísticas da Sessão */}
                <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">Resumo da Sessão</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-background-dark/30 p-4 rounded-xl">
                      <p className="text-[10px] text-text-secondary font-bold uppercase mb-1">
                        Vendas Total
                      </p>
                      <p className="text-xl font-black text-primary">
                        {sessionStats.totalSales.toLocaleString('pt-MZ')} MT
                      </p>
                    </div>
                    <div className="bg-background-dark/30 p-4 rounded-xl">
                      <p className="text-[10px] text-text-secondary font-bold uppercase mb-1">
                        Em Dinheiro
                      </p>
                      <p className="text-xl font-black">
                        {sessionStats.salesInCash.toLocaleString('pt-MZ')} MT
                      </p>
                    </div>
                    <div className="bg-background-dark/30 p-4 rounded-xl">
                      <p className="text-[10px] text-text-secondary font-bold uppercase mb-1">
                        Entradas
                      </p>
                      <p className="text-xl font-black text-blue-400">
                        {sessionStats.entrances.toLocaleString('pt-MZ')} MT
                      </p>
                    </div>
                    <div className="bg-background-dark/30 p-4 rounded-xl">
                      <p className="text-[10px] text-text-secondary font-bold uppercase mb-1">
                        Saídas
                      </p>
                      <p className="text-xl font-black text-red-400">
                        {sessionStats.exits.toLocaleString('pt-MZ')} MT
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 p-5 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-[10px] text-text-secondary font-bold uppercase mb-2">
                      Saldo Final em Gaveta
                    </p>
                    <p className="text-3xl font-black text-primary">
                      {sessionStats.finalBalance.toLocaleString('pt-MZ')} MT
                    </p>
                  </div>
                </div>

                {/* Transações */}
                <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-border-dark bg-[#152a1d]">
                    <h3 className="text-sm font-bold uppercase tracking-widest">
                      Transações
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-text-secondary border-b border-border-dark">
                        <tr>
                          <th className="px-6 py-4">Hora</th>
                          <th className="px-6 py-4">Tipo</th>
                          <th className="px-6 py-4">Descrição</th>
                          <th className="px-6 py-4 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-dark">
                        {sessionDetails.sales.length === 0 && sessionDetails.movements.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-text-secondary italic">
                              Nenhuma transação registrada
                            </td>
                          </tr>
                        ) : (
                          <>
                            {sessionDetails.sales.map((sale) => (
                              <tr key={sale.id} className="hover:bg-white/5">
                                <td className="px-6 py-4 text-gray-400">
                                  {formatTime(sale.createdAt)}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                                    VENDA
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-bold">
                                  {sale.itemDescription}
                                </td>
                                <td className="px-6 py-4 text-right font-black text-primary">
                                  {sale.total.toLocaleString('pt-MZ')} MT
                                </td>
                              </tr>
                            ))}
                            {sessionDetails.movements.map((movement) => (
                              <tr key={movement.id} className="hover:bg-white/5">
                                <td className="px-6 py-4 text-gray-400">
                                  {formatTime(movement.createdAt)}
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                                      movement.type === 'entrance'
                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}
                                  >
                                    {movement.type === 'entrance' ? 'ENTRADA' : 'SAÍDA'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-bold">
                                  {movement.description}
                                </td>
                                <td
                                  className={`px-6 py-4 text-right font-black ${
                                    movement.type === 'entrance' ? 'text-blue-400' : 'text-red-400'
                                  }`}
                                >
                                  {movement.type === 'entrance' ? '+' : '-'}
                                  {movement.amount.toLocaleString('pt-MZ')} MT
                                </td>
                              </tr>
                            ))}
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};