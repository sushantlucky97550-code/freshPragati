#!/bin/sh
set -e

PGDATA="/var/lib/postgresql/data"
POSTGRES_USER="${POSTGRES_USER:-railopt}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-railopt123}"
POSTGRES_DB="${POSTGRES_DB:-railopt}"

mkdir -p "$PGDATA" /run/postgresql
chown -R postgres:postgres "$PGDATA" /run/postgresql
chmod 0700 "$PGDATA"

if [ ! -s "$PGDATA/PG_VERSION" ]; then
    echo "Initializing database cluster in $PGDATA..."
    su-exec postgres initdb -D "$PGDATA" --auth-local=trust --auth-host=scram-sha-256

    echo "host all all 0.0.0.0/0 scram-sha-256" >> "$PGDATA/pg_hba.conf"
    echo "listen_addresses = '*'" >> "$PGDATA/postgresql.conf"

    echo "Starting temporary PostgreSQL instance..."
    su-exec postgres pg_ctl -D "$PGDATA" -w start

    echo "Creating user and database..."
    su-exec postgres psql -v ON_ERROR_STOP=1 --username postgres <<-EOSQL
        CREATE USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';
        CREATE DATABASE $POSTGRES_DB OWNER $POSTGRES_USER;
        GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
EOSQL

    echo "Stopping temporary PostgreSQL instance..."
    su-exec postgres pg_ctl -D "$PGDATA" -m fast -w stop
    echo "PostgreSQL initialization completed."
fi

exec su-exec postgres postgres -D "$PGDATA"
