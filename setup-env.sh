#!/bin/bash

# Environment Setup Script for BevyHR Frontend

echo "🚀 Setting up environment for BevyHR Frontend..."

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Create .env.local with default development settings
cat > .env.local << EOF
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
EOF

echo "✅ Created .env.local with default development settings"
echo ""
echo "📝 To customize for different environments:"
echo "   Development: NEXT_PUBLIC_API_BASE_URL=http://localhost:3000"
echo "   Production:  NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com"
echo "   Staging:     NEXT_PUBLIC_API_BASE_URL=https://staging-api.your-domain.com"
echo ""
echo "🔄 Please restart your development server after making changes"
echo ""
echo "📖 See ENVIRONMENT_SETUP.md for more details"
