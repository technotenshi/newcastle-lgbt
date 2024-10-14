default:
    echo 'Hello, world!'
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
