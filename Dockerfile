FROM neo4j:latest

# Copy the custom entrypoint script
COPY scripts/seed.sh /seed.sh

# Set the custom entrypoint
ENTRYPOINT ["/seed.sh"]
