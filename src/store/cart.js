import { defineStore } from 'pinia'
import axios from '../tools/axios';
import { useUserStore  } from './user';

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: [],
  }),
  getters: {
    getCart() {
      return this.cart
    },
    getCartItems() {
      return this.cart.CartProducts
    },
    getCartItemCount() {

      if(!this.cart.CartProducts) return 0;

      return this.cart.CartProducts.length
    },
    getCartSubtotal() {

      if(!this.cart.CartProducts) return 0;

      return this.cart.CartProducts
        .reduce((acc, item) => acc + item.productVariant.price * item.quantity, 0)
        .toFixed(2)
    },
    getCartTotal() {

      return (parseFloat(this.getCartSubtotal) + 0).toFixed(2)
    }
  },
  setters: {
    setCart (cart) {
      this.cart = cart
    }
  },
  actions: {
    async fetchCartItemsAuth () {

      const userStore = useUserStore()

      const userId = userStore.getUserId;
    
      if (!userId) throw new Error('User ID not found');

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/carts/${userId}`);

      if (response.data) {
        this.cart = response.data;
      }

    },
    async checkout() {
      // Logique pour passer la commande
      alert('Paiement effectué via PayPal.')
    },
    async removePromo () {
      try {

        const userStore = useUserStore()
        const userId = userStore.getUserId;

        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/carts/remove-promo`,
          { userId, cartIds : this.cart.id }
        );

        //fetchCartItems();

      } catch (error) {
        console.error(error)
      }
    },
    async updateCartHold (hold) {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/carts/${hold? 'hold' : 'unhold'}`, { cartId: this.cart.id })
      this.fetchCartItemsAuth()
    }
  }
})
