# ==================================
# Dockerfile for Express.js Server
# ==================================

# Stage 1: Dependencies and system packages
FROM node:20-alpine AS deps
LABEL stage=deps

# Install system dependencies for PDF processing and image recognition
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    tesseract-ocr \
    tesseract-ocr-data-eng \
    tesseract-ocr-data-vie

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci --ignore-scripts && npm cache clean --force

# Stage 2: Builder
FROM node:20-alpine AS builder
LABEL stage=builder

# Install system dependencies needed for build
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Stage 3: Runner (Production)
FROM node:20-alpine AS runner
LABEL stage=runner

# Install only runtime system dependencies
RUN apk add --no-cache \
    dumb-init \
    tesseract-ocr \
    tesseract-ocr-data-eng \
    tesseract-ocr-data-vie \
    curl

WORKDIR /app

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy built application and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create uploads directory and set permissions
RUN mkdir -p uploads/avatars uploads/logos uploads/cvs uploads/temp
RUN chown -R expressjs:nodejs uploads
RUN chmod -R 755 uploads

# Copy existing uploads if they exist
COPY --chown=expressjs:nodejs uploads/ uploads/ || true

# Switch to non-root user
USER expressjs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the application with dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]


















