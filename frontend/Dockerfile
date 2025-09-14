FROM node:24

#Working directory
WORKDIR /app

#Copy package json files
COPY package*.json ./

#Install other dependencies
RUN npm install

#Copy source code 
COPY . .

#Set Environment Port
ENV PORT=5173

#Expose port in Local
EXPOSE 5173

#Start vite dev server / The --host is needed so Vite binds to 0.0.0.0 allowing access from the outside 
CMD ["npm", "run", "dev", "--", "--host"]


#docker build -t <image-name>:<version> .
#docker run -d --name <container-name> -p <local>:<container> <img-name> 