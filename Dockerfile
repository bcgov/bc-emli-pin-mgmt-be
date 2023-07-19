# Install dependencies only when needed
FROM registry.access.redhat.com/ubi8/nodejs-16 AS deps
USER 0
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm ci

FROM registry.access.redhat.com/ubi8/nodejs-16 AS builder
USER 0
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM registry.access.redhat.com/ubi8/nodejs-16-minimal AS runner
USER 0
WORKDIR /app

COPY --from=builder /app/package.json /app/server.js /app
COPY --from=builder /app/node_modules /app/node_modules

#Expose server at port ( accessible outside of container)
USER 1001

EXPOSE 8080

ENV PORT 8080

#Start app 
CMD ["node", "server.js"]