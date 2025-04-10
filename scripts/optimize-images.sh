#!/bin/bash

set -e

BUILD_DIR="../build/chrome-mv3-prod"
if [ -n "$1" ]; then
  BUILD_DIR="$1"
fi

echo "Starting image optimization..."
echo "Build directory: $BUILD_DIR"

# Make sure build directory exists
if [ ! -d "$BUILD_DIR" ]; then
  echo "Error: Build directory not found: $BUILD_DIR"
  exit 1
fi

# Find image files
echo "Finding image files..."
IMAGE_FILES=$(find "$BUILD_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.webp" -o -name "*.svg" \))

if [ -z "$IMAGE_FILES" ]; then
  echo "No image files found."
  exit 0
fi

TOTAL_FILES=$(echo "$IMAGE_FILES" | wc -l)
echo "Found $TOTAL_FILES image files."

# Process each file
for file in $IMAGE_FILES; do
  filename=$(basename "$file")
  ext="${filename##*.}"
  ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
  
  # Get original file size
  original_size=$(wc -c < "$file")
  original_kb=$(echo "scale=2; $original_size / 1024" | bc)
  
  # Apply appropriate optimization based on file type
  case "$ext" in
    png)
      if command -v pngquant &>/dev/null; then
        pngquant --force --quality=65-80 --skip-if-larger --strip --output "$file" -- "$file" 2>/dev/null || true
      elif command -v optipng &>/dev/null; then
        optipng -o5 -quiet "$file" 2>/dev/null || true
      fi
      ;;
    jpg|jpeg)
      if command -v jpegoptim &>/dev/null; then
        jpegoptim --strip-all --max=85 "$file" 2>/dev/null || true
      fi
      ;;
    svg)
      if command -v svgo &>/dev/null; then
        svgo --quiet "$file" -o "$file" 2>/dev/null || true
      fi
      ;;
    gif)
      if command -v gifsicle &>/dev/null; then
        gifsicle -O3 "$file" -o "$file" 2>/dev/null || true
      fi
      ;;
    webp)
      if command -v cwebp &>/dev/null; then
        temp_file="${file}.temp"
        mv "$file" "$temp_file"
        cwebp -q 80 "$temp_file" -o "$file" 2>/dev/null || true
        rm -f "$temp_file"
      fi
      ;;
  esac
  
  # Get new file size and calculate reduction
  new_size=$(wc -c < "$file")
  new_kb=$(echo "scale=2; $new_size / 1024" | bc)
  
  if [ "$original_size" -gt "$new_size" ]; then
    reduction=$(echo "scale=2; ($original_size - $new_size) / $original_size * 100" | bc)
    echo "$filename: ${original_kb}KB → ${new_kb}KB (${reduction}% reduction)"
  else
    increase=$(echo "scale=2; ($new_size - $original_size) / $original_size * 100" | bc)
    echo "$filename: ${original_kb}KB → ${new_kb}KB (-${increase}% reduction)"
  fi
done

echo "Image optimization complete!" 