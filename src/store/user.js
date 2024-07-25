import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import axios from '../tools/axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isAuthenticated: false,
  }),
  getters: {
    getUserId: (state) => {
      const cookieUser = Cookies.get('USER')
      if (cookieUser) {
        const userFromCookie = JSON.parse(cookieUser.substring(2))
        if (state.user && state.user.id === userFromCookie.id) {
          return state.user.id
        }
        return userFromCookie.id
      }
      return localStorage.getItem('temporaryId')
    },
    getUserFromCookie: () => {
      const cookieUser = Cookies.get('USER')
      return cookieUser ? JSON.parse(cookieUser.substring(2)) : null
    },
    getIsAuthenticated (state) {
      return state.isAuthenticated
    },
    isAdmin (state) {
      const cookieUser = Cookies.get('USER')
      const userFromCookie = cookieUser ? JSON.parse(cookieUser.slice(2)) : null
      return (state.user && state.user.role === 'admin') || (userFromCookie && userFromCookie.role === 'admin')
    }
  },
  actions: {
    setUser(user) {
      this.user = user
    },
    setIsAuthenticated(isAuthenticated) {
      this.isAuthenticated = isAuthenticated
    },
    async fetchUser() {
      const cookieUser = Cookies.get('USER')
      if (cookieUser) {
        const userFromCookie = JSON.parse(cookieUser.substring(2))
        const userId = userFromCookie.id

        // If the user in the store matches the one in the cookie, return it directly
        if (this.user && this.user.id === userFromCookie.id) {
          this.setIsAuthenticated(true)
          return this.user
        }

        try {
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/${userId}`)
          this.setUser(response.data)
          this.setIsAuthenticated(true)
          return this.user
        } catch (e) {
          console.error(e)
          this.setUser(null)
          this.setIsAuthenticated(false)
          throw e
        }
      }

      this.setUser(null)
      this.setIsAuthenticated(false)
      return null
    },
    async patch(user) {
      const userId = this.getUserId
      if (!userId) throw new Error('User ID not found')

      try {
        const response = await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/users/${userId}`, user)
        this.setUser(response.data)
      } catch (e) {
        console.error(e)
        throw e
      }
    },
    async fetchDashboard() {
      if (this.user && this.user.dashboard) return this.user.dashboard

      try {
        const user = await this.fetchUser()
        return user ? user.dashboard : null
      } catch (e) {
        console.error(e)
      }
    },
    async login(email, password) {
      try {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/login`, { email, password })
        const temporaryId = localStorage.getItem('temporaryId')

        if (temporaryId) {
          const cartResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/carts/${temporaryId}`)
          
          const cartId = cartResponse.data.id
          if(cartId){
            await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/carts/update-user/${cartId}`, {})
          }

          localStorage.removeItem('temporaryId')
          await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/users/${temporaryId}`)
        }

        await this.fetchUser()
        return { success: true }
      } catch (error) {
        console.log(error)
        if (error.response && error.response.status === 429) {
          return { success: false, status: 429 }
        }
        return { success: false, status: 400 }
      }
    },
    async logout() {
      Cookies.remove('USER')
      this.setUser(null)
      this.setIsAuthenticated(false)
    }
  }
})
