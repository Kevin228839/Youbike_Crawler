FROM node:18

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 30005

CMD [ "node", "index.js" ]