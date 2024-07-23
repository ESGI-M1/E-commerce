import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import axios from '../tools/axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
  }),
  getters: {
    getUserId: (state) => {
      if (state.user) return state.user.id

      return  Cookies.get('USER') ? JSON.parse(Cookies.get('USER').substring(2)).id : localStorage.getItem('temporaryId')
    },
    getUserFromCookie: () => {
      return Cookies.get('USER') ? JSON.parse(Cookies.get('USER').substring(2)) : localStorage.getItem('temporaryId')
    },
    isAuthenticated: () => {
      return Cookies.get('USER') !== undefined
    },
    isAdmin (state) {
      if(state.user) return state.user.role === 'admin'

      return JSON.parse(Cookies.get('USER').slice(2)).role === 'admin'
    }
  },
  actions: {
    async fetchUser() {
      if (this.user) return this.user
      const userId = this.getUserId
      if (!userId) throw new Error('User ID not found')

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/${userId}`)
        this.user = response.data
        return this.user
      } catch (e) {
        console.error(e)
        throw e
      }
    },
    async patch(user) {
      const userId = this.getUserId
      if (!userId) throw new Error('User ID not found')

      try {
        const response = await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/users/${userId}`, user)
        this.user = response.data
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
    }
  }
})
