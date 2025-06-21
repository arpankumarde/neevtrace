import { S3Client } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})



export const S3_CONFIG = {
  bucket: process.env.AWS_S3_BUCKET_NAME ,
  folder: process.env.AWS_S3_BUCKET_KEY ,
  region: process.env.AWS_REGION ,
}

export { s3Client }