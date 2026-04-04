export function getIpfsUrl(cid: string): string {
  if (!cid) return ""

  const cleanCid = cid.replace("ipfs://", "")

  return `https://gateway.pinata.cloud/ipfs/${cleanCid}`
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
