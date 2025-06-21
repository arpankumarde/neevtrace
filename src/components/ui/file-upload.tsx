'use client'

import React, { useState } from 'react'
import { FilePond, registerPlugin } from 'react-filepond'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import { uploadToS3 } from '@/lib/actions/upload'
import { toast } from 'sonner'

// Import FilePond styles
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'

// Register plugins
registerPlugin(
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize,
  FilePondPluginImagePreview
)

interface FileUploadComponentProps {
  documentType: string
  userId: string
  onUploadComplete: (urls: string[]) => void
  maxFiles?: number
  acceptedFileTypes?: string[]
  maxFileSize?: string
}

export default function FileUploadComponent({
  documentType,
  userId,
  onUploadComplete,
  maxFiles = 5,
  acceptedFileTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  maxFileSize = '10MB'
}: FileUploadComponentProps) {
  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  const handleProcess = (fieldName: any, file: any, metadata: any, load: any, error: any, progress: any, abort: any) => {
    setUploading(true)
    
    const uploadFile = async () => {
      try {
        const formData = new FormData()
        formData.append('file', file as File)
        formData.append('documentType', documentType)
        formData.append('userId', userId)

        const result = await uploadToS3(formData)

        if (result.success && result.url) {
          // Call load with the URL to indicate successful upload
          load(result.url)
          toast.success(`${file.name} uploaded successfully`)
          
          // Notify parent component
          onUploadComplete([result.url])
        } else {
          error(result.error || 'Upload failed')
          toast.error(`Failed to upload ${file.name}: ${result.error}`)
        }
      } catch (err) {
        error('Upload failed')
        toast.error(`Failed to upload ${file.name}`)
        console.error('Upload error:', err)
      } finally {
        setUploading(false)
      }
    }

    uploadFile()

    // Return an object with an abort method
    return {
      abort: () => {
        abort()
      }
    }
  }

  return (
    <div className="w-full">
      <FilePond
        files={files}
        onupdatefiles={setFiles}
        allowMultiple={maxFiles > 1}
        maxFiles={maxFiles}
        server={{
          process: handleProcess as any
        }}
        name="files"
        labelIdle={`Drag & Drop your ${documentType.toLowerCase()} files or <span class="filepond--label-action">Browse</span>`}
        acceptedFileTypes={acceptedFileTypes}
        fileValidateTypeLabelExpectedTypes="Expects PDF, JPEG, JPG, or PNG files"
        maxFileSize={maxFileSize}
        fileValidateTypeLabelExpectedTypesMap={{
          'application/pdf': '.pdf',
          'image/jpeg': '.jpg',
          'image/jpg': '.jpg', 
          'image/png': '.png'
        }}
        credits={false}
        className="mb-4"
      />
      {uploading && (
        <div className="text-sm text-blue-600 mt-2">
          Uploading to secure storage...
        </div>
      )}
    </div>
  )
}