# src/FLY_IO/Dockerfile

FROM node:22-slim

WORKDIR /app

# COPIA O REPOSITÓRIO INTEIRO (o .dockerignore da raiz filtra o que não é necessário)
COPY . .

# NODE INSTALAR LIBS (package.json fica em src/FLY_IO)
RUN cd src/FLY_IO && npm install --omit=dev

WORKDIR /app/src/FLY_IO

# INICIAR SERVIDOR GERAL DO DEPLOY
CMD ["node", "server.js"]
