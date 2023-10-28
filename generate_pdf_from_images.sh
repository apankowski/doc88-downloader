#!/bin/bash

# Function to display usage information
show_usage() {
  echo "Usage: $0 [-h] <ouput_pdf> <target_directory>"
  echo "  -h: Display this help message"
  echo "  ouput_pdf: The output PDF file to convert and OCR"
  echo "  target_directory: The directory where the commands should be run"
  exit 1
}

# Check if the script was called with the help flag
if [ "$1" == "-h" ]; then
  show_usage
fi

# Check the number of arguments
if [ "$#" -ne 2 ]; then
  echo "Error: Invalid number of arguments."
  show_usage
fi

# Define the output PDF file name as a parameter
ouput_pdf="$1"

# Define the directory where the commands should be run
target_directory="$2"

# Check if the conversion folder exists
if [ ! -d $target_directory ]; then
  echo "Error: The target directory '$target_directory' does not exist."
  exit 1
fi

# Check if 'convert' and 'ocrmypdf' commands exist
if ! command -v convert &>/dev/null; then
  echo "Error: 'convert' command not found. Install ImageMagick to use this script."
  exit 1
fi

# Execute the conversion and OCR commands
cd "$target_directory"
echo "Converting images to PDF..."
convert $(ls -1v *.jpg *.png 2>/dev/null | tr '\n' ' ') "$ouput_pdf"

if command -v ocrmypdf &>/dev/null; then
  echo "OCRing PDF..."
  ocrmypdf "$ouput_pdf" "$ouput_pdf"
fi

echo "Generated PDF for '$ouput_pdf' in the directory '$target_directory'."
