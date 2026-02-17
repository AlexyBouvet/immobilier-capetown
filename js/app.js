// Cape Town Property Price Map
// Interactive choropleth map with hover functionality

let map;
let geojsonLayer;
let priceData = {};

// Map Configuration
const MAP_CONFIG = {
  center: [-33.92, 18.42],
  zoom: 13,
  minZoom: 11,
  maxZoom: 17
};

// Color scale based on median resale price
function getPriceColor(price) {
  return price > 140000 ? '#8E44AD' :
         price > 100000 ? '#E74C3C' :
         price > 70000  ? '#E67E22' :
         price > 50000  ? '#F39C12' :
         price > 35000  ? '#F1C40F' :
                          '#2ECC71';
}

// Format price with thousands separator
function formatPrice(num) {
  return 'R' + num.toLocaleString('en-ZA');
}

// Get zone display name
function getZoneLabel(zone) {
  const labels = {
    'atlantic_seaboard': 'Atlantic Seaboard',
    'city_bowl': 'City Bowl',
    'eastern': 'Southern/Eastern',
    'south_peninsula': 'South Peninsula'
  };
  return labels[zone] || zone;
}

// Style function for GeoJSON features
function styleFeature(feature) {
  const id = feature.properties.id;
  const neighborhood = priceData[id];
  const price = neighborhood ? neighborhood.resale.median : 30000;

  return {
    fillColor: getPriceColor(price),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  };
}

// Highlight feature on hover
function highlightFeature(e) {
  const layer = e.target;

  layer.setStyle({
    weight: 4,
    color: '#333',
    dashArray: '',
    fillOpacity: 0.9
  });

  layer.bringToFront();
  updateInfoPanel(layer.feature.properties);
}

// Reset highlight when mouse leaves
function resetHighlight(e) {
  geojsonLayer.resetStyle(e.target);
  resetInfoPanel();
}

// Zoom to feature on click
function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds(), { padding: [50, 50] });
}

// Event handlers for each feature
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}

// Update info panel with neighborhood data
function updateInfoPanel(properties) {
  const id = properties.id;
  const data = priceData[id];

  if (!data) {
    console.warn('No price data for:', id);
    return;
  }

  const priceInfo = document.getElementById('price-info');
  priceInfo.innerHTML = `
    <h3>${data.name}</h3>
    <div class="price-section">
      <h4>New Developments</h4>
      <p class="price-range new">
        ${formatPrice(data.newDevelopment.min)} - ${formatPrice(data.newDevelopment.max)}/m²
      </p>
    </div>
    <div class="price-section">
      <h4>Resale (Second Hand)</h4>
      <p class="price-range resale">
        ${formatPrice(data.resale.min)} - ${formatPrice(data.resale.max)}/m²
      </p>
    </div>
    <span class="zone-badge">${getZoneLabel(data.zone)}</span>
  `;

  document.querySelector('.info-panel .instruction').style.display = 'none';
}

// Reset info panel to default state
function resetInfoPanel() {
  document.getElementById('price-info').innerHTML = '';
  document.querySelector('.info-panel .instruction').style.display = 'block';
}

// Initialize the map
async function initMap() {
  // Create map
  map = L.map('map', {
    center: MAP_CONFIG.center,
    zoom: MAP_CONFIG.zoom,
    minZoom: MAP_CONFIG.minZoom,
    maxZoom: MAP_CONFIG.maxZoom
  });

  // Add base tile layer (CartoDB Positron for clean look)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  // Load data
  try {
    const [geojsonResponse, pricesResponse] = await Promise.all([
      fetch('data/neighborhoods.geojson'),
      fetch('data/prices.json')
    ]);

    const geojson = await geojsonResponse.json();
    const prices = await pricesResponse.json();

    priceData = prices.neighborhoods;

    // Add GeoJSON layer
    geojsonLayer = L.geoJSON(geojson, {
      style: styleFeature,
      onEachFeature: onEachFeature
    }).addTo(map);

    // Fit map to boundaries
    map.fitBounds(geojsonLayer.getBounds(), { padding: [20, 20] });

    console.log('Map initialized with', geojson.features.length, 'neighborhoods');
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initMap);
