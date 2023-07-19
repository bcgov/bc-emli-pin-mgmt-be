# Install dependencies only when needed
FROM registry.access.redhat.com/ubi8/nodejs-16 AS deps

#Identify working directory
WORKDIR /app

#Copy package
COPY package.json /app

#Install rpm packages from package.json
RUN npm install

#Copy over app to app folder
COPY . /app 

#Expose server at port ( accessible outside of container)
EXPOSE 3000

#Start app 
CMD ["node", "dist/index.js"]