import { defineStore } from 'pinia';
import axios from 'axios';

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    filter: {},
    count: 0
  }),
  getters: {
    getProducts() {
      return this.products;
    },
    getFilter() {
      return this.filter;
    },
    getCount() {
      return this.products.length;
    }
  },
  actions: {
    async fetchProducts() {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/search`, {
          params: this.filter
        });
        this.products = response.data;
        this.count = this.products.length;
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    },

    setFilter(filter) {
      this.filter = filter;
      this.fetchProducts();
    },

    async fetchProductsByCategory(categoryId) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/search`, {
          params: { ...this.filter, category: categoryId }
        });
        this.products = response.data;
        this.count = this.products.length;
      } catch (error) {
        console.error('Failed to fetch products by category:', error);
      }
    },

    addProduct(product) {
      this.products.push(product);
    },

    removeProduct(product) {
      this.products = this.products.filter((p) => p.id !== product.id);
    }
  }
});
