default:
    echo 'Hello, world!'
install-dependencies:
    docker compose run -it --rm app yarn install --check-files --non-interactive --audit
develop:
    docker compose up app --build
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
sync:
    ./sync.sh
invalidate:
    ./invalidate.sh
deploy: sync invalidate
