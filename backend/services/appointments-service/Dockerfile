FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 4004
CMD ["npm", "run", "start"]
