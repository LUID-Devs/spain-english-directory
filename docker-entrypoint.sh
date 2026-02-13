#!/bin/sh
# Entrypoint script to process nginx config with environment variables

# Process the nginx template with envsubst
# Only substitute BACKEND_HOST variable
export BACKEND_HOST=${BACKEND_HOST:-task-luid-backend:8000}

echo "================================================"
echo "TaskLuid Frontend - Nginx Configuration"
echo "================================================"
echo "BACKEND_HOST: $BACKEND_HOST"
echo "Timestamp: $(date -Iseconds)"
echo "================================================"

# Test backend connectivity before starting nginx
echo "Testing backend connectivity..."
if echo "$BACKEND_HOST" | grep -q ":"; then
    BACKEND_URL="http://$BACKEND_HOST"
else
    BACKEND_URL="http://$BACKEND_HOST"
fi

# Try to resolve the backend hostname
BACKEND_HOSTNAME=$(echo "$BACKEND_HOST" | cut -d: -f1)
echo "Resolving backend hostname: $BACKEND_HOSTNAME"

# Use getent or nslookup to check DNS resolution
if command -v getent >/dev/null 2>&1; then
    BACKEND_IP=$(getent hosts "$BACKEND_HOSTNAME" | awk '{print $1}' | head -1)
    if [ -n "$BACKEND_IP" ]; then
        echo "✓ Backend DNS resolved: $BACKEND_HOSTNAME -> $BACKEND_IP"
    else
        echo "⚠ Warning: Could not resolve backend hostname: $BACKEND_HOSTNAME"
        echo "  This may be normal if using Docker internal DNS."
    fi
else
    echo "  (getent not available for DNS check)"
fi

# Replace the variable in nginx.conf and write to final location
envsubst '$BACKEND_HOST' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

if [ $? -eq 0 ]; then
    echo "✓ Nginx configuration generated successfully"
else
    echo "✗ Failed to generate nginx configuration"
    exit 1
fi

echo "================================================"
echo "Starting Nginx..."
echo "================================================"

# Execute the original nginx entrypoint
exec /docker-entrypoint.sh "$@"