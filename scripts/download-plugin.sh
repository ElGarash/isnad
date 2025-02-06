#!/bin/bash
set -e

PLUGIN_URL="https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/5.26.0/apoc-xls-dependencies-5.26.0-all.jar"
PLUGIN_PATH="/plugins/apoc-xls-dependencies-5.26.0-all.jar"

echo "Checking for APOC XLS plugin..."
if [ ! -f "$PLUGIN_PATH" ]; then
    echo "Downloading APOC XLS plugin..."
    wget -q "$PLUGIN_URL" -P /plugins/
    chmod 777 "$PLUGIN_PATH"
    echo "Plugin downloaded successfully"
else
    echo "Plugin already exists"
fi
