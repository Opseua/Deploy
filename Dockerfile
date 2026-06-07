FROM node:20-slim

WORKDIR /app

# .dockerignore já exclui files/ e frps.exe
COPY communication/ ./communication/
COPY frps/ ./frps/
COPY version/ ./version/
COPY main.js .
COPY package.json .

RUN chmod +x ./frps/frps
RUN npm install

CMD ["node", "main.js"]