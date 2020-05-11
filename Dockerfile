FROM node:12
RUN npm i -g @nestjs/cli
RUN npm i bcrypt@latest
RUN mkdir -p /autorizador-nest
WORKDIR /autorizador-nest