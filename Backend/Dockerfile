FROM node:20

WORKDIR /app

COPY package*.json ./

RUN rm -rf node_modules package-lock.json

RUN npm install

RUN npm uninstall bcrypt && npm install bcrypt

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

COPY .env .env

ENV PORT=8081

EXPOSE 8081

CMD [ "node", "serverkw.js" ]