#!/bin/bash

set -euE
set -o pipefail

input=downloadPages.js
output=bookmark.min.js

echo -n "javascript:" > $output
uglifyjs <<< "$(cat "$input"; echo "downloadPages()")" >> $output
