#!/bin/bash

set -e

echo "Installing image optimization tools..."

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Detected Linux..."
    if command -v apt-get &> /dev/null; then
        echo "Installing with apt..."
        sudo apt-get update
        sudo apt-get install -y pngquant optipng jpegoptim svgo gifsicle webp
    elif command -v dnf &> /dev/null; then
        echo "Installing with dnf..."
        sudo dnf install -y pngquant optipng jpegoptim nodejs-svgo gifsicle libwebp-tools
    elif command -v yum &> /dev/null; then
        echo "Installing with yum..."
        sudo yum install -y pngquant optipng jpegoptim gifsicle libwebp-tools
        # SVGO needs to be installed via npm for yum
        npm install -g svgo
    elif command -v pacman &> /dev/null; then
        echo "Installing with pacman..."
        sudo pacman -S --noconfirm pngquant optipng jpegoptim svgo gifsicle libwebp
    else
        echo "Unsupported Linux package manager. Please install manually:"
        echo "- pngquant (PNG optimization)"
        echo "- optipng (PNG optimization)"
        echo "- jpegoptim (JPEG optimization)"
        echo "- svgo (SVG optimization)"
        echo "- gifsicle (GIF optimization)"
        echo "- webp tools (WebP optimization)"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Detected macOS..."
    if command -v brew &> /dev/null; then
        echo "Installing with Homebrew..."
        brew install pngquant optipng jpegoptim svgo gifsicle webp
    else
        echo "Homebrew not found. Please install Homebrew first:"
        echo "  /bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "Detected Windows..."
    if command -v choco &> /dev/null; then
        echo "Installing with Chocolatey..."
        choco install pngquant optipng jpegoptim gifsicle webp -y
        # SVGO needs to be installed via npm
        npm install -g svgo
    else
        echo "Chocolatey not found. Please install Chocolatey first or manually install:"
        echo "- pngquant (PNG optimization)"
        echo "- optipng (PNG optimization)"
        echo "- jpegoptim (JPEG optimization)"
        echo "- svgo (SVG optimization)"
        echo "- gifsicle (GIF optimization)"
        echo "- webp tools (WebP optimization)"
    fi
else
    echo "Unsupported operating system: $OSTYPE"
    exit 1
fi

echo "Installation complete!"
echo "Image optimization tools are now available for the optimize.js script." 