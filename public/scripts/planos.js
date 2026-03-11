// public/scripts/planos.js

document.addEventListener("DOMContentLoaded", function () {
  // Inicializa el mapa centrado en Alicante
  var map = L.map('map').setView([38.3452, -0.4810], 14);

  // Añade el mapa base
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Carga el GeoJSON de la ZBE de Alicante
  fetch('zbe_alicante.geojson')
    .then(response => response.json())
    .then(data => {
      // Añade el GeoJSON al mapa
      L.geoJSON(data, {
        style: function(feature) {
          // Cambia color por anillo si quieres
          if (feature.properties && feature.properties.anillo === 'III') {
            return {color: '#e67e22', fillOpacity: 0.15, weight: 2};
          }
          return {color: '#3388ff', fillOpacity: 0.2, weight: 2};
        },
        onEachFeature: function(feature, layer) {
          if (feature.properties && feature.properties.anillo) {
            layer.bindPopup('<b>Anillo ' + feature.properties.anillo + '</b>');
          }
        }
      }).addTo(map);
    })
    .catch(err => {
      console.error('Error cargando el GeoJSON:', err);
    });
});
