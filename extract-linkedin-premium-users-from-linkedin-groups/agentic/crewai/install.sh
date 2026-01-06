#!/bin/bash

# LinkedIn Premium Member Extractor - CrewAI
# Installation Script

set -e  # Exit on error

echo "🚀 LinkedIn Premium Member Extractor - CrewAI Setup"
echo "=================================================="
echo ""

# Check if UV is installed
if ! command -v uv &> /dev/null; then
    echo "📦 UV not found. Installing UV..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    echo "✅ UV installed successfully!"
    echo "⚠️  Please restart your terminal and run this script again."
    exit 0
fi

echo "✅ UV is installed"
echo ""

# Install dependencies
echo "📦 Installing dependencies with UV..."
uv sync
echo "✅ Dependencies installed successfully!"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your API tokens:"
    echo "   - CONNECTSAFELY_API_TOKEN"
    echo "   - OPENAI_API_KEY"
    echo "   - (Optional) Google OAuth credentials for Sheets export"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Success message
echo "=================================================="
echo "🎉 Installation Complete!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API tokens"
echo "2. Activate virtual environment:"
echo "   source .venv/bin/activate  (Linux/Mac)"
echo "   .venv\\Scripts\\activate  (Windows)"
echo "3. Run Streamlit app:"
echo "   streamlit run app.py"
echo ""
echo "📚 For more details, see README.md"
echo "🆘 Need help? support@connectsafely.ai"
echo ""