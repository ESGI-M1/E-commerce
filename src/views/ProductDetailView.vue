<template>
  <BreadCrumb v-if="product.Categories && product.Categories.length > 0" :category="product.Categories[0]" />

  <div v-if="product" class="product-page">

    <div class="selected-variant" v-if="activeProductVariant">
  <img
    v-if="activeProductVariant.Images.length"
    class="product-image"
    :src="activeProductVariant.Images[0].url"
    :alt="activeProductVariant.Images[0].description"
  />

  <div>
    <div class="other-variant-images">
      <div
        v-for="variant in product.ProductVariants"
        :key="variant.id"
        class="variant-option"
        @click="selectVariant(variant)"
      >
      <div v-if="variant.id !== activeProductVariant.id"
      >
        <img
          v-if="variant.Images.length"
          :src="variant.Images[0].url"
          :alt="variant.Images[0].description"
          class="variant-image"
        />
      </div>
      </div>
    </div>
  </div>

  <div class="product-infos">
    <h2>{{ product.name }}</h2>
    <p>{{ product.description }}</p>
    <p>Prix : {{ activeProductVariant.price }}€</p>

    <div class="variant-options">
      <h4>Options:</h4>
      <div class="size-select">
        <label for="size">Taille:</label>
        <select id="size" v-model="selectedSize" @change="selectSize(selectedSize)">
          <option v-for="option in selectedVariant.variantOptions" :key="option.id" :value="option.size">
            {{ option.size }}
          </option>
        </select>
      </div>
      <div class="color-select" v-if="availableColors.length">
        <label for="color">Couleur:</label>
        <select id="color" v-model="selectedColor" @change="selectColor(selectedColor)">
          <option v-for="color in availableColors" :key="color">
            {{ color }}
          </option>
        </select>
      </div>
    </div>

    <button @click="() => addToCart(1)" class="cart-actions">Ajouter au panier</button>

    <button v-if="isFavorite" @click.stop="removeFromFavorites(product.id)" class="favorite-actions">
      <i class="fas fa-heart"></i> Ajouté aux favoris
    </button>

    <button v-else @click.stop="addToFavorites(product.id)" class="favorite-actions">
      <i class="far fa-heart"></i> Ajouter aux favoris
    </button>
  </div>
</div>

  </div>
</template>

<script setup lang="ts">
import BreadCrumb from './BreadCrumb.vue'
import { ref, onMounted, inject, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '../tools/axios'
import Cookies from 'js-cookie'

const route = useRoute()
const router = useRouter()
const isFavorite = ref(false)
const productId = ref(route.params.id as string)
let user = Cookies.get('USER') ? JSON.parse(Cookies.get('USER').substring(2)).id : null
const showNotification = inject('showNotification');

interface VariantOption {
  id: string;
  size: string;
  color: string;
  stock: number;
  price: number; // Ajouter le prix ici
}

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  images: Array<{ id: string; url: string; description: string }>;
  variantOptions: VariantOption[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  reference: string;
  comments: string[];
  Categories: number[];
  productVariants: ProductVariant[];
}

const product = ref<Product>({
  id: '',
  name: '',
  description: '',
  price: 0,
  reference: '',
  comments: [],
  Categories: [],
  productVariants: []
});

const selectedVariant = ref<ProductVariant | null>(null);
const activeProductVariant = ref<ProductVariant | null>(null);
const selectedSize = ref<string>('');
const selectedColor = ref<string>(''); // Ajouter une référence pour la couleur sélectionnée
const availableColors = computed(() => {
  if (selectedVariant.value && selectedSize.value) {
    return selectedVariant.value.variantOptions
      .filter(option => option.size === selectedSize.value)
      .map(option => option.color);
  }
  return [];
});

const fetchProductById = async (id: string) => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/${id}`);
  product.value = response.data;

  const originalVariant = product.value.ProductVariants.find(variant => variant.name === 'Original');
  if (originalVariant) {
    selectedVariant.value = originalVariant;
    activeProductVariant.value = originalVariant;
    selectedSize.value = originalVariant.variantOptions[0]?.size || '';
    selectedColor.value = originalVariant.variantOptions[0]?.color || '';
  } else if (product.value.productVariants.length > 0) {
    selectedVariant.value = product.value.productVariants[0]; // Sélectionner le premier variant par défaut
    activeProductVariant.value = product.value.productVariants[0]; // Afficher le premier variant par défaut
    selectedSize.value = product.value.productVariants[0]?.variantOptions[0]?.size || '';
    selectedColor.value = product.value.productVariants[0]?.variantOptions[0]?.color || '';
  }

  if (user) {
    const favoriteResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/favorites`);
    const favoriteProductIds = favoriteResponse.data.map((fav: any) => fav.productId);
    isFavorite.value = favoriteProductIds.includes(product.value.id);
  }
};

