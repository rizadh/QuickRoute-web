FROM node:11-alpine

EXPOSE 8080

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
CMD npm start
