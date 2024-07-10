<template>
  <div class="productVariants">
    <h1>Déclinaisons du produit : {{ product.name }} ({{ productVariants.length }})</h1>
    <div class="text-right">
      <button @click="showAddProductVariantModal" class="btn btn-success">
        <i class="fa fa-plus"></i> Ajouter une déclinaison
      </button>
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
          <td>{{ variant.name || product.name }}</td>
          <td>{{ variant.reference || product.reference }}</td>
          <td>{{ variant.price || product.price }} €</td>
          <td>{{ variant.stockQuantity }}</td>
          <td>
            <div class="flex">
              <a @click="showEditProductVariantModal(variant)" class="a-primary" title="Modifier">
                <i class="fa fa-edit"></i>
              </a>
              &nbsp;
              <fancy-confirm
                :class="'a-danger'"
                :title="'Supprimer la déclinaison'"
                :message="'Êtes-vous sûr de vouloir supprimer la déclinaison ' + variant.name + ' ?'"
                @confirm="deleteProductVariant(variant)"
              >
                <template #buttonText>
                  <i class="fa fa-trash"></i>
                </template>
              </fancy-confirm>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lan g="ts">

import { z } from 'zod';
import { ref, onMounted } from 'vue';
import axios from '../../tools/axios';
import { useRoute, useRouter } from 'vue-router';
import FancyConfirm from '../../components/ConfirmComponent.vue';

const route = useRoute();
const router = useRouter();
const productId = ref(route.params.id);

const productVariantSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Le nom est requis'),
  reference: z.string().min(1, 'La référence est requise'),
  price: z.number().positive('Le prix doit être supérieur à 0'),
  stockQuantity: z.number().positive('La quantité en stock doit être positive'),
});

const product = ref({
  name: '',
  reference: '',
  description: '',
  price: 0,
  active: true,
  Categories: [],
});

const productVariants = ref([]);
const currentProductVariant = ref({
  name: '',
  reference: '',
  price: 0,
  stockQuantity: 0,
});

const showModal = ref(false);
const isEditing = ref(false);

const fetchProduct = async (id) => {
  const response = await axios.get(`http://localhost:3000/products/${id}`);
  product.value = response.data;
};

const fetchProductVariants = async (id) => {
  const response = await axios.get(`http://localhost:3000/product_variants/${id}`);
  productVariants.value = response.data;
};

const addProductVariant = async () => {
  const parsedProductVariant = productVariantSchema.parse({
    ...currentProductVariant.value,
    price: parseFloat(currentProductVariant.value.price),
  });

  const response = await axios.post('http://localhost:3000/productVariants', parsedProductVariant, { withCredentials: true });
  productVariants.value.push(response.data);
  closeModal();
};

const updateProductVariant = async () => {
  const parsedProductVariant = productVariantSchema.parse({
    ...currentProductVariant.value,
    price: parseFloat(currentProductVariant.value.price)
  })

  await axios.patch(`http://localhost:3000/productVariants/${currentProductVariant.value.id}`, parsedProductVariant, { withCredentials: true });
  const index = productVariants.value.findIndex((p) => p.id === currentProductVariant.value.id);
  if (index !== -1) {
    productVariants.value[index] = currentProductVariant.value;
  }

  closeModal();
};

const deleteProductVariant = async (productVariant) => {
  await axios.delete(`http://localhost:3000/variants/${productVariant.id}`, { withCredentials: true });
  productVariants.value = productVariants.value.filter((p) => p.id !== productVariant.id);
};

const showAddProductVariantModal = () => {
  isEditing.value = false;
  currentProductVariant.value = {
    name: '',
    reference: '',
    price: 0,
    stockQuantity: 0,
  }
  showModal.value = true;
};

const showEditProductVariantModal = (productVariant) => {
  isEditing.value = true;
  currentProductVariant.value = { ...productVariant };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

onMounted(() => {
  fetchProduct(productId.value);
  fetchProductVariants(productId.value);
})

</script>

<style scoped>

.productVariants {
  padding: 20px;
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

.text-success {
  color: green;
}

.text-danger {
  color: red;
}

</style>
