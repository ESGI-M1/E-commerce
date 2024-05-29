<template>
  <div class="cart">
    <header>
      <h1>Mon Panier</h1>
      <p><router-link to="/login">Rejoins-nous</router-link> ou <router-link to="/login">S'identifier</router-link></p>
    </header>

    <div class="cart-items" v-if="cartItems.length > 0">
      <div v-for="(item, index) in cartItems" :key="index" class="cart-item">
        <img :src="item.product.image" :alt="item.product.name">
        <div class="item-details">
          <h3>{{ item.product.name }}</h3>
          <p>Prix: {{ item.product.price }} €</p>
          <p>Quantité: {{ item.quantity }}</p>
        </div>
      </div>
    </div>
    <div v-else>
      <p>Il n'y a aucun article dans ton panier.</p>
    </div>

    <div class="cart-summary" v-if="cartItems.length > 0">
      <div class="promo-code">
        <label for="promo">As-tu un code promo ?</label>
        <input type="text" id="promo" placeholder="Entrez votre code promo">
      </div>
      <div class="totals">
        <div class="subtotal">
          <p>Sous-total</p>
          <p>{{ subtotal }} €</p>
        </div>
        <div class="shipping">
          <p>Frais estimés de prise en charge et d'expédition</p>
          <p>Gratuit</p>
        </div>
        <div class="total">
          <p>Total</p>
          <p>{{ total }} €</p>
        </div>
      </div>
      <button @click="checkout">Paiement <i class="fab fa-paypal"></i></button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      cartItems: []
    };
  },
  computed: {
    subtotal() {
      return this.cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toFixed(2);
    },
    total() {
      return (parseFloat(this.subtotal) + 0).toFixed(2); // Ajustez si nécessaire
    }
  },
  methods: {
    async fetchCartItems() {
      try {
        const response = await axios.get('http://localhost:5173/cart', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}` // Assurez-vous que le token est stocké après connexion
          }
        });
        this.cartItems = response.data;
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    },
    async checkout() {
      // Logique pour passer la commande
      alert('Paiement effectué via PayPal.');
    }
  },
  created() {
    this.fetchCartItems();
  }
};
</script>

<style scoped>
/* Styles CSS ici */
.cart {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

header {
  margin-bottom: 20px;
}

.cart-items {
  border-bottom: 1px solid #ccc;
  padding-bottom: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.cart-item img {
  width: 100px;
  margin-right: 20px;
}

.item-details h3 {
  margin: 0;
}

.cart-summary {
  margin-top: 20px;
}

.promo-code {
  margin-bottom: 20px;
}

input[type="text"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 5px;
}

.totals {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.total p {
  font-weight: bold;
}

button {
  padding: 10px 20px;
  background-color: #42b983;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #36a67d;
}

.fa-paypal {
  margin-left: 5px;
}
</style>
