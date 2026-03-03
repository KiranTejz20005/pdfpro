export interface ValidatedResponse {
  type: 'json' | 'blob'
  data?: any
  blob?: Blob
  contentType?: string
  headers?: Record<string, string>
}

export async function validateBackendResponse(res: Response): Promise<ValidatedResponse> {
  if (!res.ok) {
    let errMsg = "Server processing failed"
    try {
      const data = await res.json()
      errMsg = data.detail || errMsg
    } catch {}
    throw new Error(errMsg)
  }

  const ct = res.headers.get("content-type") || ""
  
  const headers: Record<string, string> = {}
  const headerKeys = [
    'X-Original-Size-KB', 'X-Compressed-Size-KB', 'X-Pages',
    'X-Detection-Method', 'X-File-Size-KB', 'X-Dimensions',
    'X-Quality-Used', 'X-Savings-Percent', 'X-Faces-Blurred'
  ]
  headerKeys.forEach(key => {
    const val = res.headers.get(key)
    if (val) headers[key] = val
  })

  if (ct.includes("application/json")) {
    const data = await res.json()
    if (data.error || data.status === "FAILED") {
      throw new Error(data.message || "Processing failed")
    }
    return { type: "json", data, headers }
  }

  const blob = await res.blob()

  if (!blob || blob.size === 0) {
    throw new Error("Backend returned empty result")
  }

  if (blob.size < 100) {
    throw new Error("Backend returned invalid file (too small)")
  }

  return { type: "blob", blob, contentType: ct, headers }
}