const addToFavorites = async (productId: string) => {
  if (!user) {
    router.push('/login');
    return;
  }
  const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/favorites`, { productId });

  if (response.status === 201) {
    isFavorite.value = true
    showNotification('Produit ajouté aux favoris avec succès', 'success');
  }
};

const removeFromFavorites = async (productId: string) => {
  if (!user) {
    throw new Error('User is not authenticated');
  }

  await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/favorites/${productId}`)
  isFavorite.value = false
  showNotification('Produit supprimé des favoris avec succès', 'success');
}

const addToCart = async (quantity: number) => {
  if (!user) {
    if (localStorage.getItem('temporaryId')) {
      user = localStorage.getItem('temporaryId');
    } else {
      user = Math.floor(Math.random() * 2147483647).toString();
      localStorage.setItem('temporaryId', user);
    }
  }
  try {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/carts`, {
      userId: user,
      variantOptionId: activeProductVariant.value.variantOptions[0].id,
      quantity: quantity
    })
    showNotification('Produit ajouté au panier avec succès', 'success');
  } catch (error) {
    showNotification('Échec de l\'ajout du produit au panier', 'error');
  }
};

const selectVariant = (variant: ProductVariant) => {
  selectedVariant.value = variant;
  activeProductVariant.value = variant;
  selectedSize.value = variant.variantOptions[0]?.size || '';
  selectedColor.value = variant.variantOptions[0]?.color || '';
};

const selectSize = (size: string) => {
  selectedSize.value = size;
  const variantOption = selectedVariant.value?.variantOptions.find(option => option.size === size && option.color === selectedColor.value);
  if (variantOption) {
    activeProductVariant.value = {
      ...selectedVariant.value,
      price: variantOption.price,
      images: selectedVariant.value.images,
      variantOptions: selectedVariant.value.variantOptions.filter(option => option.size === size)
    };
  }
};

const selectColor = (color: string) => {
  selectedColor.value = color;
  const variantOption = selectedVariant.value?.variantOptions.find(option => option.size === selectedSize.value && option.color === color);
  if (variantOption) {
    activeProductVariant.value = {
      ...selectedVariant.value,
      price: variantOption.price,
      images: selectedVariant.value.images,
      variantOptions: selectedVariant.value.variantOptions.filter(option => option.color === color)
    };
  }
};

onMounted(() => {
  fetchProductById(productId.value);
});
</script>

<style scoped>
.product-page {
  display: flex;
  flex-wrap: wrap;
}

.product-page > * {
  flex: 1 1 50%;
}

.product-image {
  max-width: 600px;
  width: 100%;
  height: auto;
}

.product-infos {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 0 72px;
}

.product-infos p {
  text-align: justify;
}

.cart-actions,
.favorite-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.cart-actions {
  background-color: #2F855A;
}

.favorite-actions {
  background-color: #000000;
}

.fa-heart {
  margin-right: 6px;
}

.cart-actions:hover,
.favorite-actions:hover {
  opacity: 0.8;
}

.product-variants {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.variant-option {
  cursor: pointer;
  text-align: center;
}

.variant-option img {
  width: 100px;
  height: auto;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.variant-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.size-select,
.color-select {
  display: flex;
  align-items: center;
  gap: 10px;
}

.size-select label,
.color-select label {
  font-weight: bold;
}

.size-select select,
.color-select select {
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

@media (max-width: 768px) {
  .product-page > * {
    flex: 1 1 100%;
  }
}
</style>
