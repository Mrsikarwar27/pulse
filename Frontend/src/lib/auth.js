import api from '../services/api'

const TOKEN_KEY = 'pulse_token'

// Same { data, error } return shape as before so pages barely change
export const signUp = async (email, password) => {
  try {
    const { data } = await api.post('/auth/register', { email, password })
    return { data, error: null }
  } catch (e) {
    return { data: null, error: { message: e.response?.data?.error || e.message } }
  }
}

export const signIn = async (email, password) => {
  try {
    const { data } = await api.post('/auth/login', { email, password })
    return { data, error: null }
  } catch (e) {
    return { data: null, error: { message: e.response?.data?.error || e.message } }
  }
}

export const signOut = async () => {
  localStorage.removeItem(TOKEN_KEY)
  return { error: null }
}

export const getSession = async () => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return { session: null, error: null }
  try {
    const { data } = await api.get('/user/profile')
    return { session: { access_token: token, user: data.user }, error: null }
  } catch (e) {
    localStorage.removeItem(TOKEN_KEY)
    return { session: null, error: null }
  }
}

export const getUser = async () => {
  try {
    const { data } = await api.get('/user/profile')
    return { user: data.user, error: null }
  } catch (e) {
    return { user: null, error: { message: e.response?.data?.error || e.message } }
  }
}

// Admin song upload (audio + cover) via backend
export const uploadSongFiles = async (audioFile, coverFile) => {
  const form = new FormData()
  form.append('audio', audioFile)
  form.append('cover', coverFile)
  const { data } = await api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
