<template>
  <div class="container">
    <h1>Ma boutique</h1>
    <div class="shop-details">
      <p>
        <strong>Nom:</strong> {{ shop.name }}
        <a @click="openEditModal('general')"><i class="fa fa-edit edit-icon"></i></a>
      </p>
      <p>
        <strong>Description:</strong> {{ shop.description }}
        <a @click="openEditModal('general')"><i class="fa fa-edit edit-icon"></i></a>
      </p>
      <p>
        <strong>Téléphone:</strong> {{ shop.phone }}
        <a @click="openEditModal('general')"><i class="fa fa-edit edit-icon"></i></a>
      </p>
      <p>
        <strong>Email:</strong> {{ shop.email }}
        <a @click="openEditModal('general')"><i class="fa fa-edit edit-icon"></i></a>
      </p>
    </div>

    <div>
      <h2>Mentions légales</h2>
      <button @click="openEditModal('legalNotice')">Modifier</button>
      <div v-html="shop.legalNotice"></div>

      <h2>Conditions générales d'utilisation</h2>
      <button @click="openEditModal('cgu')">Modifier</button>
      <div v-html="shop.cgu"></div>

      <h2>Conditions générales de vente</h2>
      <button @click="openEditModal('cgv')">Modifier</button>
      <div v-html="shop.cgv"></div>
    </div>

    <Modal v-if="isOpen" @close="isOpen = false" :title="titleModal[modalName]" :onSave="handleSave">
      <template v-if="modalName === 'general'">
        <form @submit.prevent="handleSubmit('general')">
          <div class="form-group">
            <label for="name">Nom</label>
            <input type="text" id="name" v-model="shop.name" required placeholder="Nom de la boutique">
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <input type="text" id="description" v-model="shop.description" required placeholder="Description de la boutique">
          </div>
          <div class="form-group">
            <label for="phone">Téléphone</label>
            <input type="text" id="phone" v-model="shop.phone" required autocomplete="tel" placeholder="Téléphone de la boutique">
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="shop.email" required autocomplete="email" placeholder="Email de la boutique">
          </div>
        </form>
      </template>
      <template v-else>
        <Editor
          v-model="shop[modalName]"
          :api-key="tinymceKey"
          :init="{
            plugins: 'preview paste importcss searchreplace autolink directionality code visualblocks visualchars fullscreen link media template codesample table charmap hr pagebreak nonbreaking anchor insertdatetime advlist lists wordcount textpattern help charmap quickbars emoticons',
            toolbar: 'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen preview save print | insertfile media template link anchor codesample | ltr rtl',
            menubar: 'file edit view insert format tools table help',
            toolbar_sticky: true,
            quickbars_selection_toolbar: 'bold italic | quicklink h1 h2 h3 blockquote quicktable',
            nonbreaking_force_tab: true,
            templates: [
              { title: 'New Table', description: 'creates a new table', content: '<table><tr><th>Header</th></tr><tr><td>Data</td></tr></table>' },
              { title: 'Starting template', description: 'basic template', content: '<p>This is a starting template</p>' }
            ],
            quickbars_insert_toolbar: 'quicktable',
          }"
        />
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { z, ZodError } from 'zod';
import axios from '../../tools/axios';
import Editor from '@tinymce/tinymce-vue';
import Modal from '../../components/ModalView.vue';

const tinymceKey = import.meta.env.VITE_TINYMCE_API_KEY;
const isOpen = ref(false);
const modalName = ref('');
const isInit = ref(false);

const openEditModal = (modal: string) => {
  isOpen.value = true;
  modalName.value = modal;
};

const titleModal = {
  general: 'Modifier les informations générales de la boutique',
  legalNotice: 'Modifier les mentions légales de la boutique',
  cgu: 'Modifier les conditions générales d\'utilisation de la boutique',
  cgv: 'Modifier les conditions générales de vente de la boutique',
};

const shopSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  favicon: z.string(),
  logo: z.string(),
  street: z.string(),
  postalCode: z.string(),
  city: z.string(),
  country: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  legalNotice: z.string().optional(),
  cgu: z.string().optional(),
  cgv: z.string().optional(),
});

const modalSchema = z.object({
  name: z.string(),
  description: z.string(),
  phone: z.string(),
  email: z.string(),
});

const legalNoticeSchema = z.object({
  legalNotice: z.string(),
});

const cguSchema = z.object({
  cgu: z.string(),
});

const cgvSchema = z.object({
  cgv: z.string(),
});

type Shop = z.infer<typeof shopSchema>;

const shop = ref<Shop>({
  id: 1,
  name: '',
  description: '',
  favicon: '',
  logo: '',
  street: '',
  postalCode: '',
  city: '',
  country: '',
  phone: null,
  email: null,
  legalNotice: '',
  cgu: '',
  cgv: '',
});

const fetchShop = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/shop`);
    if (response.data) {
      shop.value = shopSchema.parse(response.data);
      isInit.value = true;
    }
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(error.errors);
    } else {
      console.error(error);
    }
  }
};

const handleSubmit = async (type: string) => {
  try {
    
    let data;
    if(modalName.value === 'general') {
      data = modalSchema.parse(shop.value);
    } else if(modalName.value === 'legalNotice') {
      data = legalNoticeSchema.parse(shop.value);
    } else if(modalName.value === 'cgu') {
      data = cguSchema.parse(shop.value);
    } else if(modalName.value === 'cgv') {
      data = cgvSchema.parse(shop.value);
    }

    if(!isInit.value) {
      axios.post(`${import.meta.env.VITE_API_BASE_URL}/shop`, data)
        .then(response => {
          if (response.data) {
            shop.value = shopSchema.parse(response.data);
            isOpen.value = false;
          }
        });
    }
    else{
      const response = await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/shop/${shop.value.id}`, data);
      if (response.data) {
        shop.value = shopSchema.parse(response.data);
        isOpen.value = false;
      }
    }
    
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(error.errors);
    } else {
      console.error(error);
    }
  }
};

const handleSave = () => {
  if (modalName.value === 'general') {
    handleSubmit('general');
  } else {
    handleSubmit(modalName.value);
  }
};

onMounted(() => {
  fetchShop();
});
</script>

<style scoped>
.container {
  margin: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f9f9f9;
}

.shop-details p {
  margin-bottom: 15px;
}

.edit-icon {
  margin-left: 10px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input[type='text'],
.form-group input[type='email'],
.form-group input[type='password'] {
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
</style>
