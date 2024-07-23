import { defineStore } from 'pinia';
import axios from 'axios';

export const useCategoryStore = defineStore('category', {
  state: () => ({
    category: null
  }),
  getters: {
    getCategory() {
      return this.category;
    }
  },
  setters: {
    setCategory(category) {
      this.category = category;
    }
  },
  actions: {
    async fetchCategory(slug) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/categories/${slug}`);
        this.category = response.data;
      } catch (error) {
        console.error('Failed to fetch category:', error);
      }
    }
  }
});
