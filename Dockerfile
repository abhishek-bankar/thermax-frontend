# Stage 1: Build
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

# Set the working directory
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# Copy the .env.production file
COPY .env.production .env

# Copy SSL files
COPY server.key /etc/ssl/private/
COPY server.csr /etc/ssl/certs/

# Install only production dependencies
RUN npm install --only=production

# Expose port 3000
EXPOSE 3000

# Configure the application to use SSL by setting environment variables
ENV NODE_ENV=production
ENV SSL_CERT_PATH=/etc/ssl/certs/server.csr
ENV SSL_KEY_PATH=/etc/ssl/private/server.key

# Start the Next.js application with SSL enabled
CMD ["npm", "start"]
