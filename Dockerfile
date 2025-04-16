FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive \
    NODE_OPTIONS="--no-node-snapshot --max-old-space-size=8192" \
    LOG_LEVEL=verbose

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    build-essential \
    python3 \
    libc6-dev \
    libglib2.0-0 \
    libnss3 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxtst6 \
    pngquant \
    optipng \
    jpegoptim \
    gifsicle \
    webp \
    ca-certificates \
    strace \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Install pnpm and svgo
RUN npm install -g pnpm@10 svgo

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies - Auto-approve all builds to avoid the warning
RUN pnpm install --no-optional && \
    echo "@swc/core\nesbuild\nlmdb\nsharp" > .pnpmignore && \
    pnpm add -D sharp

# Copy the rest of the application
COPY . .

# Make the build script executable 
RUN chmod +x scripts/safe-build.sh

# Build command with memory limits and debugging
CMD ["bash", "-c", "\
    echo 'Setting up environment...' && \
    ulimit -c unlimited && \
    ulimit -s unlimited && \
    echo 'Using safe build script...' && \
    ./scripts/safe-build.sh && \
    echo 'Building Firefox extension...' && \
    NODE_OPTIONS='--no-node-snapshot --max-old-space-size=8192' pnpm build:firefox && \
    echo 'Building Edge extension...' && \
    NODE_OPTIONS='--no-node-snapshot --max-old-space-size=8192' pnpm build:edge && \
    echo 'Packaging extensions...' && \
    pnpm package:all && \
    echo 'Build artifacts:' && \
    ls -la build/ && \
    echo 'Packaged files:' && \
    find build -maxdepth 1 -name '*.zip' -exec ls -lh {} \\;"] 