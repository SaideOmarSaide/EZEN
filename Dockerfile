# Dockerfile otimizado para Coolify - EZEN Financeiro
# Sem Nginx - Coolify cuida do proxy reverso

FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build de produção
RUN npm run build

# Stage final: Servir aplicação
FROM node:18-alpine

# Instalar 'serve' globalmente (servidor HTTP estático leve)
RUN npm install -g serve

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos buildados do stage anterior
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Mudar para usuário não-root
USER nodejs

# Expor porta 3006 (padrão do serve)
EXPOSE 3006

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Comando para iniciar o servidor
# -s: modo SPA (single page application)
# -l: porta de escuta
CMD ["serve", "-s", "dist", "-l", "3006"]
