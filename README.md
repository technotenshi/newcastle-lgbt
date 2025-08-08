# Newcastle LGBT Website

This repository contains the source for the **Newcastle LGBT** site. It is built with [Gridsome](https://gridsome.org/) and Vue.js, with most content written in Markdown under the `content/` directory.

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/458c411819a6488fb55ce082d7cc5d3b)](https://app.codacy.com?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

## Requirements
- Node.js 22
- Yarn v1

Install dependencies with:

```bash
yarn install
```

## Local development
Run a development server at `http://localhost:8080`:

```bash
yarn develop
```

## Production build
Generate a static site in the `dist` folder:

```bash
yarn build
```

### Image compression
Project images under `src/assets/images` are compressed during `yarn build` using
`image-webpack-loader`. Configuration lives in `gridsome.config.js`. If the
validation step detects unsupported or empty images, the build will fail with a
descriptive error.

## Validation
Run linting and a production build before committing changes:

```bash
yarn lint
yarn build
```

`yarn lint` enforces code style, while `yarn build` verifies the site builds
successfully for deployment.

ESLint is configured with `vue-eslint-parser` and modern parser options. Browser
and Node globals are available by default.

To automatically fix lint issues when possible:

```bash
yarn lint:fix
```

## Docker workflow
The project includes a `Dockerfile` and `docker-compose.yml` for containerised development. Use `docker compose up app` to run the Gridsome dev server or `just develop` if you have [just](https://just.systems) installed.

## Content sources
- `content/news` – Markdown files for news posts
- `content/events` – Upcoming events
- `content/council` – Council information

Additional homepage features are defined in `data/features.json`.

## License
This project is released under the MIT License. See [LICENSE](LICENSE) for details.
