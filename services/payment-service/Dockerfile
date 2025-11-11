FROM node:18-alpine

WORKDIR /app

COPY services/payment-service/package*.json ./
RUN npm install

COPY services/payment-service/. .

# Generate Prisma client if schema exists
RUN if [ -f prisma/schema.prisma ]; then npx prisma generate; fi

EXPOSE 3006

CMD ["npm", "run", "dev"]
