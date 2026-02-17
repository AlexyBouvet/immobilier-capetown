// Cape Town Property Price Map
// Interactive choropleth map with hover functionality

let map;
let geojsonLayer;
let priceData = {};
let selectedLayer = null;

// Business Plan state
let currentNeighborhood = null;
let purchaseType = 'resale'; // 'resale' or 'new'

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
    'southern_suburbs_education': 'Southern Suburbs (Education Belt)',
    'false_bay': 'False Bay Coast',
    'west_coast': 'West Coast (Blouberg)'
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

    <button class="bp-open-btn" onclick="openBPModal('${id}')">
      📊 Open Business Plan
    </button>
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

// ==================== //
// Business Plan Modal  //
// ==================== //

function openBPModal(neighborhoodId) {
  currentNeighborhood = priceData[neighborhoodId];
  if (!currentNeighborhood) return;

  const modal = document.getElementById('bp-modal');
  modal.classList.add('active');

  // Set header
  document.getElementById('bp-title').textContent = currentNeighborhood.name;
  document.getElementById('bp-zone').textContent = getZoneLabel(currentNeighborhood.zone);

  // Reset to resale
  purchaseType = 'resale';
  document.getElementById('btn-resale').classList.add('active');
  document.getElementById('btn-new').classList.remove('active');

  // Calculate
  calculateBP();

  // Add event listener for size input
  document.getElementById('bp-size').addEventListener('input', calculateBP);
}

function closeBPModal() {
  document.getElementById('bp-modal').classList.remove('active');
  currentNeighborhood = null;
}

function setPurchaseType(type) {
  purchaseType = type;
  document.getElementById('btn-resale').classList.toggle('active', type === 'resale');
  document.getElementById('btn-new').classList.toggle('active', type === 'new');
  calculateBP();
}

function calculateBP() {
  if (!currentNeighborhood) return;

  const size = parseInt(document.getElementById('bp-size').value) || 35;
  const data = currentNeighborhood;
  const purchase = data.purchase;
  const rental = data.rental;

  // Purchase calculations
  const pricePerSqm = purchaseType === 'new' ? purchase.new.median : purchase.resale.median;
  const totalPrice = pricePerSqm * size;

  document.getElementById('bp-purchase-price').textContent = formatPrice(totalPrice);
  document.getElementById('bp-price-sqm').textContent = formatPrice(pricePerSqm) + '/m²';

  // ============ LONG-TERM RENTAL ============
  const ltRentPerSqm = rental.longTerm.median;
  const ltMonthlyRent = ltRentPerSqm * size;
  const ltAnnualRevenue = ltMonthlyRent * 12;
  const ltOccupancy = 0.95;
  const ltEffectiveRevenue = ltAnnualRevenue * ltOccupancy;

  // Expenses (annual)
  const ltLevy = size * 45 * 12; // ~R45/m²/month body corporate
  const ltRates = totalPrice * 0.005; // ~0.5% of property value
  const ltInsurance = totalPrice * 0.002; // ~0.2% of property value
  const ltMaintenance = ltEffectiveRevenue * 0.05; // 5% of revenue
  const ltTotalExpenses = ltLevy + ltRates + ltInsurance + ltMaintenance;

  const ltNetIncome = ltEffectiveRevenue - ltTotalExpenses;
  const ltGrossYield = (ltAnnualRevenue / totalPrice) * 100;
  const ltNetYield = (ltNetIncome / totalPrice) * 100;

  document.getElementById('bp-lt-rent').textContent = formatPrice(ltMonthlyRent) + '/mo';
  document.getElementById('bp-lt-annual').textContent = formatPrice(ltAnnualRevenue);
  document.getElementById('bp-lt-occupancy').textContent = '95%';
  document.getElementById('bp-lt-levy').textContent = formatPrice(ltLevy);
  document.getElementById('bp-lt-rates').textContent = formatPrice(ltRates);
  document.getElementById('bp-lt-insurance').textContent = formatPrice(ltInsurance);
  document.getElementById('bp-lt-maintenance').textContent = formatPrice(ltMaintenance);
  document.getElementById('bp-lt-net').textContent = formatPrice(ltNetIncome);
  document.getElementById('bp-lt-gross-yield').textContent = ltGrossYield.toFixed(1) + '%';
  document.getElementById('bp-lt-net-yield').textContent = ltNetYield.toFixed(1) + '%';

  // ============ AIRBNB ============
  const abNightlyRate = rental.airbnb.nightlyRate;
  const abOccupancy = rental.airbnb.occupancy / 100;
  const abNightsPerYear = 365 * abOccupancy;
  const abGrossRevenue = abNightlyRate * abNightsPerYear;

  // Expenses (annual)
  const abFees = abGrossRevenue * 0.15; // Airbnb fees 15%
  const abTurnovers = abNightsPerYear / 3; // Assume 3-night average stay
  const abCleaning = abTurnovers * 400; // R400 per turnover
  const abUtilities = size * 80 * 12; // R80/m²/month for utilities & supplies
  const abManagement = (abGrossRevenue - abFees) * 0.20; // 20% of net for management
  const abTotalExpenses = abFees + abCleaning + abUtilities + abManagement + ltLevy + ltRates + ltInsurance;

  const abNetIncome = abGrossRevenue - abTotalExpenses;
  const abGrossYield = (abGrossRevenue / totalPrice) * 100;
  const abNetYield = (abNetIncome / totalPrice) * 100;

  document.getElementById('bp-ab-nightly').textContent = formatPrice(abNightlyRate);
  document.getElementById('bp-ab-annual').textContent = formatPrice(abGrossRevenue);
  document.getElementById('bp-ab-occupancy').textContent = rental.airbnb.occupancy + '%';
  document.getElementById('bp-ab-fees').textContent = formatPrice(abFees);
  document.getElementById('bp-ab-cleaning').textContent = formatPrice(abCleaning);
  document.getElementById('bp-ab-utilities').textContent = formatPrice(abUtilities);
  document.getElementById('bp-ab-management').textContent = formatPrice(abManagement);
  document.getElementById('bp-ab-net').textContent = formatPrice(abNetIncome);
  document.getElementById('bp-ab-gross-yield').textContent = abGrossYield.toFixed(1) + '%';
  document.getElementById('bp-ab-net-yield').textContent = abNetYield.toFixed(1) + '%';

  // ============ RECOMMENDATION ============
  const recommendation = generateRecommendation(ltNetYield, abNetYield, abOccupancy, data.zone);
  document.getElementById('bp-recommendation').innerHTML = recommendation;
}

