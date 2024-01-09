# Install dependencies only when needed
FROM registry.access.redhat.com/ubi8/nodejs-16 AS deps
USER 0
WORKDIR /app

# Ensure that the user can access all application files
RUN chmod -R g+rwX /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN npm run db:migrate

RUN npm run build

USER 1001

EXPOSE 3000

ENV PORT 3000

CMD ["node", "dist/index.js"]