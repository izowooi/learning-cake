import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

let r2Client: S3Client | null = null

export function getR2Client(): S3Client {
  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      },
    })
  }
  return r2Client
}

export async function uploadAudio(
  audioBuffer: Buffer,
  fileName: string
): Promise<string> {
  const client = getR2Client()
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: `audio/${fileName}`,
    Body: audioBuffer,
    ContentType: 'audio/mpeg',
  })

  await client.send(command)

  // Return public URL
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL
  return `${publicUrl}/audio/${fileName}`
}

export async function getAudioSignedUrl(fileName: string): Promise<string> {
  const client = getR2Client()
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: `audio/${fileName}`,
  })

  // URL valid for 1 hour
  return await getSignedUrl(client, command, { expiresIn: 3600 })
}

export function generateAudioFileName(passageId: string, accent: 'male' | 'female'): string {
  return `${passageId}_${accent}.mp3`
}

