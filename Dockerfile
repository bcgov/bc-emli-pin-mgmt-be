# adapted from https://github.com/vercel/next.js/tree/canary/examples/with-docker
# needs next.config.js to set build to stand-alone with context as follows
# /** @type {import('next').NextConfig} */
# module.exports = {
#  output: 'standalone',
# }

# Recommended to have .dockerignore file with the following content
# Dockerfile
# .dockerignore
# node_modules
# npm-debug.log
# README.md
# .next
# .git

# Install dependencies only when needed
FROM registry.access.redhat.com/ubi8/nodejs-16 AS deps
USER 0
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm ci

# Rebuild the source code only when needed
FROM registry.access.redhat.com/ubi8/nodejs-16 AS builder
USER 0
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .


# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to enable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# If using yarn uncomment out and comment out npm below
# RUN yarn build

# If using npm comment out above and use below instead
RUN npm run build

# Production image, copy all the files and run next
FROM registry.access.redhat.com/ubi8/nodejs-16-minimal AS runner
USER 0
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to enable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/public ./public

COPY --from=builder /app/package.json /app/server.js /app
COPY --from=builder /app/node_modules /app/node_modules

USER 1001

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]