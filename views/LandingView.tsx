
import React, { useState, useEffect } from 'react';
import { Logo } from '../components/Logo';

interface LandingViewProps {
  onStartAuth: (mode?: 'login' | 'register') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStartAuth }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleMobileAuth = (mode: 'login' | 'register') => {
    closeMenu();
    onStartAuth(mode);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-body selection:bg-primary selection:text-background-dark antialiased overflow-x-hidden">
      
      {/* Navbar Fixa */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] w-full border-b transition-all duration-300 ${
        scrolled ? 'bg-[#112217]/95 backdrop-blur-md py-3 border-[#23482f]' : 'bg-transparent py-5 border-transparent'
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <Logo size={40} className="text-primary group-hover:scale-110 transition-transform" />
            <h1 className="text-2xl font-black tracking-tighter text-white">EZEN</h1>
          </div>
          
          <div className="hidden items-center gap-8 md:flex">
            <a className="text-sm font-bold text-white/70 hover:text-primary transition-colors uppercase tracking-widest" href="#beneficios">Benefícios</a>
            <a className="text-sm font-bold text-white/70 hover:text-primary transition-colors uppercase tracking-widest" href="#funcionalidades">Funcionalidades</a>
            <a className="text-sm font-bold text-white/70 hover:text-primary transition-colors uppercase tracking-widest" href="#depoimentos">Depoimentos</a>
            <button onClick={() => onStartAuth('login')} className="text-sm font-bold text-white/70 hover:text-primary transition-colors uppercase tracking-widest">Entrar</button>
            <button 
              onClick={() => onStartAuth('register')}
              className="flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-black text-background-dark transition-all hover:bg-primary-hover hover:scale-105 shadow-lg shadow-primary/20 uppercase"
            >
              Criar Conta
            </button>
          </div>

          <button 
            className="md:hidden flex size-11 items-center justify-center rounded-xl bg-surface-highlight/40 text-white border border-border-dark hover:border-primary transition-all z-[110]"
            onClick={toggleMenu}
          >
            <span className="material-symbols-outlined text-2xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[90] md:hidden bg-background-dark/98 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="flex flex-col h-full pt-32 px-8 gap-10">
            <nav className="flex flex-col gap-8">
              <a onClick={closeMenu} className="text-4xl font-black text-white hover:text-primary transition-colors" href="#beneficios">Benefícios</a>
              <a onClick={closeMenu} className="text-4xl font-black text-white hover:text-primary transition-colors" href="#funcionalidades">Funcionalidades</a>
              <a onClick={closeMenu} className="text-4xl font-black text-white hover:text-primary transition-colors" href="#depoimentos">Depoimentos</a>
              <button onClick={() => handleMobileAuth('login')} className="text-left text-4xl font-black text-white/60 hover:text-white">Entrar</button>
            </nav>
            <div className="flex flex-col gap-4 mt-auto pb-12">
              <button onClick={() => handleMobileAuth('register')} className="w-full py-5 rounded-2xl bg-primary text-background-dark font-black shadow-2xl text-xl uppercase tracking-tighter">CRIAR CONTA GRÁTIS</button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-40">
        <div className="absolute -top-24 -left-24 size-[500px] rounded-full bg-primary/10 blur-[120px]"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="flex flex-col gap-8">
              <div className="inline-flex w-fit items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-black text-primary uppercase tracking-widest">
                Sistema 100% Moçambicano
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-white sm:text-6xl lg:text-8xl leading-[0.95]">
                Gestão que <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">não depende de rede</span>.
              </h1>
              <p className="text-xl text-text-secondary leading-relaxed max-w-lg font-medium">
                Gerencie vendas, fiados e fornecedores com o EZEN. Funciona perfeitamente mesmo quando a internet falha em sua região. 
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => onStartAuth('register')} className="group flex items-center justify-center gap-3 rounded-2xl bg-primary px-10 py-5 text-lg font-black text-background-dark transition-all hover:bg-primary-hover hover:scale-[1.02] shadow-2xl shadow-primary/20">
                  COMEÇAR AGORA
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="relative lg:ml-auto w-full max-w-[600px]">
              <div className="relative rounded-3xl border border-border-dark bg-surface-dark/40 p-2 shadow-2xl backdrop-blur-sm">
                <div className="overflow-hidden rounded-2xl border border-border-dark bg-background-dark aspect-[16/10] relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/5"></div>
                  <div className="p-6 space-y-6 relative flex flex-col items-center justify-center h-full">
                     <Logo size={120} className="text-primary animate-pulse" />
                     <p className="text-white font-black tracking-widest uppercase">EZEN DASHBOARD</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="bg-surface-dark/30 py-32 border-y border-border-dark scroll-mt-20" id="beneficios">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-black tracking-tighter text-white sm:text-6xl mb-6">Por que escolher o EZEN?</h2>
            <p className="text-xl text-text-secondary font-medium">Focado na realidade de Moçambique, onde a conectividade oscila mas o seu negócio não pode parar.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: 'auto_awesome', title: 'Offline-First', desc: 'Venda e receba fiados mesmo sem internet. Os dados são sincronizados assim que a rede volta.' },
              { icon: 'account_balance_wallet', title: 'Controle Financeiro', desc: 'Acabe com o papel. Histórico detalhado de contas a pagar, receber e fluxo de caixa.' },
              { icon: 'insights', title: 'Relatórios Inteligentes', desc: 'Visualize seu lucro, ticket médio e produtos mais vendidos com gráficos simples.' }
            ].map((b, i) => (
              <div key={i} className="group p-10 rounded-[40px] bg-background-dark border border-border-dark hover:border-primary/50 transition-all hover:-translate-y-2 shadow-xl">
                <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-4xl">{b.icon}</span></div>
                <h3 className="text-2xl font-black text-white mb-4">{b.title}</h3>
                <p className="text-text-secondary leading-relaxed font-medium">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="bg-surface-dark/30 py-32 border-y border-border-dark scroll-mt-20" id="depoimentos">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
              <h2 className="text-4xl font-black tracking-tighter text-white mb-4">Quem usa, recomenda</h2>
              <p className="text-text-secondary">Lojistas que modernizaram sua gestão com o EZEN.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: 'Sr. Alberto', loc: 'Maputo', text: 'O EZEN mudou minha vida. Antes perdia tudo no caderno, agora controlo meus fiados pelo celular.' },
                { name: 'Dona Helena', loc: 'Matola', text: 'Mesmo quando a rede falha, eu continuo registrando minhas vendas sem medo.' },
                { name: 'Mateus J.', loc: 'Beira', text: 'O controle de fornecedores e compras facilitou muito minha vida na hora de repor estoque.' }
              ].map((d, i) => (
                <div key={i} className="p-8 rounded-3xl bg-background-dark border border-border-dark italic text-white/80 relative">
                   <span className="material-symbols-outlined text-primary/20 absolute top-4 right-4 text-6xl">format_quote</span>
                   <p className="mb-6 relative z-10">"{d.text}"</p>
                   <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-surface-highlight"></div>
                      <div><p className="text-sm font-black text-white not-italic">{d.name}</p><p className="text-[10px] text-primary font-bold uppercase tracking-widest not-italic">{d.loc}</p></div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 bg-background-dark">
         <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-center text-white mb-12">Dúvidas Frequentes</h2>
            <div className="space-y-4">
               {[
                 { q: 'Preciso de internet o tempo todo?', a: 'Não. Você pode trabalhar 100% offline. A internet é necessária apenas para a sincronização inicial e backup.' },
                 { q: 'Os dados estão seguros?', a: 'Sim. Seus dados são salvos localmente com criptografia e sincronizados com nossos servidores seguros.' },
                 { q: 'Funciona em qualquer dispositivo?', a: 'Funciona em qualquer dispositivo com navegador moderno (Chrome, Safari, Edge), seja Android ou iOS.' }
               ].map((item, i) => (
                 <div key={i} className="p-6 rounded-2xl bg-surface-dark border border-border-dark group">
                    <h4 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
                       {item.q}
                       <span className="material-symbols-outlined text-primary group-hover:rotate-180 transition-transform">expand_more</span>
                    </h4>
                    <p className="text-sm text-text-secondary leading-relaxed">{item.a}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d1c12] pt-32 pb-12 border-t border-border-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
             <div className="col-span-2 space-y-8">
                <div className="flex items-center gap-3">
                  <Logo size={40} className="text-primary" />
                  <h1 className="text-2xl font-black tracking-tighter text-white">EZEN</h1>
                </div>
                <p className="text-text-secondary max-w-sm text-lg font-medium leading-relaxed">Capacitando pequenos comerciantes em Moçambique com tecnologia local e offline-first.</p>
             </div>
             <div>
                <h5 className="text-white font-black uppercase tracking-widest text-xs mb-8">Navegação</h5>
                <ul className="space-y-4">
                   <li><a href="#beneficios" className="text-text-secondary hover:text-white transition-colors font-medium">Benefícios</a></li>
                   <li><button onClick={() => onStartAuth('login')} className="text-text-secondary hover:text-white transition-colors font-medium">Login</button></li>
                </ul>
             </div>
             <div>
                <h5 className="text-white font-black uppercase tracking-widest text-xs mb-8">Suporte</h5>
                <ul className="space-y-4">
                   <li className="text-text-secondary font-medium">suporte@ezen.co.mz</li>
                   <li className="text-text-secondary font-medium">Moçambique</li>
                </ul>
             </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
             <p className="text-xs font-black text-gray-600 uppercase tracking-[0.3em]">© 2024 EZEN • Gestão Financeira Inteligente</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
