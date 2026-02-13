#!/bin/sh
# Entrypoint script to process nginx config with environment variables

# Process the nginx template with envsubst
# Only substitute BACKEND_HOST variable
export BACKEND_HOST=${BACKEND_HOST:-task-luid-backend:8000}

# Replace the variable in nginx.conf and write to final location
envsubst '$BACKEND_HOST' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

echo "Nginx configuration generated with BACKEND_HOST=$BACKEND_HOST"

# Execute the original nginx entrypoint
exec /docker-entrypoint.sh "$@"