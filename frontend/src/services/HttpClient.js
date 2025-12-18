import axios from 'axios';


axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';


axios.interceptors.request.use(
  (config) => {
    const token = window.localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

const GenericRequest = {
  get: async (url) => {
    try {
            const response = await axios.get(url)
            return response.data
        } catch (error) {
            console.error("Error fetching data:", error)
            throw error
        }
  },

  post: async (url, data) => {
    try {
          const response = await axios.post(url, data)
          return response.data
      } catch (error) {
          console.error("Error posting data:", error)
          throw error
      }
  },

  patch: async (url, data) => {
    try {
          const response = await axios.patch(url, data)
          return response.data
      } catch (error) {
          console.error("Error updating data:", error)
          throw error
      }
  },

  delete: async (url) => {
    try {
          const response = await axios.delete(url)
          return response.data
      } catch (error) {
          console.error("Error deleting data:", error)
          throw error
      }
  }
}

export default GenericRequest
