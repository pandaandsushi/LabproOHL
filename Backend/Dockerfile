FROM node:20

WORKDIR /app

COPY package*.json ./

RUN rm -rf node_modules package-lock.json

RUN npm install

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

ENV PORT=8081

EXPOSE 8081

CMD [ "node", "serverkw.js" ]