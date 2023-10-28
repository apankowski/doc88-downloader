#!/bin/bash

set -euE
set -o pipefail

# Function to display usage information
show_usage() {
  echo "Usage: $0 [-h] <image_directory> <output_pdf>"
  echo "  -h: Display this help message"
  echo "  image_directory: Directory containing downloaded images"
  echo "  output_pdf: Output PDF file name"
  exit 1
}

# Check if the script was called with the help flag
if [[ $# -eq 1 && $1 == "-h" ]]; then
  show_usage
fi

# Check if we have required arguments
if [[ $# -ne 2 ]]; then
  echo "Error: Invalid number of arguments."
  show_usage
fi

image_directory="$1"
output_pdf="$2"

# Check if the image directory exists
if [[ ! -d $image_directory ]]; then
  echo "Error: '$image_directory' does not exist or is not a directory."
  exit 1
fi

# Check if 'convert' commands exist
if ! command -v convert &>/dev/null; then
  echo "Error: 'convert' command not found. Install ImageMagick package and re-run this script."
  exit 1
fi

# Run in a subshell
(
  cd "$image_directory"

  # Convert images to PDF
  echo "Converting images to PDF..."
  convert $(ls -1v *.jpg *.jpeg *.png 2>/dev/null | tr '\n' ' ') "$output_pdf"

  # Optionally OCR the PDF
  if command -v ocrmypdf &>/dev/null; then
    echo "OCRing the PDF..."
    ocrmypdf "$output_pdf" "$output_pdf"
  fi

  echo "Successfully generated PDF '$image_directory/$output_pdf'."
)
