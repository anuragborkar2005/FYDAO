export function getIpfsUrl(cid: string): string {
  if (!cid) return ""

  const cleanCid = cid.replace(/^ipfs:\/\//, "")
  const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL

  if (!gateway) return ""

  return `https://${gateway.replace(/^https?:\/\//, "").replace(/\/ipfs\/?$/, "")}/ipfs/${cleanCid}`
}

export function getIpfsGatewayUrl(
  cid: string,
  gateway: "pinata" | "cloudflare" | "ipfs" = "pinata"
): string {
  const cleanCid = cid.replace("ipfs://", "")

  if (gateway === "pinata") {
    return `https://gateway.pinata.cloud/ipfs/${cleanCid}`
  } else if (gateway === "cloudflare") {
    return `https://cloudflare-ipfs.com/ipfs/${cleanCid}`
  } else {
    return `https://ipfs.io/ipfs/${cleanCid}`
  }
}
