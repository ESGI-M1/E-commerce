<template>

  <BreadCrumb v-if="false" :category="product.Categories[0]" />

  <div v-if="product && !notFound" class="product-page">
    <div v-if="selectedVariant" class="slider-container">
      <div class="slider" ref="slider">
        <div class="slide" v-for="image in selectedVariant.images" :key="image.id">
          <img class="product-image" :src="imageUrl + image.id" :alt="image.description"/>
        </div>
      </div>
      <button @click="prevSlide" class="slider-button prev-button"><</button>
      <button @click="nextSlide" class="slider-button next-button">></button>
    </div>

    <div class="product-infos">
      <h2>{{ product.name }}</h2>
      <p>{{ product.description }}</p>
      <p>Prix : {{ selectedVariant?.price }} €</p>

      <div class="variant-attributes">
        <div class="product-variants">
          <select @change="changeVariant($event)" :value="selectedVariant.attributeValues[0]?.id">
            <template v-for="variant in product.variants">
              <option v-for="attribute in variant.attributeValues" :key="variant.id" :value="attribute.id">
                {{ attribute.attribute.name }} : {{ attribute.value }}
              </option>
            </template>
          </select>
        </div>
      </div>

      <button @click="() => addToCart(1)" class="cart-actions" v-if="selectedVariant.stock > 0">
        <i class="fas fa-cart-plus"></i> Ajouter au panier
      </button>
      <button class="cart-actions" v-else>
        <i class="fas fa-cart-plus"></i> Produit indisponible
      </button>

      <button v-if="isFavorite" @click.stop="removeFromFavorites(product.id)" class="favorite-actions">
        <i class="fas fa-heart"></i> Ajouté aux favoris
      </button>

      <button v-else @click.stop="addToFavorites(product.id)" class="favorite-actions">
        <i class="far fa-heart"></i> Ajouter aux favoris
      </button>
    </div>
  </div>
  <NotFoundView v-else />
</template>

<script setup lang="ts">
import BreadCrumb from './BreadCrumb.vue'
import NotFoundView from './NotFoundView.vue';
import { ref, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { z, ZodError } from 'zod'
import { useCartStore } from '@/store/cart'
import axios from '../tools/axios'
import Cookies from 'js-cookie'
import { AxiosError } from 'axios';

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore();
const isFavorite = ref(false)
const productId = route.params.id
let user = Cookies.get('USER') ? JSON.parse(Cookies.get('USER').substring(2)).id : null
const showNotification = inject('showNotification');
const notFound = ref(false)

const slider = ref(null)
const currentSlide = ref(0)

const imageUrl = import.meta.env.VITE_API_BASE_URL + '/images/variant/';

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

const cartSchema = z.object({
  userId: z.number(),
  productVariantId: z.number().positive('L\'identifiant de la variante du produit doit être supérieur à 0'),
  quantity: z.number().positive('La quantité doit être supérieure à 0')
})

type Product = z.infer<typeof productSchema>
type ProductVariant = z.infer<typeof productVariantSchema>

const product = ref<Product>()
const selectedVariant = ref<ProductVariant>()

const changeVariant = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  selectedVariant.value = product.value.variants.find(variant => 
    variant.attributeValues.some(av => av.id === parseInt(target.value))
  );
}

const fetchProduct = async () => {

  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/${productId}`);
    product.value = productSchema.parse(response.data);

    const defaultVariant = product.value.variants.find(variant => variant.default === true);

    if (defaultVariant?.active) {
      selectedVariant.value = defaultVariant;
    }
    else{
      selectedVariant.value = product.value.variants.find(variant => variant.default === true);
    }

    if (user) {
      const favoriteResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/favorites`);
      const favoriteProductIds = favoriteResponse.data.map((fav: any) => fav.productId);
      isFavorite.value = favoriteProductIds.includes(product.value.id);
    }
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(error.errors);
    }

    if(error instanceof AxiosError && error.response?.status === 404) {
      notFound.value = true;
    }

    console.error(error);
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
    const cart = cartSchema.parse({
      userId: user,
      productVariantId: selectedVariant.value.id,
      quantity
    });
    await cartStore.addProductToCart(cart);
    showNotification('Produit ajouté au panier avec succès', 'success');
  } catch (error) {

    if (error instanceof ZodError) {
      console.error(error.errors);
    }

    console.error(error);
    showNotification('Échec de l\'ajout du produit au panier', 'error');
  }
};

const nextSlide = () => {
  if (slider.value) {
    currentSlide.value = (currentSlide.value + 1) % selectedVariant.value.images.length;
    slider.value.style.transform = `translateX(-${currentSlide.value * 100}%)`;
  }
};

const prevSlide = () => {
  if (slider.value) {
    currentSlide.value = (currentSlide.value - 1 + selectedVariant.value.images.length) % selectedVariant.value.images.length;
    slider.value.style.transform = `translateX(-${currentSlide.value * 100}%)`;
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
  margin: 0 auto;
  max-width: 1200px;
  padding: 0 15px;
}

.product-page > * {
  flex: 1 1 50%;
}

@media (max-width: 768px) {
  .product-page {
    padding: 0 10px;
  }
}

@media (max-width: 480px) {
  .product-page {
    padding: 0 5px;
  }
}

@media (max-width: 768px) {
  .product-page > * {
    flex: 1 1 100%;
  }
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
  flex-wrap: wrap;
  gap: 8px;
}

.product-variants select {
  flex: 1 1 33%;
  padding: 4px 6px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.slider-container {
  position: relative;
  overflow: hidden;
  width: 100%;
}

.slider {
  display: flex;
  transition: transform 0.5s ease;
}

.slide {
  min-width: 100%;
  box-sizing: border-box;
}

.slider-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
}

.prev-button {
  left: 10px;
}

.next-button {
  right: 10px;
}

</style>
