FROM node:11-alpine

EXPOSE 8000

WORKDIR /app

RUN apk add --no-cache make gcc g++ python linux-headers udev texlive

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
CMD npm start
