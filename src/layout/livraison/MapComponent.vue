<template>
  <div id="map" style="height: 500px; position: relative;">
    <div id="map-click-blocker" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: transparent; z-index: 1000; display: none;"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, withDefaults, ref } from 'vue';
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
const isAnimating = ref(false);

const initializeMap = () => {
  const { startLocation, endLocation } = props;

  if (!startLocation || !endLocation) {
    return;
  }

  if (!map) {
    map = L.map('map').setView(startLocation, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  } else {
    map.setView(startLocation, 13);
  }

  if (routingControl) {
    map.removeControl(routingControl);
  }

  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(startLocation[0], startLocation[1]),
      L.latLng(endLocation[0], endLocation[1])
    ],
    createMarker: function() { return null; },
    routeWhileDragging: false,
    lineOptions: {
      styles: [{ color: '#3388ff', opacity: 0.7, weight: 5 }]
    }
  }).addTo(map);

  if (marker) {
    marker.setLatLng(startLocation);
  } else {
    marker = L.marker(startLocation, { icon: carIcon }).addTo(map).bindPopup("En cours").openPopup();
  }
};

const animateMarkerAlongRoute = () => {
  if (isAnimating.value) {
    return;
  }

  isAnimating.value = true;
  document.getElementById('map-click-blocker')!.style.display = 'block';

  routingControl.on('routesfound', (e: any) => {
    const route = e.routes[0].coordinates;

    let index = 0;

    function moveMarker() {
      if (index < route.length) {
        const currentLatLng = route[index];
        marker.setLatLng(currentLatLng);

        index++;
        setTimeout(moveMarker, 800);
      } else {
        marker.bindPopup("Arrivée").openPopup();
        isAnimating.value = false;
        document.getElementById('map-click-blocker')!.style.display = 'none';
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
  if (!isAnimating.value) {
    initializeMap();
    animateMarkerAlongRoute();
  }
});
</script>


<style scoped>
#map {
  height: 500px;
}
</style>
