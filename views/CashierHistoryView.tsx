import React, { useState, useEffect } from 'react';
import { getClosedCashierSessions, CashierSession } from '../db/repository';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CashierHistoryViewProps {
  setView: (view: { name: string; sessionId?: string } | string) => void;
}

function formatDuration(startDate: Date, endDate: Date | null) {
  if (!endDate) return 'Em andamento';
  const duration = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export default function CashierHistoryView({ setView }: CashierHistoryViewProps) {
  const [sessions, setSessions] = useState<CashierSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      try {
        const closedSessions = await getClosedCashierSessions();
        // Sort sessions from newest to oldest based on closing date
        closedSessions.sort((a, b) => {
          const timeA = a.closed_at ? new Date(a.closed_at).getTime() : 0;
          const timeB = b.closed_at ? new Date(b.closed_at).getTime() : 0;
          return timeB - timeA;
        });
        setSessions(closedSessions);
      } catch (error) {
        console.error("Failed to load cashier sessions:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  const handleSessionClick = (sessionId: string) => {
    setView({ name: 'cashier_history_details', sessionId });
  };

  const handleBackToCashier = () => {
    setView('cashier');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-gray-400 animate-spin">
            progress_activity
          </span>
          <p className="mt-4 text-lg font-medium text-gray-600">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-4xl text-gray-700">history</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Histórico de Caixas</h1>
              <p className="text-sm text-gray-500">Visualize todas as sessões de caixa já encerradas.</p>
            </div>
          </div>
          <button
            onClick={handleBackToCashier}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Voltar para o Caixa Ativo
          </button>
        </header>

        {sessions.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-gray-400">search_off</span>
            <h2 className="mt-4 text-2xl font-bold text-gray-800">Nenhum caixa fechado</h2>
            <p className="mt-2 text-base text-gray-500">
              Ainda não há sessões de caixa encerradas para exibir no histórico.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSessionClick(session.id)}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Operador</p>
                    <p className="text-lg font-bold text-gray-800">{session.operatorName || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold border border-red-200">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    Fechado
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Abertura</p>
                    <p className="font-medium text-gray-700">
                      {format(new Date(session.opened_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fechamento</p>
                    <p className="font-medium text-gray-700">
                      {session.closed_at && !isNaN(new Date(session.closed_at).getTime()) ? format(new Date(session.closed_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR }) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duração</p>
                    <p className="font-medium text-gray-700">
                      {formatDuration(new Date(session.opened_at), session.closed_at ? new Date(session.closed_at) : null)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 text-right">
                  <p className="text-blue-600 group-hover:underline font-semibold text-sm">
                    Ver Detalhes
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
