"use server"

import { PinataSDK } from "pinata"

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.PINATA_GATEWAY_URL?.replace(/^https?:\/\//, ""),
})

interface UploadResult {
  cid: string
  gatewayUrl: string
  id: string
}

/**
 * Internal helper for Pinata uploads.
 * Since this is a Server Action, we handle the logic here.
 */
async function uploadToPinataInternal(
  file: File,
  metadata: Record<string, string> = {}
): Promise<UploadResult> {
  try {
    const upload = await pinata.upload.public.file(file, {
      metadata: {
        name: metadata.name || "fydao-upload",
        keyvalues: metadata,
      },
    })

    const cid = upload.cid
    const gateway = (
      process.env.PINATA_GATEWAY_URL || "gateway.pinata.cloud"
    ).replace(/^https?:\/\//, "")

    return {
      cid: `ipfs://${cid}`,
      gatewayUrl: `https://${gateway}/ipfs/${cid}`,
      id: upload.id,
    }
  } catch (error) {
    console.error("Pinata upload error:", error)
    throw new Error("Failed to upload to Pinata")
  }
}

/**
 * Server Action to upload JSON metadata
 */
export async function uploadJsonToPinataAction(
  jsonData: unknown,
  name = "metadata.json"
): Promise<UploadResult> {
  const jsonString = JSON.stringify(jsonData, null, 2)

  const file = new File([jsonString], name, {
    type: "application/json",
  })

  return uploadToPinataInternal(file, { name })
}

/**
 * Server Action for Files (Images/Assets)
 * Use this if you are uploading from an <input type="file"> via FormData
 */
export async function uploadFileAction(
  formData: FormData,
  metadata: Record<string, string> = {}
): Promise<UploadResult> {
  const file = formData.get("file") as File
  if (!file) throw new Error("No file provided")

  return uploadToPinataInternal(file, { ...metadata, name: file.name })
}
