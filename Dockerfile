FROM node:19.5.0-alpine
WORKDIR /adameds-inventory
COPY . .
ENV APPLICATION_HOST=0.0.0.0
ENV APPLICATION_PORT=8086
RUN npm install
CMD ["npm", "run", "start"]
