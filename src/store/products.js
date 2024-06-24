import { defineStore } from 'pinia'

export const useProductsStore = defineStore('products', {
  state: () => {
    return {
      products: [],
      filter: [],
      count: 0
    }
  },
  getters: {
    getProducts() {
      return this.products
    },
    getFilter() {
      return this.filter
    },
    getCount() {
      return this.products.length
    }
  },
  actions: {
    setProducts(products) {
      this.products = products
    },
    setFilter(filter) {
      this.filter = filter
    },
    addProduct(product) {
      this.products.push(product)
    },
    removeProduct(product) {
      this.products = this.products.filter((p) => p.id !== product.id)
    }
  }
})
