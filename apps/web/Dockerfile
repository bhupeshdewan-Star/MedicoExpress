FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --include=optional --no-omit=optional

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"]
