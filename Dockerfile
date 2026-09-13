FROM node:20-slim

WORKDIR /app

# better-sqlite3 requires build tools for native addon compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY node_modules ./node_modules
COPY . .

# Prebuilt binary from host links against libnode.so and a newer glibc; force a
# clean rebuild from source using headers already bundled in this image.
# Must run after "COPY . ." so nothing overwrites the freshly built binary.
RUN rm -rf node_modules/better-sqlite3/build node_modules/better-sqlite3/prebuilds && \
    npm rebuild better-sqlite3 --build-from-source --nodedir=/usr/local

# Clear host-built artifacts and rebuild in container
RUN rm -rf .next && npm run build

ENV NODE_ENV=production
ENV DATABASE_DIR=/app/data

EXPOSE 3000

RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
