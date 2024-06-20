<template>
    <div class="return-product">
      <h1>Retour du Produit</h1>
      <form @submit.prevent="submitReturn">
        <div class="return-details">
          <p><strong>Commande n°{{ orderId }}</strong></p>
          <p v-if="product">Produit retourné : {{ product.name }}</p>
          <p v-if="quantity !== null">
            <label for="quantityReturned">Quantité retournée :</label>
            <select id="quantityReturned" v-model="quantityReturned">
              <option v-for="num in quantityOptions" :key="num" :value="num">{{ num }}</option>
            </select>
          </p>
          <p>
            <label for="returnReason">Raison du retour :</label>
            <textarea id="returnReason" v-model="returnReason" rows="4"></textarea>
          </p>
          <p>
            <label for="deliveryMethod">Méthode de retour :</label>
            <select id="deliveryMethod" v-model="deliveryMethod">
              <option value="mondial-relay">Mondial Relay</option>
              <option value="point-relais">Point Relais</option>
            </select>
          </p>
          <button type="submit">Valider le retour</button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import axios from 'axios';
  
  const route = useRoute();
  const router = useRouter();
  let userId = localStorage.getItem('authToken');
  const orderId = ref(route.params.orderId as string);
  const productId = ref(route.params.productId as string);
  
  // Quantité retournée, raison du retour et méthode de livraison
  const quantityReturned = ref(1); // Quantité retournée par défaut
  const returnReason = ref(''); // Raison du retour
  const deliveryMethod = ref('mondial-relay'); // Méthode de retour par défaut
  
  // Exemple de données du produit (à adapter avec vos données réelles)
  const product = ref<any>(null);
  
  // Options de quantité (de 1 à quantity)
  const quantityOptions = computed(() => {
    const options = [];
    for (let i = 1; i <= quantityReturned.value; i++) {
      options.push(i);
    }
    return options;
  });
  
  // Fonction pour charger les détails du produit depuis l'API
  const fetchProductDetails = async () => {
    const returnProduct = await axios.get(`http://localhost:3000/return/${productId.value}`, {
          params: {
            orderId: orderId.value,
            userId: userId,
          }
        });

        if (returnProduct.data) {
          router.push(`/order/${orderId.value}`);
        }

    try {
      const response = await axios.get(`http://localhost:3000/products/${productId.value}`);
      product.value = response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du produit :', error);
    }
  };
  
  // Appel de la fonction pour récupérer les détails du produit au chargement du composant
  fetchProductDetails();
  
  // Fonction pour soumettre le retour
  const submitReturn = async () => {
    try {
      const response = await axios.post(`http://localhost:3000/return`, {
        orderId: orderId.value,
        productId: productId.value,
        quantityReturned: quantityReturned.value,
        reason: returnReason.value,
        userId: userId,
        deliveryMethod: deliveryMethod.value,
      });
      console.log('Retour du produit enregistré avec succès :', response.data);
      router.push(`/order/${orderId.value}`);
      // Redirection ou autre action après la soumission du retour
    } catch (error) {
      console.error('Erreur lors de la soumission du retour du produit :', error);
      alert('Erreur lors de la soumission du retour du produit');
    }
  };
  </script>
  
  <style scoped>
  .return-product {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .return-details {
    margin-top: 20px;
  }
  
  .return-details p {
    margin-bottom: 10px;
  }
  
  .return-details label {
    display: block;
    margin-bottom: 5px;
  }
  
  .return-details textarea {
    width: 100%;
    height: 100px;
    resize: vertical;
  }
  
  .return-details button {
    padding: 10px 20px;
    background-color: white;
    color: black;
    border: 1px solid black;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.3s, box-shadow 0.3s;
  }
  
  .return-details button:hover {
    background-color: #f0f0f0;
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  </style>
  