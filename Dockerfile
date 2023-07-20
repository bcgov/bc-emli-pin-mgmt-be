# Install dependencies only when needed
FROM registry.access.redhat.com/ubi8/nodejs-16 AS deps

#Identify working directory
USER 0
WORKDIR /app

#Install rpm packages from package.json
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm ci

#Copy over app to app folder
COPY . .

RUN npm run build

#Expose server at port ( accessible outside of container)
USER 1001

EXPOSE 3000

ENV PORT 3000

#Start app 
CMD ["node", "dist/index.js"]