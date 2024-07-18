FROM node:alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3033

ENTRYPOINT ["npm", "run", "start"]