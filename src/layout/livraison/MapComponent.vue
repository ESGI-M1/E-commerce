<template>
  <div id="map" style="height: 500px;"></div>
</template>

<script setup lang="ts">
import { onMounted, watch, withDefaults } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

const carIcon = L.icon({
  iconUrl: '../../car-icon.png',
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

interface MapProps {  
  startLocation: [number, number];
  endLocation: [number, number];
}

const props = withDefaults(defineProps<MapProps>(), {
  startLocation: [0, 0],
  endLocation: [0, 0]
});

let map: L.Map;
let marker: L.Marker;
let routingControl: L.Routing.Control;

const initializeMap = () => {
  const { startLocation, endLocation } = props;

  if (!startLocation || !endLocation) {
    return;
  }

  map = L.map('map').setView(startLocation, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(startLocation[0], startLocation[1]),
      L.latLng(endLocation[0], endLocation[1])
    ],
    createMarker: function() { return null; }, // Désactiver la création automatique de marqueurs par défaut
    routeWhileDragging: true, // Mettre à jour l'itinéraire pendant que l'utilisateur fait glisser les marqueurs
    lineOptions: {
      styles: [{ color: '#3388ff', opacity: 0.7, weight: 5 }]
    }
  }).addTo(map);

  marker = L.marker(startLocation, { icon: carIcon }).addTo(map).bindPopup("En cours").openPopup();
};

const animateMarkerAlongRoute = () => {
  routingControl.on('routesfound', (e: any) => {
    const route = e.routes[0].coordinates; // Récupérer les coordonnées de l'itinéraire

    let index = 0;

    function moveMarker() {
      if (index < route.length) {
        const currentLatLng = route[index];
        marker.setLatLng(currentLatLng);

        index++;
        setTimeout(moveMarker, 800); // Délai de déplacement entre chaque étape de l'itinéraire
      } else {
        marker.bindPopup("Arrivée").openPopup();
      }
    }

    moveMarker();
  });
};

onMounted(() => {
  initializeMap();
  animateMarkerAlongRoute();
});

watch(() => [props.startLocation, props.endLocation], () => {
  initializeMap();
  animateMarkerAlongRoute();
});
</script>

<style scoped>
#map {
  height: 500px;
}
</style>
