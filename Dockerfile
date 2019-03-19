FROM node:latest

EXPOSE 8000

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
CMD npm start
