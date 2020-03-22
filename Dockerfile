FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN apt-get update && apt-get install -y libhdf5-dev

WORKDIR /usr/src/app

ENV HDF5_DEBUG=1

ENV HDF5_HOME_LINUX=/usr/lib/x86_64-linux-gnu/hdf5/serial

RUN npm install https://github.com/Ingvord/hdf5.node.git --hdf5_home_linux=${HDF5_HOME_LINUX} --debug
# If you are building your code for production
# RUN npm ci --only=production

#COPY node_modules /usr/src/app/node_modules

COPY js /usr/src/app/js

ARG APP_UID=20229

RUN useradd -u "$APP_UID" -ms /bin/bash khokhria

USER khokhria

WORKDIR /home/khokhria