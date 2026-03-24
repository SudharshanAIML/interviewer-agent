const normalizeBaseUrl = (baseUrl) => {
  if (!baseUrl) return ''
  return baseUrl.trim().replace(/\/+$/, '')
}

const getConfiguredBaseUrl = () => {
  return normalizeBaseUrl(
    import.meta.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_BACKEND_URL ||
      import.meta.env.VITE_DEV_API_PROXY_TARGET
  )
}

export const buildApiUrl = (path) => {
  const normalizedBaseUrl = getConfiguredBaseUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (!normalizedBaseUrl) {
    return normalizedPath
  }

  return `${normalizedBaseUrl}${normalizedPath}`
}

const parseResponseBody = async (response) => {
  const raw = await response.text()
  const contentType = response.headers.get('content-type') || ''
  const looksLikeJson = contentType.includes('application/json') || raw.trim().startsWith('{') || raw.trim().startsWith('[')

  if (!raw) return { raw: '', data: null }
  if (!looksLikeJson) return { raw, data: null }

  try {
    return { raw, data: JSON.parse(raw) }
  } catch {
    return { raw, data: null }
  }
}

const getApiErrorMessage = (url, parsedData, rawText, fallbackMessage) => {
  if (parsedData?.error) return parsedData.error
  if (rawText && !rawText.trim().startsWith('<')) return rawText

  const hasConfiguredBaseUrl = Boolean(getConfiguredBaseUrl())
  if (!hasConfiguredBaseUrl) {
    return `API misconfiguration: set VITE_API_BASE_URL to your backend URL (request: ${url})`
  }

  return fallbackMessage
}

export const apiRequest = async (path, options = {}, fallbackMessage = 'Request failed') => {
  const url = buildApiUrl(path)

  let response
  try {
    response = await fetch(url, options)
  } catch {
    throw new Error(`Network error reaching API (${url}). Check backend URL and CORS.`)
  }

  const { raw, data } = await parseResponseBody(response)

  if (!response.ok) {
    throw new Error(getApiErrorMessage(url, data, raw, fallbackMessage))
  }

  return data
}
