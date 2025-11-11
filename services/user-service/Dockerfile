FROM node:18

WORKDIR /app

COPY services/user-service/package*.json ./
RUN npm install

COPY services/user-service/. .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]