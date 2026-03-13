const BASE = '/api'

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body !== undefined) opts.body = JSON.stringify(body)

  const res = await fetch(BASE + path, opts)
  if (res.status === 204) return null

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`)
  return data
}

const get    = (path)       => request('GET',    path)
const post   = (path, body) => request('POST',   path, body)
const put    = (path, body) => request('PUT',    path, body)
const patch  = (path, body) => request('PATCH',  path, body)
const del    = (path)       => request('DELETE', path)

export const boardsApi = {
  list:   ()         => get('/boards/'),
  get:    (id)       => get(`/boards/${id}`),
  create: (data)     => post('/boards/', data),
  update: (id, data) => put(`/boards/${id}`, data),
  delete: (id)       => del(`/boards/${id}`),
  stats:  (id)       => get(`/boards/${id}/stats`),
}

export const columnsApi = {
  list:   (boardId)       => get(`/boards/${boardId}/columns`),
  create: (boardId, data) => post(`/boards/${boardId}/columns`, data),
}

export const tasksApi = {
  listByBoard: (boardId)    => get(`/boards/${boardId}/tasks`),
  get:         (id)         => get(`/tasks/${id}`),
  create:      (data)       => post('/tasks/', data),
  update:      (id, data)   => put(`/tasks/${id}`, data),
  move:        (id, data)   => patch(`/tasks/${id}/move`, data),
  delete:      (id)         => del(`/tasks/${id}`),
}

export const teamApi = {
  list:   ()         => get('/team/'),
  create: (data)     => post('/team/', data),
  update: (id, data) => put(`/team/${id}`, data),
  delete: (id)       => del(`/team/${id}`),
  tasks:  (id)       => get(`/team/${id}/tasks`),
}