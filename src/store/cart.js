import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartItems: [],
  }),
  getters: {
    getCartItems() {
      return this.cartItems;
    },
    getCartItemCount() {
      return this.cartItems.length;
    },
    getCartSubtotal() {
      return this.cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toFixed(2);
    },
    getCartTotal() {
      return (parseFloat(this.getCartSubtotal) + 0).toFixed(2);
    },
  },
  actions: {
    setCartItems(items) {
      this.cartItems = items;
    },
    async fetchCartItems() {
      try {
        const response = await axios.get('http://localhost:3000/cart', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        this.setCartItems(response.data);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    },
    async checkout() {
      // Logique pour passer la commande
      alert('Paiement effectué via PayPal.');
    },
  },
});
