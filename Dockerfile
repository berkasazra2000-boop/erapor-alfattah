# Gunakan image Node.js versi ringan (Alpine)
FROM node:20-alpine AS base

# Instal dependensi yang dibutuhkan Chromium
# Ini adalah langkah krusial agar Puppeteer bisa berjalan
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Beri tahu Puppeteer untuk menggunakan Chromium sistem, bukan mengunduh sendiri
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Atur direktori kerja
WORKDIR /app

# Salin file package.json dan package-lock.json
COPY package*.json ./

# Instal dependensi aplikasi
RUN npm ci

# Salin seluruh kode proyek
COPY . .

# Lakukan build untuk production
RUN npm run build

# Ekspos port yang akan digunakan (Next.js default-nya 3000)
EXPOSE 3000

# Jalankan aplikasi
CMD ["npm", "start"]