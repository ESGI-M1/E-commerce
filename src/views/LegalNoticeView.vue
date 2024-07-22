<script setup lang="ts">

</script>

<template>
  <div>
    <div class="legalNotice-container">
      <div>
        <h1>Mentions légales</h1>
      </div>
      <div>
        <p>Nous sommes heureux de vous accueillir sur notre présent site
          <a href="/">https://ecommerce.zorglux.com/.</a>
        </p>
        <p>Avant de parcourir notre site, nous souhaitons vous informer sur divers sujets:</p>

        <div class="article-container">
          <h2>Responsable du site:</h2>
          <ul>
            <li><b>Nom :</b> Rabus</li>
            <li><b>Prenom :</b> Jules</li>
            <li><b>Adresse :</b> 123 Rue du moulin</li>
            <li><b>Telephone :</b> +33612345678</li>
            <li><b>Email :</b> jules200204@gmail.com</li>
          </ul>
        </div>

        <div class="article-container">
          <h2>Hébergement du site:</h2>
          <ul>
            <li><b>Nom de l'hébergeur :</b> DigitalOcean</li>
            <li><b>Localisation du serveur :</b> Frankfurt, Allemagne.</li>
            <li><b>Site web :</b> <a href="https://www.digitalocean.com/">https://www.digitalocean.com/</a></li>
          </ul>
        </div>

        <div class="article-container">
          <h2>Propriété intellectuelle :</h2>
          <p>
            L'ensemble du contenu de notre site incluant de façon non limitative,
            les graphismes, images, textes, vidéos, animations, sons, logos,
            gifs et icônes ainsi que leur mise en forme sont de notre propriété exclusives,
            à l'exception des marques, logos ou contenus appartenant à d'autres
            sociétés partenaires ou auteurs.
          </p>
        </div>

        <div class="article-container">
          <h2>Données personnelles :</h2>
          <p>
            Conformément à la loi Informatique et Libertés du 6 janvier 1978 modifiée,
            et au Règlement Général sur la Protection des Données (RGPD) du 27 avril 2016,
            vous disposez d'un droit d'accès, de rectification, de modification et de
            suppression des données qui vous concernent.
            Vous pouvez exercer ce droit en envoyant un email à l'adresse suivante
            (jules200204@gmail.com).
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>

h1 {
  text-align: center;
  font-size: 30px;
  font-weight: 900;
  margin-bottom: 15px;
}

h2 {
  font-size: 22px;
  font-weight: 600;
}

b {
  font-weight: bold;
}

.legalNotice-container {
  background-color: white;
  max-width: 1000px;
  margin: 20px auto;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  height: fit-content;
  padding: 20px;
  max-height: 65vh;
  overflow: auto;
}

.legalNotice-container p {
   margin-left: 5%;
 }

.article-container {
  margin-top: 20px;
  margin-bottom: 20px;
  margin-left: 5%;
}

.article-container ul {
  list-style: none;
  margin-top: 10px;
}

.article-container p {
  margin-top: 10px;
  margin-left: 3%;
}

</style>