<template>
  <div class="return">
    <RouterLink :to="{ name: 'Produits' }">
      <i class="fa fa-arrow-left"></i> Retour
    </RouterLink>
  </div>

  <div class="products">
    <div class="div-header">
      <h1>Déclinaisons : {{ productVariants.length }}</h1>
      <button @click="isEditing = false; showVariantModal('variant');" class="btn btn-success">
        <i class="fa fa-plus"></i> Ajouter une déclinaison
      </button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Référence</th>
          <th>Prix</th>
          <th>Stock</th>
          <th>Attributs</th>
          <th>Actif</th>
          <th>Défaut</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(variant, index) in productVariants" :key="index">
          <td>{{ variant.reference }}</td>
          <td>{{ variant.price }}</td>
          <td>{{ variant.stock }}</td>
          <td>
            <span v-for="(attributeValue, index) in variant.attributeValues" :key="index">
              {{ attributeValue.value }}
              <span v-if="index < variant.attributeValues.length - 1">, </span>
            </span>
          </td>
          <td>
            <i :class="variant.active ? 'fa fa-check text-success' : 'fa fa-times text-danger'"></i>
          </td>
          <td>
            <span @click="changeDefaultVariant(variant.id)" class="default-variant-button">
              <i :class="variant.default ? 'fa fa-check text-success' : 'fa fa-times text-danger'"></i>
            </span>
          </td>
          <td>
            <button @click="isEditing = true; currentVariant = variant; showVariantModal('variant');" class="btn btn-primary">
              <i class="fa fa-edit"></i>
            </button>
            <button @click="currentVariant = variant; showModalImage = true;" class="btn btn-info">
              <i class="fa fa-image"></i>
            </button>
            <fancy-confirm
              :class="'a-danger'"
              :confirmationMessage="'Etes-vous sûr de vouloir supprimer la déclinaison ?'"
              :elementType="'a'"
              @confirmed="deleteVariant(variant.id)"
            >
              <template #buttonText>
                <i class="fa fa-trash"></i>
              </template>
            </fancy-confirm>
          </td>
        </tr>
      </tbody>
    </table>

    <Modal v-if="showModal" @close="showModal = false" :title="isEditing ? 'Modifier ' : 'Ajouter ' + titleModal[modalName]" :onSave="() => handleSubmit(modalName)">
      <form @submit.prevent="handleSubmit('variant')">
        <div class="form-group">
          <label for="reference">Référence</label>
          <input type="text" v-model="currentVariant.reference" id="reference" />
        </div>
        <div class="form-group">
          <label for="price">Prix</label>
          <input type="number" v-model="currentVariant.price" id="price" />
        </div>
        <div class="form-group">
          <label for="stock">Stock</label>
          <input type="number" v-model="currentVariant.stock" id="stock" />
        </div>
        <div class="form-group">
          <label for="attributeValues">Attributs</label>
            <select v-model="currentAttributes" multiple id="attributeValues">
              <option v-for="(attribute, index) in attributes" :key="index" :value="attribute">{{ attribute.name }}</option>
            </select>
        </div>
        <div class="form-group" v-for="(attribute, index) in currentAttributes" :key="index">
          <label :for="'attributeValue' + index">{{ attribute.name }}</label>
          <select v-model="currentVariant.attributeValues[index]" :id="'attributeValue' + index">
            <option v-for="(value, index) in attribute.values" :key="index" :value="value">{{ value.value }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="active">Actif</label>
          <input type="checkbox" v-model="currentVariant.active" id="active" />
        </div>
      </form>
    </Modal>

    <Modal v-if="showModalImage" @close="showModalImage = false" title="Ajouter une image" :onSave="() => uploadImage(currentVariant.id)" :noShowFooter="true">
      <div class="images">
        <div v-for="(image, index) in currentVariant.images" :key="index" class="image-item">
          <p>{{ image.description }}</p>
          <img :src="imageUrl + image.id" :alt="image.description" />
          <button @click="deleteImage(image.id)" class="btn btn-danger">
            <i class="fa fa-trash"></i> Supprimer
          </button>
        </div>
      </div>
      <form @submit.prevent="uploadImage(currentVariant.id)">
        <div class="form-group images">
          <label for="imageFile">Image</label>
          <input type="file" @change="handleFileUpload" id="imageFile" accept="image/*" />
          <div v-if="imagePreview" class="image-preview">
            <img :src="imagePreview" alt="Preview" />
          </div>
        </div>
        <div class="form-group" v-if="selectedImage">
          <label for="imageDescription">Description de l'image</label>
          <input type="text" v-model="imageDescription" id="imageDescription" />
        </div>
        <button type="submit" class="btn btn-success">Ajouter</button>
      </form>
    </Modal>


  </div>


</template>

<script setup lang="ts">
import axios from '../../tools/axios';
import Modal from '../../components/ModalView.vue';
import FancyConfirm from '../../components/ConfirmComponent.vue';
import { ref, onMounted, inject } from 'vue';
import { z, ZodError } from 'zod'
import { useRoute } from 'vue-router';

const showNotification = inject('showNotification');
const route = useRoute();

const productId = parseInt(route.params.productId)

const showModal = ref(false)
const showModalImage = ref(false)
const isEditing = ref(false)
const modalName = ref('')
const imageUrl = import.meta.env.VITE_API_BASE_URL + '/images/variant/';

const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Le nom est requis'),
  reference: z.string().min(1, 'La référence est requise'),
  description: z.string().min(1, 'La description est requise'),
  price: z.number({ coerce: true }).positive('Le prix doit être supérieur à 0'),
  active: z.boolean(),
})

