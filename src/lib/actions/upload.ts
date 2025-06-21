'use server'

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3Client, S3_CONFIG } from '@/lib/s3'
import { v4 as uuidv4 } from 'uuid'

export async function uploadToS3(formData: FormData) {
  try {
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string
    const userId = formData.get('userId') as string

    if (!file) {
      throw new Error('No file provided')
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${userId}/${documentType}_${Date.now()}_${uuidv4()}.${fileExtension}`
    const key = `${S3_CONFIG.folder}/${fileName}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        documentType: documentType,
        userId: userId,
        uploadedAt: new Date().toISOString()
      }
    })

    await s3Client.send(command)

    // Return the public URL
    const url = `https://${S3_CONFIG.bucket}.s3.${S3_CONFIG.region}.amazonaws.com/${key}`

    return {
      success: true,
      url: url,
      key: key,
      fileName: fileName
    }
  } catch (error) {
    console.error('S3 upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

export async function uploadMultipleFiles(files: File[], documentType: string, userId: string) {
  const uploadPromises = files.map(async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', documentType)
    formData.append('userId', userId)
    
    return uploadToS3(formData)
  })

  try {
    const results = await Promise.all(uploadPromises)
    return results
  } catch (error) {
    console.error('Multiple file upload error:', error)
    throw error
  }
}