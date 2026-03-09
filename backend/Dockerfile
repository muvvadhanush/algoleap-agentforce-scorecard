FROM node:22-bullseye

# Install necessary local dependencies for running Puppeteer and Chrome in a Linux container
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy packages and prisma schema first for caching
COPY package*.json ./
COPY prisma ./prisma/

# Install Node dependencies and generate the Prisma client
RUN npm install
RUN npx prisma generate

# Copy the remaining project files
COPY . .

# Build the typescript server
RUN npm run build

# Set the Puppeteer path to the installed Chrome version
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"
ENV PORT=5000

# Start server
CMD [ "npm", "start" ]
