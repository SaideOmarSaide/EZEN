
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Logo } from '../components/Logo';
import { supabase } from '../lib/supabase';



interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
  isOnline: boolean;
  initialMode?: 'login' | 'register';
  onBack?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess, isOnline, initialMode = 'login', onBack }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAuthMode(initialMode);
  }, [initialMode]);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!isOnline && authMode === 'register') {
      setMessage({type: 'error', text: 'Você precisa de internet para criar uma conta pela primeira vez.'});
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      if (authMode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setMessage({type: 'error', text: 'As senhas não coincidem.'});
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.name }
          }
        });

        if (error) throw error;

        if (data.user) {
          setMessage({type: 'success', text: 'Conta criada! Verifique seu e-mail se necessário.'});
        }
      } else {
        // Modo Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          
          throw error;
        }

        if (data.user) {
          // Atualizar/Criar cache local do usuário
          const localUser: User = {
            id: data.user.id,
            name: data.user.user_metadata.full_name || 'Usuário',
            email: data.user.email!,
            createdAt: data.user.created_at,
            updatedAt: new Date().toISOString(),
            syncStatus: 'synced'
          };
          
          // Upsert no IndexedDB (precisamos garantir que o Repo suporte isso ou fazer manualmente)
          // Simplificando: Apenas passamos para o App
          onLoginSuccess(localUser);
        }
      }
    } catch (err: any) {
      console.error(err);
      setMessage({type: 'error', text: err.message || 'Ocorreu um erro na autenticação.'});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background-light dark:bg-background-dark font-display animate-in fade-in duration-500">
      {/* Coluna Esquerda: Branding & Info */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-background-dark border-r border-border-dark flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#13ec5b20] via-transparent to-transparent"></div>
        <div className="relative z-20 flex items-center gap-3 text-white">
          <Logo size={40} className="text-primary" />
          <span className="text-xl font-bold tracking-tight">EZEN</span>
        </div>
        <div className="relative z-20 max-w-lg">
          <h2 className="text-4xl font-extrabold leading-tight mb-4 text-white">
            Tome o controle do seu <span className="text-primary">futuro financeiro</span>.
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Gestão inteligente que funciona em qualquer lugar, com ou sem internet. Seus dados são salvos localmente e sincronizados de forma segura no Supabase.
          </p>
          <div className="mt-8 flex items-center gap-4">
             <div className="flex -space-x-3">
               {[1,2,3].map(i => <div key={i} className="size-10 rounded-full border-2 border-background-dark bg-surface-highlight"></div>)}
             </div>
             <p className="text-sm font-bold text-white/50 uppercase tracking-widest leading-tight">
               Utilizado por centenas <br/> de gestores eficientes
             </p>
          </div>
        </div>
        <div className="relative z-20 text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">
          EZEN Financeiro • Moçambique
        </div>
      </div>

      {/* Coluna Direita: Formulário */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-bold text-sm uppercase tracking-tighter"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Voltar
        </button>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-black text-white tracking-tight">
              {authMode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h1>
            <p className="text-text-secondary mt-2">
              {authMode === 'login' 
                ? 'Acesse sua conta para gerenciar suas finanças.' 
                : 'Sincronize seus dados na nuvem gratuitamente.'}
            </p>
          </div>

          {!isOnline && (
            <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">cloud_off</span>
              MODO OFFLINE ATIVO
            </div>
          )}

          {message && (
            <div className={`p-4 rounded-xl text-sm font-bold border animate-in slide-in-from-top-2 ${
              message.type === 'success' ? 'bg-primary/10 border-primary/20 text-primary' : 
              message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleAction} className="space-y-4">
            {authMode === 'register' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Nome Completo</label>
                <input 
                  required 
                  type="text"
                  disabled={isLoading}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50" 
                  placeholder="Seu nome" 
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">E-mail</label>
              <input 
                required 
                type="email"
                disabled={isLoading}
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50" 
                placeholder="exemplo@email.com" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Senha</label>
              <div className="relative">
                <input 
                  required 
                  type={showPassword ? 'text' : 'password'}
                  disabled={isLoading}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white"
                >
                  <span className="material-symbols-outlined text-sm">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {authMode === 'register' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Confirmar Senha</label>
                <input 
                  required 
                  type="password"
                  disabled={isLoading}
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50" 
                  placeholder="••••••••" 
                />
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-background-dark py-4 rounded-xl font-black text-sm uppercase tracking-tighter shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform mt-4 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading && <div className="size-4 border-2 border-background-dark border-t-transparent animate-spin rounded-full"></div>}
              {authMode === 'login' ? 'Entrar no Sistema' : 'Criar minha conta'}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm text-text-secondary">
              {authMode === 'login' ? 'Ainda não tem conta?' : 'Já possui uma conta?'}
              <button 
                disabled={isLoading}
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="ml-2 text-primary font-bold hover:underline disabled:opacity-50"
              >
                {authMode === 'login' ? 'Registre-se' : 'Faça login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
