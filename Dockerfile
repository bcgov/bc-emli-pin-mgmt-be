# Install dependencies only when needed
FROM registry.access.redhat.com/ubi8/nodejs-16 AS deps

#Make app directory in container
RUN mkdir /app

#Identify working directory
WORKDIR /app

#Copy package
COPY package.json /app

#Install rpm packages from package.json
RUN npm install

#Copy over app to app folder
COPY . /app 

#Expose server at port ( accessible outside of container)
EXPOSE 8080 

#Start app 
CMD ["node", "server.js"]