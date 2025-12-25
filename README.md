# EZEN - Gestão Financeira Inteligente (Offline-First)

![EZEN Banner](https://picsum.photos/1200/400?grayscale&blur=2)

O **EZEN** é uma aplicação progressiva (PWA) de gestão financeira projetada especificamente para operar em cenários de conectividade instável. Focado no mercado moçambicano, o sistema prioriza o funcionamento **Offline-First**, garantindo que o comerciante nunca pare de vender, mesmo sem acesso à internet.

## 🚀 Diferenciais Tecnológicos

- **Arquitetura Offline-First**: O estado da aplicação é persistido localmente no **IndexedDB** através de uma camada de repositório personalizada.
- **Sincronização Inteligente**: Um `SyncManager` monitora a fila de ações pendentes e as processa automaticamente via **Supabase** assim que a conexão é restabelecida.
- **PWA (Progressive Web App)**: Instalável em dispositivos Android, iOS e Desktop, com suporte a cache de ativos via Service Workers.
- **Segurança de Dados**: Implementação rigorosa de **Row Level Security (RLS)** no Supabase, garantindo isolamento total dos dados por usuário.

## 🛠️ Stack Técnica

- **Frontend**: React 19 + TypeScript.
- **Estilização**: Tailwind CSS (Design System escuro otimizado para leitura).
- **Banco de Dados Local**: IndexedDB (via API nativa).
- **Backend/BaaS**: Supabase (Auth & PostgreSQL).
- **Deploy/Infra**: Docker (Nginx Alpine).

## 📋 Funcionalidades Principais

1.  **Dashboard Executivo**: Visão geral de vendas, fiados, contas a pagar e saldo projetado.
2.  **Caixa Diário (POS)**: Abertura e fechamento de sessões, registro de vendas e movimentações de entrada/saída (sangrias).
3.  **Gestão de Fiados (Receivables)**: Controle detalhado de créditos concedidos a clientes com datas de vencimento.
4.  **Contas a Pagar (Payables)**: Agendamento e liquidação de dívidas com fornecedores.
5.  **Gestão de Fornecedores**: Cadastro de parceiros, histórico de compras e integração com contas a pagar.
6.  **Relatórios de Saúde**: Gráficos de desempenho semanal e distribuição de despesas.

## ⚙️ Configuração do Ambiente

### 1. Requisitos Prévios
- Node.js (v18+)
- Docker (opcional para deploy)
- Uma conta no [Supabase](https://supabase.com)

### 2. Configuração do Banco de Dados (Supabase)
Execute o script SQL contido no diretório de documentação ou utilize o esquema fornecido no assistente de IA para criar as tabelas `sales`, `suppliers`, `cash_sessions`, `cash_movements`, `receivables`, `payables` e `purchases`. Certifique-se de habilitar o RLS.

### 3. Instalação Local
```bash
# Clone o repositório
git clone https://github.com/SaideOmarSaide/EZEN.git

# Instale as dependências
npm install

# Inicie o ambiente de desenvolvimento
npm run dev
```

## 🐳 Execução com Docker

O projeto inclui uma configuração otimizada para produção:

```bash
# Build da imagem
docker build -t ezen-app .

# Execução do container
docker run -p 8080:80 ezen-app
```

## 🧠 Lógica de Sincronização

A aplicação utiliza um padrão de **Fila de Sincronização**:
1.  Toda alteração (Create/Update/Delete) é salva no `IndexedDB` e uma "Action" é adicionada à store `sync_queue`.
2.  O `SyncManager` detecta o evento `online` do navegador.
3.  As ações são enviadas para o Supabase usando `upsert` para garantir idempotência.
4.  Após a confirmação do servidor, o registro local é marcado como `synced` e removido da fila.

## 📄 Licença

Este projeto é desenvolvido para o ecossistema EZEN Moçambique. Todos os direitos reservados.

---
**Desenvolvido com foco em resiliência e performance.**