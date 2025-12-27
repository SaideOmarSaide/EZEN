import React, { useState } from 'react';

export const FinancialEducationView = () => {
  const [activeModule, setActiveModule] = useState('intro');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const modules = [
    { id: 'intro', icon: 'school', title: 'Introdução', color: 'primary' },
    { id: 'caixa', icon: 'point_of_sale', title: 'Caixa Diário', color: 'blue' },
    { id: 'fiados', icon: 'group', title: 'Fiados', color: 'yellow' },
    { id: 'contas', icon: 'payments', title: 'Contas a Pagar', color: 'red' },
    { id: 'fornecedores', icon: 'business_center', title: 'Fornecedores', color: 'green' },
    { id: 'relatorios', icon: 'analytics', title: 'Relatórios', color: 'purple' }
  ];

  const colorClasses: any = {
    primary: 'bg-[#13ec5b]/10 text-[#13ec5b] border-[#13ec5b]/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  const content: any = {
    intro: {
      title: 'Bem-vindo ao EZEN!',
      subtitle: 'Aprenda a gerir as suas finanças como um profissional',
      sections: [
        {
          icon: 'lightbulb',
          title: 'O que é Gestão Financeira?',
          content: 'Gestão financeira é controlar todo o dinheiro que entra e sai do seu negócio. É como cuidar da sua casa: você precisa saber quanto ganha, quanto gasta, e quanto sobra no final do mês.',
          example: 'Se você vende 100.000 MT por mês, mas gasta 95.000 MT, seu lucro é apenas 5.000 MT. Com o EZEN, você vê exatamente para onde vai cada Metical!'
        },
        {
          icon: 'trending_up',
          title: 'Por que é Importante?',
          content: 'Muitos negócios fecham porque os donos não sabem quanto estão realmente ganhando. Eles confundem "ter dinheiro na gaveta" com "ter lucro".',
          example: 'João tinha 50.000 MT no caixa, mas devia 60.000 MT aos fornecedores. Ele pensava que estava bem, mas na verdade estava perdendo dinheiro!'
        },
        {
          icon: 'psychology',
          title: 'Os 3 Pilares do Sucesso',
          content: 'Para ter sucesso, você precisa: 1) REGISTRAR tudo que acontece, 2) ANALISAR seus números regularmente, 3) AGIR com base no que descobriu.',
          example: 'Maria descobriu que 30% dos clientes não pagavam os fiados. Ela começou a cobrar melhor e seu lucro aumentou 40% em 3 meses!'
        }
      ]
    },
    caixa: {
      title: 'Caixa Diário: O Coração do Negócio',
      subtitle: 'Aprenda a controlar cada Metical que passa pelas suas mãos',
      sections: [
        {
          icon: 'lock_open',
          title: 'Abrindo o Caixa',
          content: 'Todo dia você começa com um "Fundo de Caixa" - dinheiro para dar troco. É importante registrar este valor inicial!',
          example: 'Manhã: Você coloca 5.000 MT no caixa para trocos. No sistema, você clica em "ABRIR CAIXA" e registra os 5.000 MT. Agora o sistema sabe que qualquer dinheiro além disso veio de vendas!'
        },
        {
          icon: 'shopping_cart',
          title: 'Registrando Vendas',
          content: 'Cada venda deve ser registrada imediatamente. Você anota: o que vendeu, quanto custou, e como o cliente pagou (dinheiro, M-Pesa, ou fiado).',
          example: 'Cliente compra: 2kg Arroz (150 MT) + 2L Óleo (200 MT) = 350 MT em dinheiro. Você registra no EZEN em 30 segundos e pronto!'
        },
        {
          icon: 'sync_alt',
          title: 'Entradas e Saídas',
          content: 'Nem todo dinheiro que entra é venda, e nem toda saída é despesa. Por isso separamos em categorias.',
          example: 'ENTRADA: "Trouxe mais 3.000 MT do banco para trocos" / SAÍDA: "Paguei 2.500 MT da conta de luz". Estas movimentações não são vendas nem compras, mas afetam seu caixa!'
        },
        {
          icon: 'lock',
          title: 'Fechando o Caixa',
          content: 'No fim do dia, você conta o dinheiro físico e compara com o que o sistema diz que deveria ter. Se bater, está tudo certo!',
          example: 'Sistema diz: "Deveria ter 45.000 MT". Você conta: 45.000 MT. Perfeito! Se tiver diferença, você anota e investiga depois.'
        }
      ],
      tips: [
        { icon: 'warning', text: 'NUNCA misture dinheiro pessoal com dinheiro do negócio!' },
        { icon: 'security', text: 'Faça sangrias (retiradas) quando tiver muito dinheiro em caixa' },
        { icon: 'inventory', text: 'Registre TUDO, até vendas pequenas de 10 MT' }
      ]
    },
    fiados: {
      title: 'Fiados: Como Dar Crédito Sem Perder Dinheiro',
      subtitle: 'Gerir crédito aos clientes de forma profissional',
      sections: [
        {
          icon: 'person_search',
          title: 'O que é um Fiado?',
          content: 'Fiado é quando você vende hoje e recebe depois. É bom para fidelizar clientes, mas pode quebrar seu negócio se não for bem gerido.',
          example: 'Dona Maria compra 500 MT de produtos. Você confia nela e deixa pagar na sexta-feira quando ela receber o salário. Isso é um fiado!'
        },
        {
          icon: 'rule',
          title: 'Regras de Ouro do Fiado',
          content: '1) Sempre defina uma data de pagamento, 2) Registre o nome completo do cliente, 3) Não dê fiado se o cliente já tem outro atrasado.',
          example: 'João deve 300 MT desde semana passada. Hoje ele quer mais 200 MT fiado. NUNCA ACEITE! Primeiro ele paga o antigo, depois pode ter novo fiado.'
        },
        {
          icon: 'notifications_active',
          title: 'Cobrança Inteligente',
          content: 'O EZEN te avisa quando um fiado está vencendo. Cobre educadamente mas com firmeza. Lembre: você não é banco!',
          example: 'Sistema: "3 fiados vencem amanhã". Você liga: "Olá Maria, seu fiado de 500 MT vence amanhã. Pode passar aqui?" Simples e profissional!'
        },
        {
          icon: 'calculate',
          title: 'Quanto Fiado é Seguro?',
          content: 'Regra prática: Fiados não devem passar de 20% do seu faturamento mensal. Se você vende 100.000 MT/mês, máximo 20.000 MT em fiados.',
          example: 'Se você tem 35.000 MT em fiados mas só vende 50.000 MT/mes, PARE de dar fiado até receber uns 15.000 MT de volta!'
        }
      ],
      tips: [
        { icon: 'calendar_month', text: 'Máximo 7 dias de prazo para clientes normais' },
        { icon: 'block', text: 'Cliente com 2 atrasos seguidos perde o direito ao fiado' },
        { icon: 'phone', text: 'Ligue 1 dia antes do vencimento para lembrar o cliente' }
      ]
    },
    contas: {
      title: 'Contas a Pagar: Nunca Mais Esqueça uma Dívida',
      subtitle: 'Mantenha suas obrigações em dia e sua reputação limpa',
      sections: [
        {
          icon: 'receipt_long',
          title: 'O que São Contas a Pagar?',
          content: 'São todas as dívidas do seu negócio: fornecedores, aluguel, luz, água, salários. Se você prometeu pagar, é uma conta a pagar!',
          example: 'Segunda-feira: Fornecedor traz mercadoria de 25.000 MT, você paga 15.000 MT e fica devendo 10.000 MT para 15 dias. Registre já os 10.000 MT nas contas a pagar!'
        },
        {
          icon: 'schedule',
          title: 'Priorização de Pagamentos',
          content: 'Nem todas contas têm a mesma urgência. Priorize: 1) Fornecedores (para não perder o crédito), 2) Aluguel/Luz, 3) Outros.',
          example: 'Você tem 20.000 MT e deve: Fornecedor (15.000), Aluguel (8.000), Pintura (5.000). Pague o fornecedor e o aluguel. Pintura espera!'
        },
        {
          icon: 'handshake',
          title: 'Negociação com Fornecedores',
          content: 'Se não conseguir pagar no prazo, NUNCA suma! Ligue antes do vencimento e negocie. É melhor pagar 50% hoje que 100% nunca.',
          example: 'Sexta-feira: Deve 30.000 MT, mas só tem 18.000 MT. Você liga: "Tenho 18.000 MT agora e mais 12.000 MT segunda-feira, pode ser?" Fornecedor geralmente aceita!'
        },
        {
          icon: 'savings',
          title: 'Reserva de Emergência',
          content: 'Tente sempre ter 1 mês de despesas fixas guardado. Se o aluguel é 10.000 MT e luz 3.000 MT, guarde 13.000 MT como segurança.',
          example: 'Mês fraco: Vendeu pouco mas tem a reserva para pagar aluguel e luz. Mês bom: Vendeu muito e reforça a reserva. Assim você dorme tranquilo!'
        }
      ],
      tips: [
        { icon: 'event', text: 'Configure alertas 3 dias antes de cada vencimento' },
        { icon: 'star', text: 'Pagar em dia = descontos e mais crédito no futuro' },
        { icon: 'description', text: 'Guarde todos os recibos de pagamento por 1 ano' }
      ]
    },
    fornecedores: {
      title: 'Fornecedores: Parcerias que Geram Lucro',
      subtitle: 'Gerir bem seus fornecedores é tão importante quanto vender',
      sections: [
        {
          icon: 'business',
          title: 'Por que Cadastrar Fornecedores?',
          content: 'Ter um histórico completo de cada fornecedor te ajuda a negociar melhores preços, prazos e condições. Quanto mais você compra, mais poder tem!',
          example: 'Fornecedor A: Já comprou 150.000 MT este ano. Você pede desconto e mostra o histórico. Ele vê que você é cliente fiel e te dá 5% de desconto!'
        },
        {
          icon: 'compare',
          title: 'Comparando Fornecedores',
          content: 'Nunca dependa de 1 só fornecedor! Tenha pelo menos 2 opções para cada tipo de produto. Compare preços, qualidade e prazo de pagamento.',
          example: 'Arroz: Fornecedor A vende a 4.500 MT/saco com 7 dias de prazo. Fornecedor B vende a 4.300 MT mas pagamento à vista. Qual compensa mais para você agora?'
        },
        {
          icon: 'inventory_2',
          title: 'Controle de Compras',
          content: 'Registre TODA compra: data, quantidade, preço, número da fatura. Isso te protege em caso de problema e ajuda a planejar próximas compras.',
          example: 'Você compra 50 unidades de óleo a 95 MT/unidade. Duas semanas depois o preço subiu para 110 MT. Com o histórico, você sabe que está na hora de estocar!'
        },
        {
          icon: 'gavel',
          title: 'Resolução de Problemas',
          content: 'Produto com defeito? Preço errado na fatura? Com registro completo, você tem provas! Fornecedor sério respeita cliente organizado.',
          example: 'Fatura diz 20 caixas de sabão mas só chegaram 18. Você mostra o registro e a fatura. Fornecedor reconhece o erro e traz as 2 caixas que faltam!'
        }
      ],
      tips: [
        { icon: 'badge', text: 'Bons fornecedores são parceiros, não inimigos!' },
        { icon: 'local_shipping', text: 'Negocie frete grátis para compras acima de X MT' },
        { icon: 'loyalty', text: 'Fornecedor pontual e honesto vale mais que o mais barato' }
      ]
    },
    relatorios: {
      title: 'Relatórios: Transforme Números em Decisões',
      subtitle: 'Aprenda a ler seus números e tomar decisões inteligentes',
      sections: [
        {
          icon: 'assessment',
          title: 'O que Significam os Números?',
          content: 'Relatórios são como raio-X do seu negócio. Eles mostram o que está indo bem e o que precisa melhorar. Não tenha medo dos números!',
          example: 'Relatório mostra: Vendas subiram 20% mas lucro só 5%. Por quê? Os produtos mais baratos venderam mais e os caros ficaram parados!'
        },
        {
          icon: 'pie_chart',
          title: 'Análise de Despesas',
          content: 'Veja quanto gasta em cada categoria. Às vezes você está gastando muito onde não deveria e economizando onde não compensa.',
          example: 'Aluguel: 30% das despesas. Fornecedores: 50%. Luz: 20%. O aluguel está muito alto! Talvez seja hora de procurar um local mais barato.'
        },
        {
          icon: 'trending_up',
          title: 'Crescimento ao Longo do Tempo',
          content: 'Compare mês a mês. Você está crescendo? Estagnado? Caindo? Identifique padrões e tome ação antes que seja tarde.',
          example: 'Janeiro: 80.000 MT. Fevereiro: 75.000 MT. Março: 70.000 MT. ALERTA! Você está perdendo 5.000 MT/mês. Precisa agir AGORA!'
        },
        {
          icon: 'light_mode',
          title: 'Decisões Baseadas em Dados',
          content: 'Nunca decida "no achômetro". Use seus relatórios! Quer abrir outro dia na semana? Contratar alguém? Expandir? Consulte os números primeiro.',
          example: 'Ideia: Abrir aos domingos. Você calcula: +4.000 MT/mês em vendas, -2.000 MT em salário do funcionário. Lucro: +2.000 MT. Vale a pena!'
        }
      ],
      tips: [
        { icon: 'event_repeat', text: 'Analise seus relatórios todo sábado de manhã' },
        { icon: 'download', text: 'Imprima relatórios mensais e guarde por 2 anos' },
        { icon: 'groups', text: 'Compartilhe números com sócios/família (se tiver)' }
      ]
    }
  };

  const faqs = [
    {
      q: 'Preciso saber matemática complicada?',
      a: 'Não! O EZEN faz todos os cálculos. Você só precisa registrar as informações. Se você sabe somar e subtrair, já é suficiente!'
    },
    {
      q: 'E se eu esquecer de registrar algo?',
      a: 'Pode registrar depois! O sistema permite adicionar vendas e movimentações de dias anteriores. O importante é registrar tudo eventualmente.'
    },
    {
      q: 'Quanto tempo demora para aprender?',
      a: 'Em 1 semana de uso diário você já domina o básico. Em 1 mês você se torna expert e não vive mais sem o sistema!'
    },
    {
      q: 'Posso usar sem internet?',
      a: 'SIM! Esse é o grande diferencial do EZEN. Você trabalha offline e quando a internet voltar, tudo sincroniza automaticamente.'
    },
    {
      q: 'E se eu cometer um erro no registro?',
      a: 'Você pode corrigir ou deletar. O sistema mantém histórico de mudanças para auditoria.'
    },
    {
      q: 'Preciso de computador?',
      a: 'Não! Funciona no celular, tablet ou computador. Recomendamos celular pela praticidade no dia a dia.'
    }
  ];

  const currentContent = content[activeModule];

  return (
    <div className="min-h-screen bg-[#102216] text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#102216]/95 backdrop-blur-md border-b border-[#23482f]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#13ec5b]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#13ec5b]">school</span>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">Academia EZEN</h1>
              <p className="text-xs text-[#92c9a4]">Educação Financeira Gratuita</p>
            </div>
          </div>
          <div className="text-xs bg-[#13ec5b]/10 text-[#13ec5b] px-3 py-1.5 rounded-full border border-[#13ec5b]/20 font-bold">
            100% Grátis
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Sidebar de Módulos */}
          <aside className="lg:col-span-3">
            <div className="bg-[#1c3a27] border border-[#23482f] rounded-2xl p-4 sticky top-24">
              <h3 className="text-xs font-black text-[#92c9a4] uppercase tracking-widest mb-4">
                Módulos
              </h3>
              <nav className="space-y-2">
                {modules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => setActiveModule(module.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeModule === module.id
                        ? `${colorClasses[module.color]} border`
                        : 'text-[#92c9a4] hover:bg-[#23482f]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{module.icon}</span>
                    <span className="text-sm font-bold text-left">{module.title}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-6 p-4 rounded-xl bg-[#13ec5b]/5 border border-[#13ec5b]/20">
                <p className="text-xs text-[#92c9a4] font-bold mb-2">💡 Dica de Estudo</p>
                <p className="text-xs text-white/80">Faça 1 módulo por dia. Não tenha pressa, o importante é entender bem!</p>
              </div>
            </div>
          </aside>

          {/* Conteúdo Principal */}
          <main className="lg:col-span-9">
            {/* Cabeçalho do Módulo */}
            <div className="bg-gradient-to-br from-[#1c3a27] to-[#102216] border border-[#23482f] rounded-2xl p-8 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className={`size-16 rounded-2xl ${colorClasses[modules.find(m => m.id === activeModule)?.color || 'primary']} border flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-4xl">
                    {modules.find(m => m.id === activeModule)?.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-black tracking-tight mb-2">{currentContent.title}</h2>
                  <p className="text-[#92c9a4] text-lg">{currentContent.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Seções de Conteúdo */}
            <div className="space-y-6">
              {currentContent.sections.map((section: any, idx: number) => (
                <div key={idx} className="bg-[#1c3a27] border border-[#23482f] rounded-2xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="size-12 rounded-xl bg-[#13ec5b]/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#13ec5b] text-2xl">{section.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black mb-2">{section.title}</h3>
                        <p className="text-[#92c9a4] leading-relaxed">{section.content}</p>
                      </div>
                    </div>

                    {section.example && (
                      <div className="mt-4 p-4 rounded-xl bg-[#13ec5b]/5 border border-[#13ec5b]/20">
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[#13ec5b] text-sm mt-0.5">lightbulb</span>
                          <div>
                            <p className="text-xs font-black text-[#13ec5b] uppercase tracking-wider mb-1">Exemplo Prático</p>
                            <p className="text-sm text-white/90">{section.example}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Dicas Rápidas */}
              {currentContent.tips && (
                <div className="bg-[#1c3a27] border border-[#23482f] rounded-2xl p-6">
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#13ec5b]">tips_and_updates</span>
                    Dicas Rápidas
                  </h3>
                  <div className="space-y-3">
                    {currentContent.tips.map((tip: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#23482f]/30">
                        <span className="material-symbols-outlined text-[#13ec5b] text-xl shrink-0">{tip.icon}</span>
                        <p className="text-sm text-white/90">{tip.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navegação entre Módulos */}
              <div className="flex justify-between items-center pt-6">
                <button
                  onClick={() => {
                    const currentIdx = modules.findIndex(m => m.id === activeModule);
                    if (currentIdx > 0) setActiveModule(modules[currentIdx - 1].id);
                  }}
                  disabled={modules.findIndex(m => m.id === activeModule) === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#23482f] text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#326744] transition-colors"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Módulo Anterior
                </button>
                <button
                  onClick={() => {
                    const currentIdx = modules.findIndex(m => m.id === activeModule);
                    if (currentIdx < modules.length - 1) setActiveModule(modules[currentIdx + 1].id);
                  }}
                  disabled={modules.findIndex(m => m.id === activeModule) === modules.length - 1}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#13ec5b] text-[#102216] font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0fb845] transition-colors"
                >
                  Próximo Módulo
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </main>
        </div>

        {/* FAQ Section */}
        <section className="mt-12 bg-[#1c3a27] border border-[#23482f] rounded-2xl p-8">
          <h2 className="text-2xl font-black mb-6 text-center">Perguntas Frequentes</h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-[#23482f]/30 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFAQ(openFAQ === faq.q ? null : faq.q)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-[#23482f]/50 transition-colors"
                >
                  <span className="font-bold">{faq.q}</span>
                  <span className="material-symbols-outlined text-[#13ec5b]">
                    {openFAQ === faq.q ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {openFAQ === faq.q && (
                  <div className="px-4 pb-4 text-[#92c9a4]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <div className="mt-12 text-center bg-gradient-to-br from-[#13ec5b]/10 to-[#102216] border border-[#13ec5b]/20 rounded-2xl p-8">
          <div className="size-20 rounded-full bg-[#13ec5b]/20 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[#13ec5b] text-5xl">emoji_events</span>
          </div>
          <h2 className="text-2xl font-black mb-3">Pronto para Começar?</h2>
          <p className="text-[#92c9a4] mb-6 max-w-xl mx-auto">
            Agora que você aprendeu os fundamentos, está na hora de colocar em prática! 
            Comece hoje mesmo a transformar a gestão do seu negócio.
          </p>
          <button className="bg-[#13ec5b] text-[#102216] px-8 py-4 rounded-xl font-black text-lg hover:bg-[#0fb845] transition-colors shadow-lg shadow-[#13ec5b]/20">
            ABRIR O EZEN AGORA
          </button>
        </div>
      </div>
    </div>
  );
}