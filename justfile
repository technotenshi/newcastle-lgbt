default:
    echo 'Hello, world!'
install:
    COMPOSE_BAKE=true docker compose build
install-dependencies: install
    docker compose run -it --rm app yarn install --check-files --non-interactive --audit
develop:
    COMPOSE_BAKE=true docker compose up app --build
down:
    docker compose down
logs:
    docker compose logs -f
lint:
    docker compose run -it --rm app yarn lint
lint-fix:
    docker compose run -it --rm app yarn lint-fix
build:
    docker compose run -it --rm app yarn build
prod:
    docker compose up prod

