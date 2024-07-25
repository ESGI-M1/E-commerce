<template>
  <div class="faceted-search" :class="{ collapsed: collapsed }" :style="{ width: sidebarWidth }">
    <input v-model="productsStore.filter.q" @input="applyFilters" placeholder="Rechercher..." />
    <input v-model.number="productsStore.filter.minPrice" @input="applyFilters" placeholder="Min Price" type="number" />
    <input v-model.number="productsStore.filter.maxPrice" @input="applyFilters" placeholder="Max Price" type="number" />
    <select v-model="productsStore.filter.category" @change="applyFilters" v-if="categoryStore.getCategory">
      <option value="">All Categories</option>
      <option v-for="category in categoryStore.getCategory.subCategories" :key="category.id" :value="category.id">{{ category.name }}</option>
    </select>
    <label>
      <input v-model="productsStore.filter.inStock" @change="applyFilters" type="checkbox" />
      In Stock
    </label>
  </div>
  <span class="collapse-icon" :class="{ 'rotate-180': collapsed }" @click="toggleSidebar">
      <i class="fas fa-angle-double-left" />
    </span>
</template>

<script setup>
import { onMounted } from 'vue';
import { useProductsStore } from '@/store/products';
import { useCategoryStore } from '@/store/category';
import { useRoute, useRouter } from 'vue-router';
import { collapsed, toggleSidebar, sidebarWidth } from '../../src/components/sidebar/state';

const route = useRoute();
const router = useRouter();

const productsStore = useProductsStore();
const categoryStore = useCategoryStore();

const applyFilters = () => {

  if(categoryStore.getCategory) {
    productsStore.fetchProductsByCategory(categoryStore.getCategory.id);
  } else {
    productsStore.fetchProducts();
  }
  router.push({
    query: {
      q: productsStore.filter.q,
      minPrice: productsStore.filter.minPrice,
      maxPrice: productsStore.filter.maxPrice,
      category: productsStore.filter.category,
      inStock: productsStore.filter.inStock
    }
  });
};

const parseQueryParams = () => {
  const query = route.query;
  productsStore.filter.q = query.q || '';
  productsStore.filter.minPrice = query.minPrice ? Number(query.minPrice) : null;
  productsStore.filter.maxPrice = query.maxPrice ? Number(query.maxPrice) : null;
  productsStore.filter.category = query.category ? Number(query.category) : null;
  productsStore.filter.inStock = query.inStock === 'true';
};

onMounted(() => {
  parseQueryParams();
});
</script>

<style>
.faceted-search {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 250px;
}

.faceted-search h2 {
  font-size: 1.5em;
  margin-bottom: 15px;
  color: #2c3e50;
  font-weight: 600;
}

.faceted-search .filter-group {
  margin-bottom: 15px;
}

.faceted-search .filter-group label {
  display: flex;
  align-items: center;
  font-weight: 500;
  margin-bottom: 10px;
  color: #34495e;
}

.faceted-search input[type="number"],
.faceted-search select,
.faceted-search input[type="checkbox"] {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1em;
  box-sizing: border-box;
}

.faceted-search input[type="checkbox"] {
  width: auto;
  margin-right: 10px;
}

.faceted-search input[type="range"] {
  -webkit-appearance: none;
  background: #ddd;
  height: 8px;
  border-radius: 4px;
  margin-top: 5px;
}

.faceted-search input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: #3498db;
  cursor: pointer;
  border-radius: 50%;
}

.faceted-search input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #3498db;
  cursor: pointer;
  border-radius: 50%;
}

.faceted-search .range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.875em;
  color: #555;
}

.faceted-search .range-labels span {
  width: 50%;
  text-align: center;
}

.faceted-search button {
  padding: 12px 20px;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s, transform 0.2s;
  align-self: flex-start;
}

.faceted-search button:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

.faceted-search button:active {
  transform: translateY(0);
}

.collapse-icon {
  display: none;
}
@media (max-width: 768px) {
  .faceted-search {
      float: left;
      position: fixed;
      z-index: 1;
      top: 120px;
      left: 0;
      bottom: 0;
      padding: 0.5em;
      transition: 0.3s ease;
      display: flex;
      flex-direction: column;
      overflow: hidden;
}
  .collapse-icon {
    position: fixed;
    bottom: 0;
    left: 0;
    padding: 0.75em;
    color: black;
    transition: 0.2s linear;
    z-index: 9999;
    display: block;
  }

  .rotate-180 {
    transform: rotate(180deg);
    transition: 0.2s linear;
  }

  .faceted-search.collapsed {
    width: 0;
    padding: 0;
  }

  .faceted-search h1 {
    height: 2.5em;
  }

  .faceted-search hr {
    border: 0;
    border-top: 1px solid #ccc;
    margin: 1em 0.5em;
  }
}
</style>
