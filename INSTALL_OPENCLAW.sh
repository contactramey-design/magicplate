#!/bin/bash
# OpenClaw Installation Script for MagicPlate

echo "🦞 Installing OpenClaw for MagicPlate.ai..."
echo ""

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo "❌ curl is not installed. Please install curl first."
    exit 1
fi

# Install OpenClaw
echo "📥 Downloading and installing OpenClaw..."
curl -fsSL https://openclaw.ai/install.sh | bash

# Check if installation was successful
if command -v openclaw &> /dev/null; then
    echo ""
    echo "✅ OpenClaw installed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Run: openclaw onboard"
    echo "2. Follow the prompts to set up your assistant"
    echo "3. Connect WhatsApp/Telegram"
    echo ""
    echo "See OPENCLAW_QUICK_START.md for full instructions"
else
    echo ""
    echo "⚠️  OpenClaw may not be in PATH. Try:"
    echo "   source ~/.bashrc"
    echo "   # or"
    echo "   source ~/.zshrc"
    echo ""
    echo "Then run: openclaw onboard"
fi
