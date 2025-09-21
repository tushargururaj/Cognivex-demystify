'use server';

import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'node:crypto';

// Initialize Google Cloud Storage with the same credentials as Vertex AI
function getStorageClient() {
  const creds = process.env.GCLOUD_SERVICE_ACCOUNT_CREDS;
  if (!creds) {
    throw new Error('GCLOUD_SERVICE_ACCOUNT_CREDS environment variable is not set.');
  }
  
  if (creds.includes('...')) {
    throw new Error('Placeholder credentials found. Please replace the GCLOUD_SERVICE_ACCOUNT_CREDS in your .env file with your actual service account key.');
  }

  try {
    const credentials = JSON.parse(creds);
    
    return new Storage({
      projectId: process.env.GCLOUD_PROJECT || '',
      credentials
    });
  } catch (e: any) {
    throw new Error(`Failed to initialize Google Cloud Storage: ${e.message}`);
  }
}

export async function uploadAudioToCloudStorage(
  audioBuffer: Buffer,
  mimeType: string,
  originalFileName: string
): Promise<{ gcsUri: string; publicUrl: string }> {
  const storage = getStorageClient();
  const bucketName = process.env.GCLOUD_STORAGE_BUCKET || process.env.GCLOUD_PROJECT + '-audio-uploads';
  
  // Generate unique filename
  const fileExtension = originalFileName.split('.').pop() || 'audio';
  const fileName = `audio-uploads/${randomUUID()}.${fileExtension}`;
  
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fileName);
  
  try {
    // Upload the file
    await file.save(audioBuffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          originalName: originalFileName,
          uploadedAt: new Date().toISOString()
        }
      },
      public: false, // Keep files private for security
    });
    
    // Generate signed URL for temporary access (valid for 1 hour)
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });
    
    const gcsUri = `gs://${bucketName}/${fileName}`;
    
    return {
      gcsUri,
      publicUrl: signedUrl
    };
  } catch (error: any) {
    console.error('Error uploading to Cloud Storage:', error);
    throw new Error(`Failed to upload audio file: ${error.message}`);
  }
}

export async function deleteAudioFromCloudStorage(gcsUri: string): Promise<void> {
  const storage = getStorageClient();
  
  try {
    // Extract bucket and file path from gs:// URI
    const uriParts = gcsUri.replace('gs://', '').split('/');
    const bucketName = uriParts[0];
    const fileName = uriParts.slice(1).join('/');
    
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);
    
    await file.delete();
  } catch (error: any) {
    console.error('Error deleting from Cloud Storage:', error);
    // Don't throw error for cleanup failures
  }
}
