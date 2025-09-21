# Cloud Upload Setup

This project now supports direct cloud upload for audio files to bypass Vercel's size limits.

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Existing variables (already required)
GCLOUD_PROJECT=your-project-id
GCLOUD_LOCATION=us-central1
GCLOUD_SERVICE_ACCOUNT_CREDS={"type":"service_account",...}

# New variable for cloud storage
GCLOUD_STORAGE_BUCKET=your-project-id-audio-uploads
```

## Google Cloud Setup

1. **Create a Storage Bucket** (if not exists):
   ```bash
   gsutil mb gs://your-project-id-audio-uploads
   ```

2. **Set Bucket Permissions**:
   ```bash
   # Make bucket private (recommended)
   gsutil iam ch -d allUsers:objectViewer gs://your-project-id-audio-uploads
   ```

3. **Service Account Permissions**:
   Your service account needs these roles:
   - `Storage Object Admin` (for upload/delete)
   - `Vertex AI User` (existing)

## How It Works

1. **Cloud Upload**: Audio files are uploaded directly to Google Cloud Storage
2. **Processing**: Files are processed by Vertex AI using the same service account
3. **Cleanup**: Temporary files are automatically deleted after processing
4. **Size Limits**: Now supports files up to 50MB (vs 4MB with Vercel limits)

## File Size Limits

- **Cloud Upload**: Up to 50MB
- **Legacy Upload**: Up to 4MB (Vercel limit)
- **Supported Formats**: MP3, WAV, M4A, OGG, WEBM

## Security

- Files are stored privately in GCS
- Temporary signed URLs are used for processing
- Automatic cleanup after analysis
- Same service account as existing Vertex AI integration
