#!/bin/bash
set -e

echo "Starting custom entrypoint..."

# Run plugin download script
/scripts/download-plugin.sh

# Start Neo4j with original entrypoint
exec /startup/docker-entrypoint.sh neo4j &

# Wait for Neo4j to be ready
until cypher-shell -u neo4j -p your_password "RETURN 1;" >/dev/null 2>&1; do
  echo "Waiting for Neo4j to be ready..."
  sleep 5
done

echo "Neo4j is ready. Loading data..."
cypher-shell -u neo4j -p your_password -f /var/lib/neo4j/init-db.cypher

echo "Data loaded successfully."
# Keep the container running
wait $!
