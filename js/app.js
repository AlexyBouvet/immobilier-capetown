// Cape Town Property Price Map
// Interactive choropleth map with hover functionality

let map;
let geojsonLayer;
let priceData = {};
let selectedLayer = null;

// Map Configuration
const MAP_CONFIG = {
  center: [-33.92, 18.42],
  zoom: 12,
  minZoom: 10,
  maxZoom: 18
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
    'atlantic_seaboard_premium': 'Atlantic Seaboard (Premium)',
    'atlantic_seaboard_upper': 'Atlantic Seaboard (Upper)',
    'city_bowl': 'City Bowl',
    'city_bowl_upper': 'City Bowl (Upper)',
    'eastern': 'Eastern Suburbs',
    'south_peninsula': 'South Peninsula',
    'southern_suburbs': 'Southern Suburbs',
    'southern_suburbs_premium': 'Southern Suburbs (Premium)',
    'southern_suburbs_education': 'Southern Suburbs (Education Belt)'
  };
  return labels[zone] || zone;
}

// Style function for GeoJSON features
function styleFeature(feature) {
  const id = feature.properties.id;
  const neighborhood = priceData[id];
  const price = neighborhood ? neighborhood.purchase.resale.median : 30000;

  return {
    fillColor: getPriceColor(price),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  };
}

// Highlight feature on hover/touch
function highlightFeature(e) {
  const layer = e.target;

  layer.setStyle({
    weight: 4,
    color: '#2c3e50',
    dashArray: '',
    fillOpacity: 0.85
  });

  layer.bringToFront();
  updateInfoPanel(layer.feature.properties);
}

// Reset highlight when mouse leaves
function resetHighlight(e) {
  if (selectedLayer !== e.target) {
    geojsonLayer.resetStyle(e.target);
  }
  if (!selectedLayer) {
    resetInfoPanel();
  }
}

// Select feature on click
function selectFeature(e) {
  // Reset previous selection
  if (selectedLayer) {
    geojsonLayer.resetStyle(selectedLayer);
  }

  const layer = e.target;
  selectedLayer = layer;

  layer.setStyle({
    weight: 4,
    color: '#2c3e50',
    dashArray: '',
    fillOpacity: 0.85
  });

  layer.bringToFront();
  updateInfoPanel(layer.feature.properties);

  // Smooth zoom to feature
  map.fitBounds(layer.getBounds(), {
    padding: [80, 80],
    maxZoom: 15,
    animate: true,
    duration: 0.5
  });
}

// Event handlers for each feature
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: selectFeature
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
  const purchase = data.purchase;
  const rental = data.rental;

  // Calculate gross yield (annual long-term rental / purchase price * 100)
  const annualRental = rental.longTerm.median * 12;
  const grossYield = ((annualRental / purchase.resale.median) * 100).toFixed(1);

  priceInfo.innerHTML = `
    <h3>${data.name}</h3>

    <div class="section-title">Purchase Price (per m²)</div>
    <div class="price-grid">
      <div class="price-section">
        <h4>New Development</h4>
        <p class="price-range new">
          ${formatPrice(purchase.new.min)} - ${formatPrice(purchase.new.max)}
        </p>
        <p class="price-median">Median: ${formatPrice(purchase.new.median)}</p>
      </div>
      <div class="price-section">
        <h4>Resale</h4>
        <p class="price-range resale">
          ${formatPrice(purchase.resale.min)} - ${formatPrice(purchase.resale.max)}
        </p>
        <p class="price-median">Median: ${formatPrice(purchase.resale.median)}</p>
      </div>
    </div>

    <div class="section-title">Rental (per m²/month)</div>
    <div class="price-grid">
      <div class="price-section">
        <h4>Long-Term</h4>
        <p class="price-range rental-long">${formatPrice(rental.longTerm.median)}</p>
        <p class="price-median">${formatPrice(rental.longTerm.min)} - ${formatPrice(rental.longTerm.max)}</p>
      </div>
      <div class="price-section">
        <h4>Short-Term</h4>
        <p class="price-range rental-short">${formatPrice(rental.shortTerm.median)}</p>
        <p class="price-median">${formatPrice(rental.shortTerm.min)} - ${formatPrice(rental.shortTerm.max)}</p>
      </div>
    </div>

    <div class="section-title">Airbnb Estimate</div>
    <div class="airbnb-section">
      <div class="airbnb-stat">
        <span class="airbnb-label">Nightly Rate</span>
        <span class="airbnb-value">${formatPrice(rental.airbnb.nightlyRate)}</span>
      </div>
      <div class="airbnb-stat">
        <span class="airbnb-label">Occupancy</span>
        <span class="airbnb-value">${rental.airbnb.occupancy}%</span>
      </div>
      <div class="airbnb-stat">
        <span class="airbnb-label">Monthly Revenue</span>
        <span class="airbnb-value highlight">${formatPrice(rental.airbnb.monthlyRevenue)}</span>
      </div>
    </div>

    <div class="yield-badge">
      <span>Gross Yield: ${grossYield}%</span>
    </div>
    <span class="zone-badge">${getZoneLabel(data.zone)}</span>
  `;

  document.querySelector('.info-panel .instruction').style.display = 'none';
  document.getElementById('price-info').style.display = 'block';
}

// Reset info panel to default state
function resetInfoPanel() {
  document.getElementById('price-info').style.display = 'none';
  document.querySelector('.info-panel .instruction').style.display = 'block';
}

// Close selection when clicking on map (not on a feature)
function closeSelection() {
  if (selectedLayer) {
    geojsonLayer.resetStyle(selectedLayer);
    selectedLayer = null;
    resetInfoPanel();
  }
}

// Initialize the map
async function initMap() {
  // Create map with no default markers
  map = L.map('map', {
    center: MAP_CONFIG.center,
    zoom: MAP_CONFIG.zoom,
    minZoom: MAP_CONFIG.minZoom,
    maxZoom: MAP_CONFIG.maxZoom,
    zoomControl: true,
    attributionControl: true
  });

  // Add base tile layer (CartoDB Positron No Labels for cleaner look)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  // Add labels layer on top (separate layer so polygons go between)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 20,
    pane: 'shadowPane' // Put labels below polygons
  }).addTo(map);

  // Click on map to deselect
  map.on('click', function(e) {
    if (e.originalEvent.target === map.getContainer().querySelector('.leaflet-tile-pane') ||
        e.originalEvent.target.classList.contains('leaflet-tile')) {
      closeSelection();
    }
  });

  // Load data
  try {
    const [geojsonResponse, pricesResponse] = await Promise.all([
      fetch('data/neighborhoods.geojson'),
      fetch('data/prices.json')
    ]);

    const geojson = await geojsonResponse.json();
    const prices = await pricesResponse.json();

    priceData = prices.neighborhoods;

    // Add GeoJSON layer (no point markers, only polygons)
    geojsonLayer = L.geoJSON(geojson, {
      style: styleFeature,
      onEachFeature: onEachFeature,
      pointToLayer: function(feature, latlng) {
        // Don't render point features - only polygons
        return null;
      },
      filter: function(feature) {
        // Only include Polygon and MultiPolygon geometries
        return feature.geometry.type === 'Polygon' ||
               feature.geometry.type === 'MultiPolygon';
      }
    }).addTo(map);

    // Fit map to boundaries
    map.fitBounds(geojsonLayer.getBounds(), { padding: [30, 30] });

    console.log('Map initialized with', geojson.features.length, 'neighborhoods');
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initMap);
