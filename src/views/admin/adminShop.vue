<template>
  <div class="container">
    <h1>Ma boutique</h1>
    <div class="shop-details">
      <div>
        <p>
          <strong>Nom:</strong> {{ shop.name }}
          <button @click="openEditModal('general')"><i class="fa fa-edit edit-icon"></i></button>
        </p>
        <p>
          <strong>Description:</strong> {{ shop.description }}
          <button @click="openEditModal('general')"><i class="fa fa-edit edit-icon"></i></button>
        </p>
        <p>
          <strong>Téléphone:</strong> {{ shop.phone }}
          <button @click="openEditModal('general')"><i class="fa fa-edit edit-icon"></i></button>
        </p>
        <p>
          <strong>Email:</strong> {{ shop.email }}
          <button @click="openEditModal('general')"><i class="fa fa-edit edit-icon"></i></button>
        </p>
        <p>
          <strong>Siret</strong> {{ shop.siret }}
          <button @click="openEditModal('general')"><i class="fa fa-edit edit-icon"></i></button>
        </p>
        <p>
          <strong>Actif:</strong> {{ shop.active ? 'Oui' : 'Non' }}
          <button @click="openEditModal('general')"><i class="fa fa-edit edit-icon"></i></button>
        </p>
      </div>
      <div>
        <p>
          <strong>Street:</strong> {{ shop.street }}
          <button @click="openEditModal('address')"><i class="fa fa-edit edit-icon"></i></button>
        </p>
        <p>
          <strong>Postal Code:</strong> {{ shop.postalCode }}
          <button @click="openEditModal('address')"><i class="fa fa-edit edit-icon"></i></button>
        </p>
        <p>
          <strong>City:</strong> {{ shop.city }}
          <button @click="openEditModal('address')"><i class="fa fa-edit edit-icon"></i></button>
        </p>
        <p>
          <strong>Country:</strong> {{ shop.country }}
          <button @click="openEditModal('address')"><i class="fa fa-edit edit-icon"></i></button>
        </p>
      </div>
      <div>
        <div>
          <img :src="shop.favicon" alt="favicon" width="50" height="50">
          <button @click="openEditModal('logo')"><i class="fa fa-edit edit-icon"></i></button>
        </div>
        <div>
          <img :src="shop.logo" alt="logo" width="50" height="50">
          <button @click="openEditModal('logo')"><i class="fa fa-edit edit-icon"></i></button>
        </div>
      </div>
    </div>

    <div>
      <div>
        <h2>Mentions légales</h2>
        <button @click="openEditModal('legalNotice')">Modifier</button>
        <div v-html="shop.legalNotice"></div>
      </div>

      <div>
        <h2>Conditions générales d'utilisation</h2>
        <button @click="openEditModal('cgu')">Modifier</button>
        <div v-html="shop.cgu"></div>
      </div>

      <div>
        <h2>Conditions générales de vente</h2>
        <button @click="openEditModal('cgv')">Modifier</button>
        <div v-html="shop.cgv"></div>
      </div>

      <div>
        <h2>RGPD</h2>
        <button @click="openEditModal('rgpd')">Modifier</button>
        <div v-html="shop.rgpd"></div>
      </div>

    </div>

    <Modal v-if="isOpen" @close="isOpen = false" :title="titleModal[modalName]" :onSave="() => handleSubmit(modalName)">
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
          <div class="form-group">
            <label for="siret">Siret</label>
            <input type="text" id="siret" v-model="shop.siret" required placeholder="Siret de la boutique">
          </div>
          <div class="form-group">
            <label for="active">Actif</label>
            <input type="checkbox" id="active" v-model="shop.active">
          </div>
        </form>
      </template>
      <template v-else-if="modalName === 'address'">
        <form @submit.prevent="handleSubmit('address')">
          <div class="form-group">
            <label for="street">Rue</label>
            <input type="text" id="street" v-model="shop.street" required placeholder="Rue de la boutique">
          </div>
          <div class="form-group">
            <label for="postalCode">Code Postal</label>
            <input type="text" id="postalCode" v-model="shop.postalCode" required placeholder="Code postal de la boutique">
          </div>
          <div class="form-group">
            <label for="city">Ville</label>
            <input type="text" id="city" v-model="shop.city" required placeholder="Ville de la boutique">
          </div>
          <div class="form-group">
            <label for="country">Pays</label>
            <input type="text" id="country" v-model="shop.country" required placeholder="Pays de la boutique">
          </div>
        </form>
      </template>
      <template v-else-if="modalName === 'logo'">
        <form @submit.prevent="handleSubmit('logo')">
          <div class="form-group">
            <label for="favicon">Favicon</label>
            <input type="text" id="favicon" v-model="shop.favicon" required placeholder="Favicon de la boutique">
          </div>
          <div class="form-group">
            <label for="logo">Logo</label>
            <input type="text" id="logo" v-model="shop.logo" required placeholder="Logo de la boutique">
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
import { ref, onMounted, inject } from 'vue';
import { z, ZodError } from 'zod';
import axios from '../../tools/axios';
import Editor from '@tinymce/tinymce-vue';
import Modal from '../../components/ModalView.vue';

const showNotification = inject('showNotification');
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
  address: 'Modifier l\'adresse de la boutique',
  logo: 'Modifier le logo de la boutique',
  legalNotice: 'Modifier les mentions légales de la boutique',
  cgu: 'Modifier les conditions générales d\'utilisation de la boutique',
  cgv: 'Modifier les conditions générales de vente de la boutique',
  rgpd: 'Modifier la politique de confidentialité de la boutique',
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
  siret: z.string().optional(),
  rgpd: z.string().optional(),
  active: z.boolean(),
});

const modalGeneralSchema = z.object({
  name: z.string(),
  description: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  siret: z.string().nullable(),
  active: z.boolean(),
});

const modalAddressSchema = z.object({
  street: z.string(),
  postalCode: z.string(),
  city: z.string(),
  country: z.string(),
});

const modalLogoSchema = z.object({
  favicon: z.string(),
  logo: z.string(),
});

const tinymceSchema = z.object({
  legalNotice: z.string().optional(),
  cgu: z.string().optional(),
  cgv: z.string().optional(),
  rgpd: z.string().optional(),
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
  rgpd: '',
  siret: '',
  active: true,
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
      data = modalGeneralSchema.parse(shop.value);
    }
    else if(modalName.value === 'address') {
      data = modalAddressSchema.parse(shop.value);
    }
    else if(modalName.value === 'logo') {
      data = modalLogoSchema.parse(shop.value);
    }
    else if(modalName.value === 'legalNotice' || modalName.value === 'cgu' || modalName.value === 'cgv' || modalName.value === 'rgpd') {
      data = tinymceSchema.parse(shop.value);
    }

    if(!isInit.value) {
      const response = axios.post(`${import.meta.env.VITE_API_BASE_URL}/shop`, data)
      if (response.data) {
        shop.value = shopSchema.parse(response.data);
        isOpen.value = false;
        showNotification('Boutique modifiée avec succès', 'success');
      }

    }
    else{
      const response = await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/shop/${shop.value.id}`, data);
      if (response.data) {
        shop.value = shopSchema.parse(response.data);
        isOpen.value = false;
        showNotification('Boutique modifiée avec succès', 'success');
      }
    }
    if (isOpen.value) {
      showNotification('Erreur lors de la modification de la boutique', 'error');
    }
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(error.errors);
    } else {
      console.error(error);
    }
    showNotification('Erreur lors de la modification de la boutique', 'error');
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

.shop-details {
  display: flex;
  justify-content: space-evenly
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
