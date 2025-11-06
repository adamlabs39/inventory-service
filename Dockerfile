FROM node:25-alpine3.22
WORKDIR /adameds-inventory
COPY . .
ENV APPLICATION_HOST=0.0.0.0
ENV APPLICATION_PORT=8086
RUN npm install
EXPOSE $APPLICATION_PORT/tcp
CMD ["npm", "run", "start"]
