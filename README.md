# It's Gymmy Stewart!

Yo you gotta have these shits brother
- [atlas](https://atlasgo.io/getting-started/#installation)
- [turso](https://docs.turso.tech/reference/turso-cli#installation)
- [sqlite3](https://www.sqlite.org/download.html)

## Local DB

Setup the local sqlite db my guy

```sh
npm run db:create-local
```

## Development

From your terminal:

```sh
npm run dev
```

## Turso DB

Env variables:

```
DB_URL=
DB_TOKEN=
```

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`