const attributeValueSchema = z.object({
  id: z.number(),
  value: z.string().min(1, 'La valeur est requise'),
})

const attributeSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Le nom est requis'),
  values: z.array(attributeValueSchema)
})

const attributesSchema = z.array(
  attributeSchema
)

const imageSchema = z.object({
  id: z.number(),
  description: z.string().min(1, 'La description est requise'),
})

const imagesSchema = z.array(
  imageSchema
)

const productVariantSchema = z.object({
  id: z.number().optional(),
  productId: z.number(),
  reference: z.string().min(1, 'La référence est requise'),
  price: z.number({ coerce: true }).positive('Le prix doit être supérieur à 0').optional(),
  stock: z.number().min(0, 'Le stock doit être supérieur ou égal à 0').optional(),
  active: z.boolean(),
  default: z.boolean(),
  attributeValues: z.array(attributeValueSchema).optional(),
  images: imagesSchema.optional()
})

const productVariantsSchema = z.array(
  productVariantSchema
)

type attribute = z.infer<typeof attributeSchema>

type productType = z.infer<typeof productSchema>
type productVariantType = z.infer<typeof productVariantSchema>
type productVariantsType = z.infer<typeof productVariantsSchema>

const attributes = ref<attribute[]>([])
const product = ref<productType>()
const currentVariant = ref<productVariantType>()
const currentAttributes = ref<attribute[]>([])
const productVariants = ref<productVariantsType>([])

const selectedImage = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const imageDescription = ref('');

const titleModal = {
  variant: 'une déclinaison',
};

const showVariantModal = (modal: string) => {
  showModal.value = true;
  modalName.value = modal;

  if (isEditing.value) {
    currentAttributes.value = currentVariant.value.attributeValues.map((attrValue) => {
      return attributes.value.find((attr) => attr.values.some((val) => val.id === attrValue.id));
    }).filter(attr => attr !== undefined);
  } else {
    currentAttributes.value = [];
    currentVariant.value = {
      productId: productId,
      reference: '',
      price: 0,
      stock: 0,
      active: true,
      default: false,
      attributeValues: []
    };
  }
};


const fetchAttributes = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/attributes`)
    attributes.value = attributesSchema.parse(response.data)
  } catch (error) {

    if(error instanceof ZodError) {
      console.error(error.errors)
    }

    showNotification('Erreur lors de la récupération des attributs', 'error')
  }
}

const fetchProduct = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/${productId}`)
    product.value = productSchema.parse(response.data)
  } catch (error) {
    if (error instanceof ZodError) {
      console.log(error.errors)
    } else {
      console.log(error)
      showNotification('Erreur lors de la récupération du produit', 'error')
    }
  }
}

