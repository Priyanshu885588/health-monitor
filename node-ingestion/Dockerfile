# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Use 'npm ci' for reproducible builds in CI
RUN npm ci
COPY . .

# Stage 2: Production Runtime
FROM node:20-alpine
# Set environment to production
ENV NODE_ENV=production
WORKDIR /app

# DevSecOps: Use non-root user for security
USER node

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

EXPOSE 3000
# Use exec form for proper signal handling (SIGTERM)
CMD ["node", "src/index.js"]