<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-column">
        <h3>Informations</h3>
        <ul>
          {{ shopStore.name }}
          <li><RouterLink :to="{ name: 'Page', params: { slug: 'cgu' } }">Conditions générales d'utilisation</RouterLink></li>
          <li><RouterLink :to="{ name: 'Page', params: { slug: 'cgv' } }">Conditions générales de vente</RouterLink></li>
          <li><RouterLink :to="{ name: 'Page', params: { slug: 'legalNotice' } }">Mentions légales</RouterLink></li>
          <li><RouterLink :to="{ name: 'Page', params: { slug: 'rgpd' } }">Politique de confidentialité</RouterLink></li>
        </ul>
      </div>

      <div class="footer-column">
        <h3>Contact</h3>
        <ul>
          <li><a href="#">Nous contacter</a></li>
          <li>{{ shopStore.street }}</li>
          <li>{{ shopStore.postalCode }} {{ shopStore.city }}</li>
          <li>{{ shopStore.phone }}</li>
          <li>{{ shopStore.email }}</li>
        </ul>
      </div>

      <div class="footer-column">
        <h3>Newsletter</h3>
        <p>Recevez nos dernières nouvelles directement dans votre boîte de réception.</p>
        <form class="newsletter-form">
          <input type="email" placeholder="Votre adresse e-mail" required>
          <button type="submit">S'inscrire</button>
        </form>
      </div>


    </div>

    <!-- Mention légale -->
    <div class="footer-bottom">
      <p>&copy; 2024 {{ shopStore.name }}. Tous droits réservés.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useShopStore } from '@/store/shop'

  const shopStore = useShopStore()

  
  onMounted(() => {
    shopStore.fetchShop()
  })

</script>

<style scoped>
  /* Styles pour le footer */
  .footer {
    background-color: #f8f9fa;
    padding: 20px 0;
    text-align: center;
    font-size: 14px;
  }

  .footer-content {
    display: flex;
    justify-content: space-around;
    max-width: 1200px;
    margin: 0 auto;
  }

  .footer-column {
    flex: 1;
    margin-bottom: 20px;
    padding: 0 10px;
  }

  .footer-column h3 {
    font-size: 16px;
    margin-bottom: 10px;
  }

  .footer-column ul {
    list-style-type: none;
    padding: 0;
  }

  .footer-column ul li {
    margin-bottom: 8px;
  }

  .newsletter-form {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
  }

  .newsletter-form input[type="email"] {
    width: 250px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  }

  .newsletter-form button {
    background-color: #007bff;
    color: #fff;
    border: none;
    padding: 8px 20px;
    margin-left: 10px;
    cursor: pointer;
    border-radius: 4px;
    font-size: 14px;
  }

  .newsletter-form button:hover {
    background-color: #0056b3;
  }

  .footer-bottom {
    margin-top: 20px;
    color: #666;
  }
</style>
