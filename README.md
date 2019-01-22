# serve-cra

This is a small static web server for hosting create-react-app (CRA) apps. It is meant to be run in a docker container and can be used to distribute a CRA app as a docker image.

It injects all environment variables starting with `CRA_` into the app as a global variable (`window.CRA_ENV` by default). The prefix `CRA_` is stripped when injected, e.g. `CRA_BACKEND=https://api.demo.com/v1` will be available as `window.CRA_ENV.BACKEND`.

## Quickstart

In the root of your create-react-app repo

Create file `.dockerignore`

```
.git
*Dockerfile*
*docker-compose*
node_modules
npm-debug.log
```

Create file `Dockerfile`

```dockerfile
# stage 0
FROM node:10-alpine as builder

WORKDIR /opt/cra-builder

RUN apk add --no-cache git

COPY package*.json /opt/cra-builder/

RUN npm install

COPY . .

ENV NODE_ENV=production

RUN npm run build

# stage 1
FROM kraf/serve-cra

WORKDIR /

COPY --from=builder /opt/cra-builder/build /opt/cra
```

## Config

You can configure the server via environment variables

- **SC_ROOT_PATH** - Location of the create-react-app build folder, default: `/opt/cra`
- **SC_WINDOW_EXPORT** - Name of the global JavaScript export, default: `CRA_ENV`
- **SC_TEMP_FILE** - Where the server stores the modified `index.html` file, default: `/tmp/serve-cra_index.html`
- **SC_PORT** - Port, default: `3000`
