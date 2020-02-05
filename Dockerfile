FROM node:8

RUN mkdir -p /prueba-error
ADD . /prueba-error

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

WORKDIR /prueba-error

# optionally if you want to run npm global bin without specifying path
# ENV PATH=$PATH:/home/node/.npm-global/bin

# Set the user to use when running this image
USER node

RUN ls -la

RUN npm i -g @nestjs/cli


# Bundle app source
COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]