const fetchProductVariants = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/productVariants?productId=${productId}`)
    productVariants.value = productVariantsSchema.parse(response.data)
  } catch (error) {

    if (error instanceof ZodError) {
      console.log(error.errors)
    } 

    console.log(error)
    showNotification('Erreur lors de la récupération des déclinaisons', 'error')
    
  }
}

const changeDefaultVariant = async (id: number) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/productVariants/set-default/${id}`)
    if(response.status === 200){
      productVariants.value.map((variant) => {
        variant.default = variant.id === id
      })
      showNotification('Déclinaison par défaut modifiée avec succès', 'success')
    }
  } catch (error) {
    console.error(error)
    showNotification('Erreur lors de la modification de la déclinaison par défaut', 'error')
  }
}

const uploadImage = async (productVariantId: number) => {
  try {
    if (selectedImage.value) {
      const formData = new FormData();
      formData.append('productVariantId', productVariantId.toString());
      formData.append('image', selectedImage.value);
      formData.append('description', imageDescription.value);
      
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      currentVariant.value.images.push(imageSchema.parse(response.data));

      showNotification('Image ajoutée avec succès', 'success');
    }
  } catch (error) {
    console.error(error);
    showNotification('Erreur lors de l\'ajout de l\'image', 'error');
  }
};

const deleteImage = async (imageId: number) => {
  try {
    const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/images/${imageId}`);
    if (response.status === 204) {
      currentVariant.value.images = currentVariant.value.images.filter(image => image.id !== imageId);
      showNotification('Image supprimée avec succès', 'success');
    }
  } catch (error) {
    console.error(error);
    showNotification('Erreur lors de la suppression de l\'image', 'error');
  }
};

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedImage.value = input.files[0];
    
    // Afficher l'aperçu de l'image
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    selectedImage.value = null;
    imagePreview.value = null;
  }
};

const handleSubmit = async (modalName: string) => {
  try{

    let data;
    if(modalName === 'variant'){
      console.log(currentVariant.value)
      data = productVariantSchema.parse(currentVariant.value)
    }

    if(isEditing.value){
      const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/productVariants/${currentVariant.value.id}`, data)
      const parsedData = productVariantSchema.parse(response.data)
      await uploadImage(response.data.id);
      const index = productVariants.value.findIndex((variant) => variant.id === currentVariant.value.id)
      productVariants.value[index] = parsedData
      showNotification('Déclinaison modifiée avec succès', 'success')

    } else {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/productVariants`, data)
      const parsedData = productVariantSchema.parse(response.data)
      await uploadImage(response.data.id);
      productVariants.value.push(parsedData)
      showNotification('Déclinaison ajoutée avec succès', 'success')
    }

    
    showModal.value = false
  }
  catch (error) {

    if (error instanceof ZodError) {
      console.log(error.errors)
    }

    console.log(error)
    showNotification('Erreur lors de la sauvegarde de la déclinaison', 'error')
    
  }
}

const deleteVariant = async (id: number) => {
  try {
    const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/productVariants/${id}`)
    if(response.status === 204){
      productVariants.value = productVariants.value.filter((variant) => variant.id !== id)
      showNotification('Déclinaison supprimée avec succès', 'success')
    }
  } catch (error) {
    console.error(error)
    showNotification('Erreur lors de la suppression de la déclinaison', 'error')
  }
}

onMounted(() => {
  fetchProduct()
  fetchProductVariants()
  fetchAttributes()
})
</script>

<style scoped>
.products {
  padding: 20px;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  cursor: pointer;
}

.filters {
  display: flex;
  margin-bottom: 20px;
}

.filters div {
  display: flex;
  flex-direction: column;
}

.filters input {
  margin-right: 10px;
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
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

.text-success {
  color: green;
}

.text-danger {
  color: red;
}

.default-variant-button:hover{
  cursor: pointer;
}

.images {
  display: flex;
  gap: 10px;
}

.images img {
  width: 100px;
  height: 100px;
}

</style>
