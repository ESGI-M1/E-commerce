<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const productId = ref(route.params.id);

const product = ref({
  name: '',
  imageSrc: '', // Utilisation de imageSrc au lieu de image pour stocker l'URL de l'image
  description: '',
  price: 0,
  comments: []
});

const fetchProductById = async (id) => {
  try {
    const response = await axios.get(`http://localhost:3000/products/${id}`);
    console.log('Product data:', response.data);
    product.value = response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    alert('There was an error fetching the product details. Please try again later.');
  }
};

const addToCart = async () => {
  try {
    let userId = null;
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwt_decode(token);
      userId = decodedToken.userId;
    }

    const response = await axios.post('http://localhost:3000/carts', {
      userId: userId,
      productId: product.value.id,
      quantity: 1,
    });
    
    console.log('Product added to cart:', response.data);
    alert('Produit ajouté au panier avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout au panier:', error);
    alert('Une erreur s\'est produite lors de l\'ajout au panier. Veuillez réessayer plus tard.');
  }
};

  fetchProductById(productId.value);
</script>

<template>
  <div class="product-page">
    <div class="product-image-container">
      <img :src="product.Images[0].url ?? '../../produit_avatar.jpg'" alt="Product Image" class="product-image" />
    </div>
    <div class="product-info">
      <h2>{{ product.name }}</h2>
      <p>{{ product.description }}</p>
      <p><strong>Prix :</strong> ${{ parseInt(product.price) }}</p>
      <div v-if="product.reference === 'chaussure'" class="sizes-container">
        <p><strong>Tailles disponibles :</strong></p>
        <div class="size" v-for="size in sizes" :key="size" @click="selectSize(size)">{{ size }}</div>
      </div>
      <div class="button-container">
        <button @click="addToCart" class="add-to-cart">Ajouter au Panier</button>
        <button @click="addToFavorites" class="add-to-favorites"><i class="fas fa-heart"></i> Ajouter aux Favoris</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-page {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.product-image-container {
  margin-right: 20px;
}

.product-image {
  max-width: 600px;
  width: 100%;
  height: auto;
}

.product-info {
  text-align: center;
}

.product-info h2 {
  margin-top: 0;
}

.product-info p {
  margin-bottom: 10px;
}

.sizes-container {
  margin-top: 20px;
}

.size {
  display: inline-block;
  background-color: #eee;
  padding: 5px 10px;
  margin-right: 10px;
  border-radius: 5px;
  cursor: pointer;
}

.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.add-to-cart,
.add-to-favorites {
  padding: 10px 30px;
  margin: 0 10px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-to-cart {
  background-color: #000;
  color: white;
}

.add-to-favorites {
  background-color: #ff99cc;
  color: white;
  display: flex;
  align-items: center;
}

.fa-heart {
  margin-right: 5px;
}

.add-to-cart:hover,
.add-to-favorites:hover {
  opacity: 0.8;
}
</style>
