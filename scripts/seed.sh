#!/bin/bash
set -e

# Start Neo4j in the background
/startup/docker-entrypoint.sh neo4j &

# Wait for Neo4j to be ready
echo "Waiting for Neo4j to start..."
until cypher-shell -u neo4j -p your_password "RETURN 1;" > /dev/null 2>&1; do
    sleep 5
done

# Execute Cypher scripts
if [ -f "/seed/nodes.txt" ]; then
    echo "Seeding nodes..."
    cypher-shell -u neo4j -p your_password -f /seed/nodes.txt
fi

if [ -f "/seed/edges.txt" ]; then
    echo "Seeding edges..."
    cypher-shell -u neo4j -p your_password -f /seed/edges.txt
fi

echo "Data seeding completed."

# Keep the container running
wait
