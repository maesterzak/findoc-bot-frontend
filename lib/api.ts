function getBaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/docapp'
  // Remove any trailing slashes
  url = url.replace(/\/+$/, '')
  // If only root domain was provided without /api/docapp, auto-append /api/docapp
  if (!url.includes('/api/docapp') && !url.includes('/api/')) {
    url = `${url}/api/docapp`
  }
  return url
}

const BASE_URL = getBaseUrl()

let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {})
  }

  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('findoc_token') : null
  const activeToken = authToken || storedToken

  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const response = await fetch(`${BASE_URL}${cleanPath}`, {
    ...options,
    headers
  })

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('findoc_token')
      localStorage.removeItem('findoc_user')
      authToken = null
      const pathname = window.location.pathname
      if (
        !pathname.startsWith('/login') &&
        !pathname.startsWith('/register') &&
        pathname !== '/'
      ) {
        const fullPath = window.location.pathname + window.location.search
        window.location.href = `/login?redirect=${encodeURIComponent(fullPath)}`
      }
    }

    let errorMessage = 'Request failed'
    try {
      const errorData = await response.json()
      if (errorData.error) errorMessage = errorData.error
      else if (errorData.detail) errorMessage = errorData.detail
      else if (typeof errorData === 'object') {
        const firstKey = Object.keys(errorData)[0]
        if (firstKey) {
          const val = errorData[firstKey]
          errorMessage = Array.isArray(val) ? val[0] : String(val)
        }
      }
    } catch {
      // ignore
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

export const auth = {
  login: (body: unknown) => request('/auth/login/', { method: 'POST', body: JSON.stringify(body) }),
  register: (body: unknown) => request('/auth/register/', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me/'),
  logout: () => request('/auth/logout/', { method: 'POST' }),
  loginWithLinkedIn: () => {
    window.location.href = `${BASE_URL}/auth/linkedin/`
  }
}

export const chat = {
  create: (title?: string) => request('/chats/', { method: 'POST', body: JSON.stringify({ title: title || 'New conversation' }) }),
  getAll: () => request('/chats/'),
  get: (id: string | number) => request(`/chats/${id}/`),
  sendMessage: (id: string | number, content: string) => request(`/chats/${id}/messages/`, { method: 'POST', body: JSON.stringify({ content }) }),
  rename: (id: string | number, title: string) => request(`/chats/${id}/`, { method: 'PATCH', body: JSON.stringify({ title }) }),
  delete: (id: string | number) => request(`/chats/${id}/`, { method: 'DELETE' })
}

export const usage = {
  getCurrentUsage: () => request('/usage/')
}

export const profile = {
  get: () => request('/profile/'),
  update: (body: unknown) => request('/profile/', { method: 'PATCH', body: JSON.stringify(body) })
}

export const team = {
  get: () => request('/team/')
}

export const contributors = {
  get: () => request('/contributors/')
}
