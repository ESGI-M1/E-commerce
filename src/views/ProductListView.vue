<template>
  <div class="flex">
    <FacetedSearchView />
    <div class="product-list" v-if="filteredProducts.length">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="product-card"
        :class="{ calc: filteredProducts.length > 2 }"
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
    <div class="no-products" v-else>
      <p>Aucun produit disponible.</p>
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

<style scoped>/* Container de la liste des produits */
.product-list {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  padding: 20px; 
}

.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  position: relative;
}

.product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.product-image {
  width: 100%;
  height: 300px; 
  object-fit: cover;
  transition: opacity 0.3s;
}

.product-card:hover .product-image {
  opacity: 0.8;
}

.product-info {
  padding: 20px;
  background: #fff;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-name {
  font-size: 1.8em;
  margin-bottom: 10px;
  font-weight: bold;
  color: #333;
}

.product-description {
  margin-bottom: 15px;
  color: #666;
}

.product-variant-name {
  color: #888;
  margin-bottom: 10px;
  font-size: 0.9em;
}

.product-price {
  font-weight: bold;
  color: #e94e77;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.product-variants-count {
  color: #777;
  font-size: 0.9em;
}

.no-products {
  text-align: center;
  padding: 50px;
  font-size: 1.5em;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 12px;
  background: #f4f4f4;
  margin: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.calc {
  flex: 1 1 calc(33.333% - 30px); 
  max-width: calc(33.333% - 30px); 
}

@media (max-width: 1200px) {
  .calc {
    flex: 1 1 calc(50% - 30px); 
    max-width: calc(50% - 30px); 
  }
}

@media (max-width: 768px) {
  .calc {
    flex: 1 1 calc(100% - 30px);
    max-width: calc(100% - 30px);
  }
}
</style>
