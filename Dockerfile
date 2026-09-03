# ---- Mess website backend ----
FROM node:20-alpine

WORKDIR /app

# Install dependencies first so this layer is cached when only source changes.
COPY package.json ./
RUN npm install --omit=dev

# App source
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
