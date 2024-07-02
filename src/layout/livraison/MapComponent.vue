<template>
    <div id="map" style="height: 500px;"></div>
  </template>
  
  <script>
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css'; 
  
  export default {
    name: 'MapComponent',
    mounted() {
      // Initialiser la carte dans le cycle de vie `mounted` pour s'assurer que le DOM est prêt
      var map = L.map('map').setView([48.8566, 2.3522], 13); // Coordonnées de Paris
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
  
      // Fonction pour ajouter un marqueur de colis
      function addPackageMarker(lat, lon, message) {
        L.marker([lat, lon]).addTo(map)
          .bindPopup(message)
          .openPopup();
      }
  
      addPackageMarker(48.8566, 2.3522, "Votre colis est arrivé sur notre site de distribution à Paris");
    }
  };
  </script>
  
  <style scoped>
  #map {
    height: 1000px;
  }
  </style>
  