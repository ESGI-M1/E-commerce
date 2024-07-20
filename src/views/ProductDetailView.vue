<template>

  <BreadCrumb v-if="false" :category="product.Categories[0]" />

  <div v-if="product" class="product-page">
    <div class="selected-variant" v-if="selectedVariant.images">
      <template v-for="image in selectedVariant.images" :key="image.id">
        <img
          class="product-image"
          :src="imageUrl + `/images/variant/${image.id}`" 
          :alt="image.description"
        />
      </template>
    </div>

    <div class="product-infos">
      <h2>{{ product.name }}</h2>
      <p>{{ product.description }}</p>
      <p>Prix : {{ selectedVariant?.price }} €</p>

      <div class="variant-attributes">
        <h3>Options:</h3>
        <div class="product-variants">
          <div v-for="attribute in attributes" :key="attribute.name" class="variant-options">
            <h4>{{ attribute.name }}</h4>
            <div v-for="value in attribute.values" :key="value" class="variant-option">
              <input
                type="radio"
                :id="value"
                :value="value"
                :name="attribute.name"
                v-model="selectedVariant"
              />
              <label :for="value">{{ value }}</label>
            </div>
          </div>
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
</template>

<script setup lang="ts">
import BreadCrumb from './BreadCrumb.vue'
import { ref, onMounted, inject, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { z, ZodError } from 'zod'
import axios from '../tools/axios'
import Cookies from 'js-cookie'

const route = useRoute()
const router = useRouter()
const isFavorite = ref(false)
const productId = route.params.id
let user = Cookies.get('USER') ? JSON.parse(Cookies.get('USER').substring(2)).id : null
const showNotification = inject('showNotification');

const imageUrl = import.meta.env.VITE_API_BASE_URL;

const categorySchema = z.object({
  id: z.number(),
  name: z.string()
})

const attributeSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Le nom est requis')
})

const attributeValueSchema = z.object({
  id: z.number(),
  value: z.string().min(1, 'La valeur est requise'),
  attribute: attributeSchema
})

const imageSchema = z.object({
  id: z.number(),
  description: z.string().optional()
})

const productVariantSchema = z.object({
  id: z.number(),
  productId: z.number(),
  reference: z.string().min(1, 'La référence est requise'),
  price: z.number({ coerce: true }).positive('Le prix doit être supérieur à 0'),
  stock: z.number().min(0, 'Le stock doit être supérieur ou égal à 0'),
  active: z.boolean(),
  default: z.boolean(),
  attributeValues: z.array(attributeValueSchema).optional(),
  images: z.array(imageSchema)
})

const productSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Le nom est requis'),
  reference: z.string().min(1, 'La référence est requise'),
  description: z.string().min(1, 'La description est requise'),
  price: z.number({ coerce: true }).positive('Le prix doit être supérieur à 0'),
  active: z.boolean(),
  Categories: z.array(categorySchema),
  defaultCategoryId: z.number().nullable(),
  variants: z.array(productVariantSchema)
})

type Product = z.infer<typeof productSchema>
type ProductVariant = z.infer<typeof productVariantSchema>

const product = ref<Product>()
const selectedVariant = ref<ProductVariant>()

const attributes = computed(() => {
  if (!product.value || !product.value.variants || product.value.variants.length === 0) {
    return [];
  }

  const attributeMap = new Map<number, { name: string, values: string[] }>();

  product.value.variants.forEach(variant => {
    if (variant.active) {
      variant.attributeValues.forEach(attributeValue => {
        if (!attributeMap.has(attributeValue.attribute.id)) {
          attributeMap.set(attributeValue.attribute.id, {
            name: attributeValue.attribute.name,
            values: []
          });
        }
        attributeMap.get(attributeValue.attribute.id)?.values.push(attributeValue.value);
      });
    }
  });

  return Array.from(attributeMap.values()).map(attr => {
    return {
      ...attr,
      values: Array.from(new Set(attr.values)) // Remove duplicates
    };
  });
});


const fetchProduct = async () => {

  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/${productId}`);
    product.value = productSchema.parse(response.data);

    selectedVariant.value = product.value.variants.find(variant => variant.default === true);

    if (user) {
      const favoriteResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/favorites`);
      const favoriteProductIds = favoriteResponse.data.map((fav: any) => fav.productId);
      isFavorite.value = favoriteProductIds.includes(product.value.id);
    }
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(error.errors);
    } else {
      console.error(error);
    }
  }
};

const addToFavorites = async (productId: string) => {
  try {
    if (!user) {
      router.push('/login');
      return;
    }
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/favorites`, { productId });

    if (response.status === 201) {
      isFavorite.value = true
      showNotification('Produit ajouté aux favoris avec succès', 'success');
    }
  } catch (error) {
    showNotification('Échec de l\'ajout du produit aux favoris', 'error');
  }
};

const removeFromFavorites = async (productId: string) => {

  try {
    if (!user) {
      throw new Error('User is not authenticated');
    }

    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/favorites/${productId}`)
    isFavorite.value = false
    showNotification('Produit supprimé des favoris avec succès', 'success');
  } catch (error) {
    showNotification('Échec de la suppression du produit des favoris', 'error');
  }
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
      productVariantId: selectedVariant.value.id,
      quantity: quantity
    })
    showNotification('Produit ajouté au panier avec succès', 'success');
  } catch (error) {
    showNotification('Échec de l\'ajout du produit au panier', 'error');
  }
};

onMounted(() => {
  fetchProduct();
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
