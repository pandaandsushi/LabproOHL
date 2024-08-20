FROM node:20

WORKDIR /app

COPY package*.json ./

RUN rm -rf node_modules package-lock.json

RUN npm install

COPY . .

ENV PORT=8080

EXPOSE 8080

CMD [ "node", "app.js" ]