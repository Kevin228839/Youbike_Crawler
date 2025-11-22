FROM node:18

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 30005

CMD [ "node", "src/index.js" ]