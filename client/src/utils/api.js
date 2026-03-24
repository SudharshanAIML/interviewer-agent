const normalizeBaseUrl = (baseUrl) => {
  if (!baseUrl) return ''
  return baseUrl.trim().replace(/\/+$/, '')
}

export const buildApiUrl = (path) => {
  const normalizedBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (!normalizedBaseUrl) {
    return normalizedPath
  }

  return `${normalizedBaseUrl}${normalizedPath}`
}
