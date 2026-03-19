.DEFAULT_GOAL := default

.PHONY: default install install-dependencies develop down logs lint lint-fix audit build preview prod

default:
	@echo 'Hello, world!'

# Build Docker images
install:
	COMPOSE_BAKE=true docker compose build

# Install npm dependencies inside the container
install-dependencies: install
	docker compose run -it --rm app yarn install --check-files --non-interactive --audit

# Start the dev server at http://localhost:3000
develop:
	COMPOSE_BAKE=true docker compose up app --build

# Stop and remove containers
down:
	docker compose down

# Follow container logs
logs:
	docker compose logs -f

# Run ESLint checks
lint:
	docker compose run -it --rm app yarn lint

# Auto-fix ESLint issues
lint-fix:
	docker compose run -it --rm app yarn lint:fix

# Run dependency vulnerability audit
audit:
	docker compose run -it --rm app yarn audit

# Generate static site into .output/public
build:
	docker compose run -it --rm app yarn build

# Build then serve preview at http://localhost:3001
preview: build
	docker compose up preview

# Alias for preview
prod: preview
