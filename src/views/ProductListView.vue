<template>
  <div>
    <FacetedSearchView />
    <div class="product-list">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="product-card"
      >
        <RouterLink :to="{ name: 'ProductDetail', params: { id: product._id } }">
          <div v-if="product.variants && product.variants.length">
            <template v-if="getDefaultVariantToDisplay(product)">
              <div>
                <img
                  v-if="getDefaultVariantToDisplay(product).images.length"
                  :src="`${imageUrl}${getDefaultVariantToDisplay(product).images[0].id}`"
                  :alt="getDefaultVariantToDisplay(product).images[0].description"
                  class="product-image"
                />
                <div class="product-info">
                  <h2 class="product-name">{{ product.name }}</h2>
                  <p class="product-description">{{ product.description }}</p>
                  <p class="product-variant-name">{{ getDefaultVariantToDisplay(product).name }}</p>
                  <p class="product-price">{{ getDefaultVariantToDisplay(product).price }}€</p>
                  <p class="product-variants-count">
                    Nombre de déclinaisons possibles : {{ countFilteredVariants(product) }}
                  </p>
                </div>
              </div>
            </template>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted} from 'vue';
import { useProductsStore } from '@/store/products';
import FacetedSearchView from './FacetedSearchView.vue';

const productsStore = useProductsStore();
const imageUrl = import.meta.env.VITE_API_BASE_URL + '/images/variant/';

const filteredProducts = computed(() => {
  return productsStore.products.filter(product => {
    return getFilteredVariants(product).length > 0;
  });
});

const getFilteredVariants = (product) => {
  if (!product.variants || !product.variants.length) return [];

  return product.variants.filter(variant => {
    const isInStock = !productsStore.filter.inStock || variant.stock > 0;
    const isPriceInRange = (!productsStore.filter.minPrice || variant.price >= productsStore.filter.minPrice) &&
                            (!productsStore.filter.maxPrice || variant.price <= productsStore.filter.maxPrice);

    return variant.active && isInStock && isPriceInRange;
  });
};

const getDefaultVariantToDisplay = (product) => {
  const filteredVariants = getFilteredVariants(product);

  return filteredVariants.find(variant => variant.default) || filteredVariants[0] || null;
};

const countFilteredVariants = (product) => {
  return getFilteredVariants(product).length;
};

onMounted(() => {
  productsStore.fetchProducts();
});

</script>

<style>
.product-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.product-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  width: calc(33.333% - 20px);
  margin: 10px;
  box-sizing: border-box;
  cursor: pointer;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: scale(1.05);
}

.product-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.product-info {
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.product-name {
  font-size: 1.5em;
  margin-bottom: 10px;
}

.product-description {
  margin-bottom: 10px;
}

.product-variant-name {
  color: grey;
  margin-bottom: 10px;
}

.product-price {
  font-weight: bold;
  color: #2c3e50;
}

.product-variants-count {
  margin-top: 10px;
  color: #555;
  font-size: 0.875em;
}
</style>
