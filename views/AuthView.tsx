
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Repository } from '../db/repository';
import { Logo } from '../components/Logo';

const userRepo = new Repository<User>('users');

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
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    setAuthMode(initialMode);
  }, [initialMode]);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        setMessage({type: 'error', text: 'As senhas não coincidem.'});
        return;
      }
      try {
        const user = await userRepo.save({ name: formData.name, email: formData.email, password: formData.password });
        setMessage({type: 'success', text: 'Conta criada com sucesso!'});
        setTimeout(() => onLoginSuccess(user), 1000);
      } catch (err) {
        setMessage({type: 'error', text: 'Erro ao criar conta.'});
      }
    } else {
      const users = await userRepo.getAll();
      const user = users.find(u => u.email === formData.email && u.password === formData.password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setMessage({type: 'error', text: 'Credenciais inválidas ou usuário não encontrado localmente.'});
      }
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
            Gestão inteligente que funciona em qualquer lugar, com ou sem internet. Seus dados são salvos localmente e sincronizados de forma segura.
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
                : 'Comece agora a profissionalizar seu negócio.'}
            </p>
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm font-bold border animate-in slide-in-from-top-2 ${
              message.type === 'success' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-red-500/10 border-red-500/20 text-red-400'
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
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary" 
                  placeholder="Seu nome" 
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">E-mail</label>
              <input 
                required 
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary" 
                placeholder="exemplo@email.com" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Senha</label>
              <div className="relative">
                <input 
                  required 
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary" 
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
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary" 
                  placeholder="••••••••" 
                />
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-primary text-background-dark py-4 rounded-xl font-black text-sm uppercase tracking-tighter shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform mt-4"
            >
              {authMode === 'login' ? 'Entrar no Sistema' : 'Criar minha conta'}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm text-text-secondary">
              {authMode === 'login' ? 'Ainda não tem conta?' : 'Já possui uma conta?'}
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="ml-2 text-primary font-bold hover:underline"
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
