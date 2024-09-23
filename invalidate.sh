#!/usr/bin/env bash

set -e  # Exit on error

# Check if .env file exists and source it
if [ -f .env ]; then
  # Use `source` to load environment variables from .env file
  set -o allexport
  source .env
  set +o allexport
fi

# Check if required environment variables are set
if [[ -z "$DISTRIBUTION_ID" ]]; then
  echo "Error: DISTRIBUTION_ID environment variable must be set."
  exit 1
fi

# Set a default value for UPLOAD_LOG if it's not provided
UPLOAD_LOG="${UPLOAD_LOG:-uploaded_files.log}"

# Step 1: Check if the log file exists and has content
if [[ ! -f "$UPLOAD_LOG" || ! -s "$UPLOAD_LOG" ]]; then
  echo "Error: No uploaded files to invalidate, or log file does not exist."
  exit 1
fi

# Step 2: Preview the files to be invalidated
echo "Files to be invalidated from CloudFront:"
cat "$UPLOAD_LOG"

# Step 3: Ask for confirmation to proceed with the invalidation
read -r -p "Do you want to proceed with the CloudFront invalidation? (y/n): " confirm

if [[ "$confirm" != "y" ]]; then
    echo "CloudFront invalidation cancelled."
    exit 0
fi

# Step 4: Collect all file paths into an array and create the invalidation request
 # Read the log file and create a space-separated list of paths
files_to_invalidate=()
while IFS= read -r line; do
  files_to_invalidate+=("$line")
done < "$UPLOAD_LOG"

echo "Creating CloudFront invalidation request for the following files:"
printf "%s\n" "${files_to_invalidate[@]}"

if aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "${files_to_invalidate[@]}"; then
    echo "Invalidation request sent successfully for files listed in $UPLOAD_LOG."
else
    echo "Error: CloudFront invalidation request failed."
    exit 1
fi

echo "[$(date)] Invalidation request sent for files listed in $UPLOAD_LOG."
