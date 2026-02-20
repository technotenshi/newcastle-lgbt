# Newcastle LGBT Website

This repository contains the source for the **Newcastle LGBT** site. It is built with [Nuxt](https://nuxt.com/) and Vue 3, with most content written in Markdown under the `content/` directory and served through Nuxt Content.

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/458c411819a6488fb55ce082d7cc5d3b)](https://app.codacy.com?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

## Requirements
- Node.js 24 (for local, non-Docker development)
- Yarn v1 (`1.22.22`, Corepack recommended)
- Docker + Docker Compose (optional, for containerized workflow)

Install dependencies with:

```bash
yarn install
```

## Nuxt commands
- `yarn dev` – start the development server at `http://localhost:3000`
- `yarn build` – generate the static site into `.output/public`
- `yarn preview` – serve the latest build from `.output/public`

## Local development
Run the dev server locally:

```bash
yarn dev
```

If you are developing inside Docker or a remote environment, expose the server by setting the host:

```bash
HOST=0.0.0.0 yarn dev
```

## Static build & deployment
Create a production build and serve it locally:

```bash
yarn build
yarn preview
```

After `yarn build`, all deployable assets live under `.output/public`. Deploy by copying that directory to your hosting provider. For example, to publish over SSH:

```bash
yarn build
rsync -avz .output/public/ user@server:/var/www/newcastle-lgbt
```

`yarn preview` runs the same Nitro server used in production so you can verify the build before publishing.

## Validation
Run linting and a production build before committing changes:

```bash
yarn lint
yarn build
```

`yarn lint` enforces code style, while `yarn build` verifies the site builds successfully for deployment. To automatically fix lint issues when possible:

```bash
yarn lint:fix
```

## Docker workflow
The project includes a `Dockerfile`, `docker-compose.yml`, and `Makefile` targets for containerized development:

- `make install` – build container images
- `make install-dependencies` – install dependencies in the app container
- `make develop` – start the dev server on `http://localhost:3000`
- `make lint` / `make lint-fix` – run linting in the container
- `make audit` – run dependency vulnerability audit in the container
- `make build` – run production build in the container
- `make preview` – build and serve preview at `http://localhost:3001`
- `make logs` – follow container logs
- `make down` – stop and remove running containers

## Content sources
- `content/news` – Markdown files for news posts
- `content/events` – Upcoming events
- `content/council` – Council information
- `content/features.json` – Homepage feature cards consumed by Nuxt Content

## License
This project is released under the MIT License. See [LICENSE](LICENSE) for details.