function generateRecommendation(ltYield, abYield, abOccupancy, zone) {
  const diff = abYield - ltYield;
  const isKiteZone = zone === 'west_coast';
  const isBeachZone = zone === 'false_bay' || zone === 'west_coast';
  const isPremium = zone.includes('premium');

  let rec = '';

  if (diff > 4) {
    rec = `<strong style="color:#27ae60">Airbnb strongly recommended (+${diff.toFixed(1)}% net yield)</strong><br>`;
    rec += `With ${(abOccupancy * 100).toFixed(0)}% occupancy, Airbnb significantly outperforms long-term rental. `;
  } else if (diff > 1.5) {
    rec = `<strong style="color:#3498db">Airbnb preferred (+${diff.toFixed(1)}% net yield)</strong><br>`;
    rec += `Airbnb offers better returns but requires more management effort. `;
  } else if (diff > 0) {
    rec = `<strong style="color:#f39c12">Similar returns - consider your lifestyle</strong><br>`;
    rec += `Both strategies yield similar returns. Long-term is hands-off, Airbnb requires active management. `;
  } else {
    rec = `<strong style="color:#9b59b6">Long-term rental recommended</strong><br>`;
    rec += `With current occupancy rates, long-term rental is more profitable and much easier to manage. `;
  }

  if (isKiteZone) {
    rec += `<br><br>🪁 <em>Kitesurf zone: Peak season Nov-Mar can command premium nightly rates.</em>`;
  } else if (isBeachZone) {
    rec += `<br><br>🏖️ <em>Beach location: Summer (Dec-Feb) has highest demand and rates.</em>`;
  }

  if (isPremium) {
    rec += `<br><br>💎 <em>Premium area: Focus on quality furnishing for higher nightly rates.</em>`;
  }

  return rec;
}

// Close modal on background click
document.addEventListener('click', function(e) {
  const modal = document.getElementById('bp-modal');
  if (e.target === modal) {
    closeBPModal();
  }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeBPModal();
  }
});
