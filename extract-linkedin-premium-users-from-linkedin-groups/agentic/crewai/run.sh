#!/bin/bash

# LinkedIn Premium Member Extractor - CrewAI
# Run Script

set -e

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Run Streamlit App
echo "🚀 Starting LinkedIn Premium Extractor..."
uv run streamlit run App.py

