FROM node:19.5.0-alpine
WORKDIR /adameds-inventory
COPY . .
ENV APPLICATION_HOST=0.0.0.0
ENV APPLICATION_PORT=8088
RUN npm install
EXPOSE $APPLICATION_PORT/TCP
CMD ["npm", "run", "start"]
