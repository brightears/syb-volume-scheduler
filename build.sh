#!/bin/bash
# Build script for Render deployment

echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

echo "Checking for web directory:"
if [ -d "web" ]; then
    echo "Found web directory"
    cd web
    echo "Changed to web directory: $(pwd)"
    echo "Web directory contents:"
    ls -la
    
    echo "Installing dependencies..."
    npm install
    
    echo "Building application..."
    npm run build
else
    echo "ERROR: web directory not found!"
    exit 1
fi