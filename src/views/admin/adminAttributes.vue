<template>
    <div class="attributes">
        <div class="div-header">
            <h1>Attributs : ({{ attributes.length }})</h1>
            <button @click="showAddAttributeModal('attribute')" class="btn btn-success">
                <i class="fa fa-plus"></i> Ajouter un attribut
            </button>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>Nom</th>
                    <th>Valeurs</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(attribute, index) in attributes" :key="index">
                    <td>{{ attribute.name }}</td>
                    <td>
                        <span v-for="(value, index) in attribute.values" :key="index">
                            {{ value.value }}
                            <span v-if="index < attribute.values.length - 1">, </span>
                        </span>
                    </td>
                    <td class="flex">
                        <a @click="showAddAttributeModal('attribute'); isEditing = true; currentAttribute = attribute" class="a-primary">
                            <i class="fa fa-edit"></i>
                        </a>
                        <fancy-confirm
                            :class="'a-danger'"
                            :confirmationMessage="'Etes-vous sûr de vouloir supprimer l\'attribut ?'"
                            :elementType="'a'"
                            @confirmed="deleteAttribute(attribute.id)"
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
            <form @submit.prevent="handleSubmit('attribute')">
                <div class="form-group">
                    <label for="name">Nom</label>
                    <input type="text" v-model="currentAttribute.name" id="name" />
                </div>
                <div class="form-group">
                    <label for="values">Valeurs</label>
                    <div v-for="(value, index) in currentAttribute.values" :key="index">
                        <input type="text" v-model="value.value" />
                        <button @click="removeValue(index)" type="button" class="btn btn-danger">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                    <button @click="addValue" type="button" class="btn btn-success">
                        <i class="fa fa-plus"></i> Ajouter une valeur
                    </button>
                </div>
            </form> 
        </Modal>
    </div>
</template>

<script setup lang="ts">
import axios from '../../tools/axios';
import Modal from '../../components/ModalView.vue';
import FancyConfirm from '../../components/ConfirmComponent.vue';
import { ref, onMounted, inject } from 'vue'
import { z, ZodError } from 'zod'

const showNotification = inject('showNotification');

const showModal = ref(false)
const isEditing = ref(false)
const modalName = ref('')

const attributeValueSchema = z.object({
  id: z.number().optional(),
  value: z.string().min(1, 'La valeur est requise'),
})

const attributeSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Le nom est requis'),
  values: z.array(attributeValueSchema)
})

const attributesSchema = z.array(
  attributeSchema
)

type attribute = z.infer<typeof attributeSchema>

const attributes = ref<attribute[]>([])
const currentAttribute = ref<attribute>()

const titleModal = {
  attribute: 'un attribut',
  value: 'une valeur d\'attribut'
};

const showAddAttributeModal = (modal: string) => {
  isEditing.value = false
  showModal.value = true
  modalName.value = modal
  currentAttribute.value = {
    name: '',
    values: []
  }
}

const addValue = () => {

    if(!currentAttribute.value) return;

    currentAttribute.value.values.push({
        value: ''
    })
}

const removeValue = (index: number) => {

    if(!currentAttribute.value) return;

    currentAttribute.value.values.splice(index, 1)
}

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

const deleteAttribute = async (id: number) => {
  try {
    const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/attributes/${id}`)
    if(response.data) {
      attributes.value = attributes.value.filter(a => a.id !== id)
      showNotification('Attribut supprimé avec succès', 'success')
    }
  } catch (error) {
    console.error(error)
    showNotification('Erreur lors de la suppression de l\'attribut', 'error')
  }
}

const handleSubmit = async (modal: string) => {
  
    try {

        let data;
        if (modal === 'attribute') {
            data = attributeSchema.parse(currentAttribute.value)
        }

        if (isEditing.value) {
            const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/attributes/${currentAttribute.value.id}`, data)
            if(response.data) {
                attributes.value[attributes.value.findIndex(a => a.id === currentAttribute.value.id)] = response.data
                showNotification('Attribut modifié avec succès', 'success')
            }
        } else {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/attributes`, data)
            if(response.data) {
                attributes.value.push(response.data)
                showNotification('Attribut ajouté avec succès', 'success')
            }
        }
        showModal.value = false
    } catch (error) {

        if (error instanceof ZodError) {
            console.error(error.errors)
        }
        console.error(error)
        showNotification('Erreur lors de la sauvegarde de l\'attribut', 'error')
      
    }

}

onMounted(() => {
  fetchAttributes()
})

</script>

<style scoped>
.attributes {
    padding: 20px;
}



</style>