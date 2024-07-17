<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
  import axios from 'axios'
  import { z } from 'zod'
import Cookies from 'js-cookie'

  const isAdmin = computed(() => {
    const user = JSON.parse(Cookies.get('USER').slice(2))
    return user.role === 'admin'
  })

  const showModal = ref(false);
  const isEditing = ref(false);

  const newsletters = ref([]);
  const actualNewsLetter = ref({
    title: '',
    content: ''
  });

  const showAddNewsletterModal = () => {
    isEditing.value = false
    actualNewsLetter.value = {
      title: '',
      content: ''
    }
    showModal.value = true
  }

  const newsletterSchema = z.object({
    id: z.number().optional(),
    title: z.string().min(1, 'Le titre de la newsletter est requis'),
    content: z.string().min(1, 'Le contenu de la newsletter est requis'),
  });

  const showEditNewsLetterModal = (newsletter) => {
    isEditing.value = true;
    actualNewsLetter.value = { ...newsletter };
    showModal.value = true;
  }

  const closeModal = () => {
    showModal.value = false;
  }

  const addNewsLetter = async () => {
    try {
      const parsedNewsLetter = newsletterSchema.parse({ ...actualNewsLetter.value });
      const response = await axios.post('http://localhost:3000/newsletters', parsedNewsLetter);
      newsletters.value.push(response.data);
      closeModal();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la newsletter :", error);
    }
  }

  const updateNewsLetter = async () => {
    try {
      const parsedNewsLetter = newsletterSchema.parse({ ...actualNewsLetter.value });
      await axios.patch(`http://localhost:3000/newsletters/${actualNewsLetter.value.id}`, parsedNewsLetter);
      const index = newsletters.value.findIndex((p) => p.id === actualNewsLetter.value.id);
      if (index !== -1) {
        newsletters.value[index] = actualNewsLetter.value;
      }
      closeModal()
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Zod : Erreur lors de la modification de la newsletter :', error.errors);
      } else {
        console.error('Erreur lors de la modification de la newsletter :', error);
      }
    }
  };

  const deleteNewsLetter = async (newsletter) => {
    try {
      await axios.delete(`http://localhost:3000/newsletters/${newsletter.id}`);
      newsletters.value = newsletters.value.filter((p) => p.id !== newsletter.id);
    } catch (error) {
      console.error('Erreur lors de la suppression de la newsletter :', error);
    }
  };

  const fetchNewsLetters = async () => {
    try {
      const response = await axios.get('http://localhost:3000/newsletters');
      newsletters.value = response.data;
    } catch (e) {
      console.error('Erreur lors de la récupération des newsletters :', e);
    }
  };

  onMounted(() => {
    fetchNewsLetters();
  });

</script>

<template>
  <div class="background">
    <div class="container">

      <h1>
        Newsletter
      </h1>

      <div class="text-right">
        <button @click="showAddNewsletterModal" class="btn btn-success" v-if="isAdmin">
          <i class="fa fa-plus"></i> Créer un nouvel article
        </button>
      </div>

      <div v-for="newsletter in newsletters" :key="newsletter.id" class="newsletter-container">
        <div class="newsletter-header">
          <h2>{{ newsletter.title }}</h2>
          <div class="action-container">
            <button @click="showEditNewsLetterModal(newsletter)" class="btn btn-primary" v-if="isAdmin">
              <i class="fa fa-edit"></i>
            </button>
            <button @click="deleteNewsLetter(newsletter)" class="btn btn-danger" v-if="isAdmin">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="newsletter-body">
          {{ newsletter.content }}
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <span class="close" @click="closeModal">&times;</span>
        <h2 v-if="isEditing">Modifier l'article</h2>
        <h2 v-else>Créer un article</h2>
        <form @submit.prevent="isEditing ? updateNewsLetter() : addNewsLetter()">
          <div class="form-group">
            <label for="name">Title</label>
            <input v-model="actualNewsLetter.title" type="text" id="name" required />
          </div>

          <div class="form-group">
            <label for="reference">Content</label>
            <input v-model="actualNewsLetter.content" type="text" id="reference" required />
          </div>

          <div class="buttons">
            <button type="submit" class="btn btn-primary">
              {{ isEditing ? 'Modifier' : 'Créer' }}
            </button>
            <button type="button" class="btn btn-danger" @click="closeModal">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .background {
    height: 90vh;
    display: flex;
    justify-content: center;
  }

  .container {
    background-color: white;
    margin-top: 20px;
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    padding: 20px;
    width: 800px;
    max-height: 800px;
    overflow: scroll;
    height: fit-content;
  }

  .newsletter-container {
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .newsletter-header {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    padding: 20px;
    line-height: normal;
  }

  .newsletter-body {
    padding: 20px;
    text-align: start;
    word-wrap: anywhere;
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
</style>