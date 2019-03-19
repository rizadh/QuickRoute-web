FROM node:alpine

EXPOSE 8000

WORKDIR /app

RUN apk add --no-cache make gcc g++ python linux-headers udev

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build
CMD npm run serve
