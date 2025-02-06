FROM neo4j:5.26.2

# Install required tools
RUN apt-get update && apt-get install -y wget

# Set working directory
WORKDIR /var/lib/neo4j

# Copy custom scripts
COPY scripts/entrypoint.sh /
COPY scripts/download-plugin.sh /scripts/
COPY scripts/init-db.cypher /var/lib/neo4j/

# Set permissions
RUN chmod +x /entrypoint.sh && \
    chmod +x /scripts/download-plugin.sh

# Use custom entrypoint
ENTRYPOINT ["/entrypoint.sh"]
