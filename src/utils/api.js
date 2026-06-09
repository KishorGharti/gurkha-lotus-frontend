const BASE = '/api'

async function request(path, { method = 'GET', body } = {}) {
  const isFormData = body instanceof FormData
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: isFormData || !body ? {} : { 'Content-Type': 'application/json' },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw Object.assign(new Error(data.message || 'Request failed'), { status: res.status })
  return data
}

export const api = {
  get:    (path)        => request(path),
  post:   (path, body)  => request(path, { method: 'POST',   body }),
  put:    (path, body)  => request(path, { method: 'PUT',    body }),
  del:    (path)        => request(path, { method: 'DELETE' }),
}
