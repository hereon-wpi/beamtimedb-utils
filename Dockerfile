FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN apt-get update && apt-get install -y libhdf5-dev

ENV HDF5_HOME_LINUX=/usr/lib/x86_64-linux-gnu/hdf5/serial

RUN npm install --hdf5_home_linux=${HDF5_HOME_LINUX}
# If you are building your code for production
# RUN npm ci --only=production

COPY js /usr/src/app/js

