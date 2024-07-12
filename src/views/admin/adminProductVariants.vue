<template>
  <div class="content">
    <div class="infos">
      <div>
        <div class="table-header">
          <h2>Informations du produit</h2>
        </div>
        <div>
          <p>Nom : {{ product.name || '-' }}</p>
          <p>Référence : {{ product.reference || '-' }}</p>
          <p>Prix de base : {{ product.price || '-' }} €</p>
          <p>Description : {{ product.description || '-' }}</p>
          <p>Statut : {{ product.active ? 'Actif' : 'Inactif' }}</p>
          <p>
            Catégories :
            <span v-if="product.Categories.length === 0">Aucune</span>
            <span v-else>{{ product.Categories.map(category => category.name).join(', ') }}</span>
          </p>
        </div>
      </div>
      <div>
        <div class="table-header">
          <h2>Options de déclinaison</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Valeurs</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="option in variantOptions" :key="option.id">
              <td>{{ option.name }}</td>
              <td>
                <ul>
                  <li v-for="value in option.variantValues" :key="value.id">
                    {{ value.value }}
                  </li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="productVariants">
      <div class="table-header">
        <h2>Déclinaisons du produit : {{ product.name }} ({{ productVariants.length }})</h2>
      </div>
      <table>
        <thead>
          <tr>
            <th>Déclinaisons</th>
            <th>Nom</th>
            <th>Référence</th>
            <th>Prix</th>
            <th>Quantité en stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="variant in productVariants" :key="variant.id">
            <td>
              <ul>
                <li v-for="detail in variant.productVariantDetails" :key="detail.id">
                  {{ detail.variantOption.name }} : {{ detail.variantValue.value }}
                </li>
              </ul>
            </td>

            <td :class="{ 'text-grayed-out': !variant.reference }">
              {{ variant.name || product.name + ' #' + variant.id }}
            </td>

            <td :class="{ 'text-grayed-out': !variant.reference }">
              {{ variant.reference || product.reference }}
            </td>

            <td :class="{ 'text-grayed-out': !variant.reference }">
              {{ variant.price || product.price }} €
            </td>

            <td>{{ variant.stockQuantity }}</td>

            <td>
              <div class="actions">
                <a @click="showEditProductVariantModal(variant)" class="a-primary" title="Modifier">
                  <i class="fa fa-edit"></i> Modifier
                </a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="showModal" class="modal-overlay">
        <div class="modal">
          <span class="close" @click="closeModal">&times;</span>
          <h2>Modifier la déclinaison</h2>
          <form @submit.prevent="updateProductVariant()">
            <div class="form-group">
              <label for="name">Nom</label>
              <input v-model="currentProductVariant.name" type="text" id="name" />
            </div>

            <div class="form-group">
              <label for="reference">Référence</label>
              <input v-model="currentProductVariant.reference" type="text" id="reference" />
            </div>

            <div class="form-group">
              <label for="price">Prix</label>
              <input v-model.number="currentProductVariant.price" type="number" step="0.01" id="price" />
            </div>

            <div class="form-group">
              <label for="stockQuantity">Quantité en stock</label>
              <input v-model.number="currentProductVariant.stockQuantity" type="number" id="stockQuantity" />
            </div>

            <div class="buttons">
              <button type="submit" class="btn btn-primary">Enregistrer</button>
              <button type="button" class="btn btn-danger" @click="closeModal">Annuler</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lan g="ts">

import { z } from 'zod';
import { ref, onMounted } from 'vue';
import axios from '../../tools/axios';
import { useRoute } from 'vue-router';

const route = useRoute();
const showModal = ref(false);
const productId = ref(route.params.id);

const product = ref({
  name: '',
  reference: '',
  description: '',
  price: 0,
  active: true,
  Categories: [],
});

const productVariants = ref([]);
const variantOptions = ref([]);
const currentProductVariant = ref({
  name: '',
  reference: '',
  price: 0,
  stockQuantity: 0,
});

const fetchProduct = async (id) => {
  const response = await axios.get(`http://localhost:3000/products/${id}`);
  product.value = response.data;
};

const fetchProductVariants = async (productId) => {
  const response = await axios.get(`http://localhost:3000/product_variants/${productId}`);
  productVariants.value = response.data;
};

const fetchVariantOptions = async (productId) => {
  const response = await axios.get(`http://localhost:3000/variant_options/${productId}`);
  variantOptions.value = response.data;
};

const productVariantSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, 'Le nom est trop court'),
  reference: z.string().min(2, 'La référence est trop courte'),
  price: z.number().positive('Le prix doit être positif'),
  stockQuantity: z.number().positive('La quantité en stock doit être positive'),
});

const updateProductVariant = async () => {
  try {
    const parsedProductVariant = productVariantSchema.parse({ ...currentProductVariant.value, price: parseFloat(currentProductVariant.value.price) });
    await axios.patch(`http://localhost:3000/product_variants/${currentProductVariant.value.id}`, parsedProductVariant, { withCredentials: true });
    
    const index = productVariants.value.findIndex((p) => p.id === currentProductVariant.value.id);
    if (index !== -1) productVariants.value[index] = currentProductVariant.value;

    closeModal();
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Erreur de validation Zod:', error.errors);
    } else {
      console.error('Erreur lors de la mise à jour du produit:', error);
    }
  }
};

const showEditProductVariantModal = (productVariant) => {
  currentProductVariant.value = { ...productVariant };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

onMounted(() => {
  fetchProduct(productId.value);
  fetchProductVariants(productId.value);
  fetchVariantOptions(productId.value);
})

</script>

<style scoped>

.content {
  padding: 20px;
}

.infos {
  display: flex;
  justify-content: space-between;
}

.infos > div {
  width: 100%;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  cursor: pointer;
}

form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input[type='text'],
.form-group input[type='date'],
.form-group input[type='number'],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.buttons {
  margin-top: 20px;
}

.buttons button {
  margin-right: 10px;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  cursor: pointer;
}

img {
  cursor: pointer;
}

ul {
  list-style-type: none;
  padding: 0;
}

.text-success {
  color: green;
}

.text-danger {
  color: red;
}

.text-grayed-out {
  opacity: 0.5;
}

</style>
