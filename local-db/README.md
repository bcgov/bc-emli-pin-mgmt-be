You can only run these commands out of this directory.

# Setup
To run these commands you will need to install:
- Docker (https://docs.docker.com/docker-for-mac/install)
- A GUI for PostgreSQL (i.e. https://eggerapps.at/postico/)
- Create a .env in local-db with the password of the local postgres database

# Start & Seed
For the first time setup, run `docker-compose up --build`. This will download the docker image for Postgres 12.x and install it in a docker container. It will also run the migration in init-pg.sql.

# Stop (Don't Remove Data)
The process will always be running in a terminal, so when you're ready to start down, you have to `Cmd+C` to stop the process from running. You might get a weird error, but that's fine. To fully stop the docker container, run `docker-compose down`. This should be done if you'd like to delete the tables and re-run the migration.

# Restart (Don't Alter Data)
`docker-compose up` - omit the build flag.