<script setup lang="ts">
import { ref, computed} from 'vue'
import axios from 'axios'
import { z } from 'zod'
import { useRouter } from 'vue-router'

const firstname = ref('')
const lastname = ref('')
const email = ref('')
const password = ref('')
const router = useRouter()

const firstnameSchema = z.string().min(1, 'Le prénom est requis')
const lastnameSchema = z.string().min(1, 'Le nom est requis')
const emailSchema = z.string().email("L'email est invalide")
const passwordSchema = z
  .string()
  .regex(/[a-z]/, {
    message: 'Une lettre minuscule est requise'
  })
  .regex(/[A-Z]/, {
    message: 'Une lettre majuscule est requise'
  })
  .regex(/\d/, {
    message: 'Un chiffre est requis'
  })
  .regex(/[^a-zA-Z0-9]/, {
    message: 'Un caractère spécial est requis'
  })
  .min(12, {
    message: '12 caractères minimum'
  })

const firstnameError = computed(() => {
  const parsedFirstname = firstnameSchema.safeParse(firstname.value)

  if (parsedFirstname.success) {
    return ''
  }

  return parsedFirstname.error.issues[0].message
})

const lastnameError = computed(() => {
  const parsedLastname = lastnameSchema.safeParse(lastname.value)

  if (parsedLastname.success) {
    return ''
  }

  return parsedLastname.error.issues[0].message
})

const emailError = computed(() => {
  const parsedEmail = emailSchema.safeParse(email.value)

  if (parsedEmail.success) {
    return ''
  }

  return parsedEmail.error.issues[0].message
})

const passwordError = computed(() => {
  const parsedPassword = passwordSchema.safeParse(password.value)

  if (parsedPassword.success) {
    return ''
  }

  return parsedPassword.error.issues[0].message
})

const signup = async () => {
  if (
    !firstnameSchema.safeParse(firstname.value).success ||
    !lastnameSchema.safeParse(lastname.value).success ||
    !emailSchema.safeParse(email.value).success ||
    !passwordSchema.safeParse(password.value).success
  ) {
    return
  }
  
  try {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users`, {
      firstname: firstname.value,
      lastname: lastname.value,
      email: email.value,
      password: password.value
    })
    router.push('/login')
  } catch (error) {
    console.log(error)
    alert("Échec de l'inscription")
  }
}

</script>

<template>
  <div class="signup auth-form">
    <h1>Inscription</h1>
    <form @submit.prevent="signup">
      <div>
        <label for="firstname">Prénom</label>
        <input
          type="text"
          placeholder="Nom"
          v-model="firstname"
          autocomplete="given-name"
          required
        />
        <small class="error" v-if="firstnameError && firstname">
          {{ firstnameError }}
        </small>
      </div>
      <div>
        <label for="lastname">Nom</label>
        <input
          type="text"
          placeholder="Nom"
          v-model="lastname"
          autocomplete="family-name"
          required
        />
        <small class="error" v-if="lastnameError && lastname">
          {{ lastnameError }}
        </small>
      </div>
      <div>
        <label for="email">Email</label>
        <input type="email" placeholder="Email" v-model="email" autocomplete="email" required />
        <small class="error" v-if="emailError && email">
          {{ emailError }}
        </small>
      </div>
      <div>
        <label for="password">Mot de passe</label>
        <input
          type="password"
          placeholder="Mot de passe"
          v-model="password"
          autocomplete="new-password"
          required
        />
        <small class="error" v-if="passwordError && password">
          {{ passwordError }}
        </small>
      </div>
      <button type="submit">S'inscrire</button>
    </form>
  </div>
</template>

<style scoped>
.auth-form {
  background-color: white;
  border: 1px solid #ddd;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  margin: 0 auto;
  position: relative;
}
.auth-form h1 {
  text-align: center;
  margin-bottom: 20px;
}
.auth-form input {
  display: block;
  width: calc(100% - 20px);
  margin: 10px auto;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.auth-form button {
  width: calc(100% - 20px);
  margin: 20px auto;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
