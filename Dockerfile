FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

EXPOSE 8080
CMD node -r dotenv/config index.js