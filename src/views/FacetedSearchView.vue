<template>
  <div class="faceted-search">
    <input v-model="productsStore.filter.q" @input="applyFilters" placeholder="Search..." />
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
</template>

<script setup>
import { onMounted } from 'vue';
import { useProductsStore } from '@/store/products';
import { useCategoryStore } from '@/store/category';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const productsStore = useProductsStore();
const categoryStore = useCategoryStore();

const applyFilters = () => {

  productsStore.fetchProducts();
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
}

.faceted-search .filter-group {
  margin-bottom: 20px;
}

.faceted-search .filter-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 10px;
  color: #34495e;
}

.faceted-search .filter-group select,
.faceted-search .filter-group input[type="range"],
.faceted-search .filter-group input[type="checkbox"] {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.faceted-search .filter-group input[type="checkbox"] {
  width: auto;
  margin-right: 10px;
}

.faceted-search .filter-group input[type="checkbox"] + label {
  display: inline-block;
  margin-left: 5px;
}

.faceted-search .filter-group input[type="range"] {
  -webkit-appearance: none;
  background: #ddd;
  height: 8px;
  border-radius: 4px;
  margin-top: 5px;
}

.faceted-search .filter-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: #3498db;
  cursor: pointer;
  border-radius: 50%;
}

.faceted-search .filter-group input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #3498db;
  cursor: pointer;
  border-radius: 50%;
}

.faceted-search .filter-group .range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.875em;
  color: #555;
}

.faceted-search .filter-group .range-labels span {
  width: 50%;
  text-align: center;
}

.faceted-search button {
  padding: 10px 15px;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s;
}

.faceted-search button:hover {
  background-color: #2980b9;
}
</style>
