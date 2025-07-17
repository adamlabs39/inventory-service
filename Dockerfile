FROM node:19.5.0-alpine
WORKDIR /adameds-inventory
COPY . .
ENV APPLICATION_HOST=0.0.0.0
ENV APPLICATION_PORT=8088
RUN npm install
RUN npm install -g @infisical/cli
EXPOSE $APPLICATION_PORT/tcp
CMD ["sh", "-c", "infisical run --env=development -- npm run start"]
