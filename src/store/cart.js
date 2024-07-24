import { defineStore } from 'pinia';
import axios from '../tools/axios';
import { useUserStore } from './user';

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: [],
    promo: null,
    promoError: '',
  }),
  getters: {
    getCart() {
      return this.cart;
    },
    getCartItems() {
      return this.cart.CartProducts || [];
    },
    getCartItemCount() {
      return this.getCartItems.reduce((acc, item) => acc + item.quantity, 0);
    },
    getCartSubtotal() {
      return this.getCartItems
        .reduce((acc, item) => acc + item.productVariant.price * item.quantity, 0)
        .toFixed(2);
    },
    getCartTotal() {
      let subtotal = parseFloat(this.getCartSubtotal);
      if (this.promo && this.promo.discountPercentage) {
        subtotal = subtotal - (subtotal * this.promo.discountPercentage / 100);
      }
      return subtotal.toFixed(2);
    },
    getPromo() {
      return this.promo;
    }
  },
  actions: {
    setCart(cart) {
      this.cart = cart;
    },
    async fetchCartItemsAuth() {
      const userStore = useUserStore();
      const userId = userStore.getUserId;
    
      if (!userId) throw new Error('User ID not found');

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/carts/${userId}`);

      if(response.data){
        this.cart = response.data;
      }
      else{
        this.cart = [];
      }
      
    },
    async removePromo() {
      const userStore = useUserStore();
      const userId = userStore.getUserId;

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/carts/remove-promo`, {
        userId,
        cartIds: this.cart.id,
      });

      this.promoError = '';
      this.promo = null;
      await this.fetchCartItemsAuth();
    },
    async applyPromoCode(promoCode) {
      const userStore = useUserStore();
      const userId = userStore.getUserId;

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/promos/${promoCode}/apply`,
        null,
        { params: { userId } }
      );

      if (response.data.success) {
        this.promo = response.data;
        await this.fetchCartItemsAuth();
        this.promoError = '';
      }
    },
    async updateCartHold(hold) {
      const action = hold ? 'hold' : 'unhold';
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/carts/${action}`, { cartId: this.cart.id });
      await this.fetchCartItemsAuth();
    },
    async updateCartQuantity(id, quantity) {
      if (quantity === 'remove') {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/cartproducts/${id}`);
      } else {
        await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/cartproducts/${id}`, { quantity });
      }
      await this.fetchCartItemsAuth();
    },
    async addProductToCart(cart) {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/carts`, cart);
      this.fetchCartItemsAuth();
    }
  }
});
