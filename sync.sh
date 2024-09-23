#!/usr/bin/env bash

set -e  # Exit on error

# Check if .env file exists and source it
if [ -f .env ]; then
  # Use `source` to load environment variables from .env file
  set -o allexport
  source .env
  set +o allexport
fi

# Check if the required environment variable is set
if [[ -z "$BUCKET_NAME" ]]; then
  echo "Error: BUCKET_NAME environment variable must be set."
  exit 1
fi

# Set a default value for UPLOAD_LOG if it's not provided
UPLOAD_LOG="${UPLOAD_LOG:-uploaded_files.log}"
truncate -s 0 "$UPLOAD_LOG"  # Efficiently clear the log file without adding a blank line

# Step 1: Run a preview (dry run) to show what will be uploaded
echo "Preview of changes (dry run):"
dryrun_output=$(aws s3 sync ./dist/ s3://"$BUCKET_NAME"/ --exact-timestamps --delete --dryrun)

# Step 2: Check if there are files to sync
if ! echo "$dryrun_output" | grep -q 'upload:'; then
    echo "[$(date)]  No files to sync. Exiting."
    exit 0
fi

# Show the dry run output
echo "$dryrun_output"

# Step 3: Ask for confirmation to proceed with the actual sync
read -r -p "Do you want to proceed with the actual sync to S3? (y/n): " confirm

if [[ "$confirm" != "y" ]]; then
    echo "Sync operation cancelled."
    exit 0
fi

# Step 4: Perform the sync
echo "Syncing files to S3 and logging uploads..."
updated_files=$(aws s3 sync ./dist/ s3://"$BUCKET_NAME"/ --exact-timestamps --delete)

# Step 5: Parse updated files from the sync output, filter by extensions, and log them
echo "$updated_files" | grep 'upload:' | awk -v bucket="s3://$BUCKET_NAME/" '
{
  for (i = 4; i <= NF; i++) {
    if ($i ~ "^"bucket) {
      sub(bucket, "", $i)
      if ($i ~ /\.(html|json|js|css)$/) { print "/" $i }
    }
  }
}' >> "$UPLOAD_LOG"

# Step 6: Log message about successful file upload
echo "[$(date)]  Files uploaded and logged to $UPLOAD_LOG."
