# Install dependencies only when needed
FROM registry.access.redhat.com/ubi8/nodejs-16 AS deps

#Make app directory in container
# RUN mkdir /app

#Identify working directory
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm ci

#Copy over app to app folder
COPY . /app 

#Expose server at port ( accessible outside of container)
EXPOSE 8080 

#Start app 
CMD ["node", "server.js"]