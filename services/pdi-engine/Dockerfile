FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port (updated to match docker-compose)
EXPOSE 8004

# Start the application in development mode
CMD ["npm", "run", "dev"]