FROM node:12

RUN mkdir -p /autorizador-nest
ADD . /autorizador-nest

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

WORKDIR /autorizador-nest

# optionally if you want to run npm global bin without specifying path
# ENV PATH=$PATH:/home/node/.npm-global/bin

# Set the user to use when running this image
USER node

RUN ls -la

RUN npm i -g @nestjs/cli
RUN npm i -g bcrypt@latest --save

# Bundle app source
COPY . .

EXPOSE 4300

CMD [ "npm", "start" ]