#!/bin/bash

echo "🔧 Building static site..."
vite build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "🚀 Starting static development server on port 5000..."
    cd dist/public && npx serve . -s -l 5000
else
    echo "❌ Build failed!"
    exit 1
fi