// Cape Town Property Price Map
// Interactive choropleth map with hover functionality

let map;
let geojsonLayer;
let priceData = {};
let selectedLayer = null;

// Business Plan state
let currentNeighborhood = null;
let purchaseType = 'resale'; // 'resale' or 'new'

// BP preferences persistence
const BP_STORAGE_KEY = 'bp-preferences';
function saveBPPreferences() {
  const prefs = {
    size: document.getElementById('bp-size').value,
    appreciation: document.getElementById('bp-appreciation').value,
    rentIncrease: document.getElementById('bp-rent-increase').value,
    ltv: document.getElementById('bp-ltv').value,
    rate: document.getElementById('bp-rate').value
  };
  localStorage.setItem(BP_STORAGE_KEY, JSON.stringify(prefs));
}
function restoreBPPreferences() {
  try {
    const prefs = JSON.parse(localStorage.getItem(BP_STORAGE_KEY));
    if (!prefs) return;
    if (prefs.size) document.getElementById('bp-size').value = prefs.size;
    if (prefs.appreciation) document.getElementById('bp-appreciation').value = prefs.appreciation;
    if (prefs.rentIncrease) document.getElementById('bp-rent-increase').value = prefs.rentIncrease;
    if (prefs.ltv) document.getElementById('bp-ltv').value = prefs.ltv;
    if (prefs.rate) document.getElementById('bp-rate').value = prefs.rate;
  } catch (e) {}
}

// EUR/ZAR conversion
const ZAR_EUR_RATE = 0.05;
function formatEur(zarAmount) {
  return '\u20ac' + Math.round(zarAmount * ZAR_EUR_RATE).toLocaleString('fr-FR');
}

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

  // (no panel update on hover - zone info tab removed)
}

// Reset highlight when mouse leaves
function resetHighlight(e) {
  if (selectedLayer !== e.target) {
    geojsonLayer.resetStyle(e.target);
  }
  // (no panel reset on hover - zone info tab removed)
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

  // Switch to All Listings tab and filter by clicked zone
  const zoneId = layer.feature.properties.id;
  const zoneSelect = document.getElementById('filter-zone');
  const hasOption = Array.from(zoneSelect.options).some(opt => opt.value === zoneId);
  zoneSelect.value = hasOption ? zoneId : 'all';

  document.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.main-tab[onclick="showTab(\'all-listings\')"]').classList.add('active');
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('tab-all-listings').classList.add('active');
  populateAllListings();
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

  const purchase = data.purchase;
  const rental = data.rental;

  // Calculate gross yield (annual long-term rental / purchase price * 100)
  const annualRental = rental.longTerm.median * 12;
  const grossYield = ((annualRental / purchase.resale.median) * 100).toFixed(1);

  // Update zone header
  document.getElementById('zone-title').textContent = data.name;
  document.getElementById('zone-badges').innerHTML = `
    <span class="yield-badge">${grossYield}% yield</span>
    <span class="zone-badge">${getZoneLabel(data.zone)}</span>
  `;

  // Hide instruction, show stats
  document.getElementById('zone-stats').innerHTML = '';

  // Build price cards - clean 6-column grid
  document.getElementById('zone-price-info').innerHTML = `
    <div class="price-card">
      <h4>New Dev /m²</h4>
      <div class="price-value">${formatPrice(purchase.new.median)}</div>
      <div class="price-sub">${formatPrice(purchase.new.min)} - ${formatPrice(purchase.new.max)}</div>
    </div>
    <div class="price-card">
      <h4>Resale /m²</h4>
      <div class="price-value">${formatPrice(purchase.resale.median)}</div>
      <div class="price-sub">${formatPrice(purchase.resale.min)} - ${formatPrice(purchase.resale.max)}</div>
    </div>
    <div class="price-card">
      <h4>LT Rent /m²</h4>
      <div class="price-value">${formatPrice(rental.longTerm.median)}</div>
      <div class="price-sub">per month</div>
    </div>
    <div class="price-card">
      <h4>Airbnb /night</h4>
      <div class="price-value">${formatPrice(rental.airbnb.nightlyRate)}</div>
      <div class="price-sub">${rental.airbnb.occupancy}% occupancy</div>
    </div>
    <div class="price-card highlight">
      <h4>AB Monthly</h4>
      <div class="price-value">${formatPrice(rental.airbnb.monthlyRevenue)}</div>
      <div class="price-sub">gross revenue</div>
    </div>
    <div class="price-card action">
      <button class="listing-bp-btn" onclick="openBPModal('${id}')">Simulate ROI →</button>
    </div>
  `;

  // Show contextual listings for this neighborhood
  showZoneListings(id, data.zone);
}

// Reset info panel to default state
function resetInfoPanel() {
  document.getElementById('zone-title').textContent = 'Select a zone on the map';
  document.getElementById('zone-badges').innerHTML = '';
  document.getElementById('zone-stats').innerHTML = '<p class="zone-instruction">Click on a neighborhood in the map to see price data, rental yields, and available listings.</p>';
  document.getElementById('zone-price-info').innerHTML = '';
  document.getElementById('zone-listings').innerHTML = '';
}

// Close selection when clicking on map (not on a feature)
function closeSelection() {
  if (selectedLayer) {
    geojsonLayer.resetStyle(selectedLayer);
    selectedLayer = null;
    document.getElementById('filter-zone').value = 'all';
    filterListings();
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

  // Add light tile layer (CartoDB Positron)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
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

let bpChart = null;
let _bpCleanupListeners = null;

function _addBPListeners(handler) {
  _removeBPListeners();
  const ids = ['bp-size', 'bp-appreciation', 'bp-rent-increase', 'bp-ltv', 'bp-rate'];
  ids.forEach(id => document.getElementById(id).addEventListener('input', handler));
  _bpCleanupListeners = () => ids.forEach(id => document.getElementById(id).removeEventListener('input', handler));
}

function _removeBPListeners() {
  if (_bpCleanupListeners) { _bpCleanupListeners(); _bpCleanupListeners = null; }
}

function openBPModal(neighborhoodId) {
  currentListing = null;
  document.getElementById('bp-listing-cta').style.display = 'none';
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

  // Restore saved preferences then calculate
  restoreBPPreferences();
  calculateBP();

  const bpHandler = () => { saveBPPreferences(); calculateBP(); };
  _addBPListeners(bpHandler);
}

function closeBPModal() {
  document.getElementById('bp-modal').classList.remove('active');
  _removeBPListeners();
  currentNeighborhood = null;
  currentListing = null;
}

function setPurchaseType(type) {
  purchaseType = type;
  document.getElementById('btn-resale').classList.toggle('active', type === 'resale');
  document.getElementById('btn-new').classList.toggle('active', type === 'new');
  if (currentListing) { calculateListingBP(currentListing); } else { calculateBP(); }
}

function calculateBP() {
  if (!currentNeighborhood) return;
  const size = parseInt(document.getElementById('bp-size').value) || 35;
  const pricePerSqm = purchaseType === 'new' ? currentNeighborhood.purchase.new.median : currentNeighborhood.purchase.resale.median;
  const totalPrice = pricePerSqm * size;
  _renderBPModal(totalPrice, size, currentNeighborhood);
}

function _renderBPModal(totalPrice, size, data) {
  const rental = data.rental;
  const pricePerSqm = Math.round(totalPrice / size);

  // Calculate acquisition costs for display
  const transferDutyDisplay = calculateTransferDuty(totalPrice);
  const acquisitionTotal = transferDutyDisplay + 45000;

  document.getElementById('bp-purchase-price').innerHTML = `${formatPrice(totalPrice)} <small style="color:#888;font-weight:400">${formatEur(totalPrice)}</small>`;
  document.getElementById('bp-purchase-price').dataset.tooltip = `${formatPrice(pricePerSqm)}/m² × ${size}m²`;

  document.getElementById('bp-tax-acq-total').textContent = '+' + formatPrice(acquisitionTotal);
  document.getElementById('bp-tax-acq-total').dataset.tooltip = `Transfer Duty: ${formatPrice(transferDutyDisplay)}\nConveyancing: ~R45 000`;

  document.getElementById('bp-price-sqm').textContent = formatPrice(pricePerSqm) + '/m²';
  document.getElementById('bp-price-sqm').dataset.tooltip = `${formatPrice(totalPrice)} / ${size}m²`;

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

  // Mortgage calculation (shared between LT and Airbnb)
  const ltv = parseFloat(document.getElementById('bp-ltv').value) / 100;
  const interestRate = parseFloat(document.getElementById('bp-rate').value) / 100;
  const ltvFinal = isNaN(ltv) ? 0 : ltv;
  const rateFinal = isNaN(interestRate) || interestRate === 0 ? 0.11 : interestRate;
  const loanAmount = totalPrice * ltvFinal;
  const monthlyRate = rateFinal / 12;
  const numPayments = 240; // 20 years
  const monthlyMortgage = loanAmount > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    : 0;
  const annualMortgage = monthlyMortgage * 12;

  const totalInvestment = totalPrice + acquisitionTotal; // purchase + transfer duty + conveyancing
  const ltNetIncomePreTax = ltEffectiveRevenue - ltTotalExpenses - annualMortgage;
  const ltIncomeTax = Math.max(0, ltNetIncomePreTax * 0.25); // 25% effective rate non-residents
  const ltNetIncome = ltNetIncomePreTax - ltIncomeTax;
  const ltGrossYield = (ltAnnualRevenue / totalInvestment) * 100;
  const ltNetYield = (ltNetIncome / totalInvestment) * 100;

  document.getElementById('bp-lt-rent').innerHTML = `${formatPrice(ltMonthlyRent)}/mo <small style="color:#888;font-weight:400">${formatEur(ltMonthlyRent)}</small>`;
  document.getElementById('bp-lt-rent').dataset.tooltip = `${ltRentPerSqm} R/m² × ${size}m² = ${formatPrice(ltMonthlyRent)}/month`;

  document.getElementById('bp-lt-annual').textContent = formatPrice(ltAnnualRevenue);
  document.getElementById('bp-lt-annual').dataset.tooltip = `${formatPrice(ltMonthlyRent)} × 12 months × 95% occ.\n= ${formatPrice(ltEffectiveRevenue)} effective`;

  document.getElementById('bp-lt-levy').textContent = formatPrice(ltLevy);
  document.getElementById('bp-lt-levy').dataset.tooltip = `Body Corporate: R45/m² × ${size}m² × 12\n= ${formatPrice(ltLevy)}/year`;

  document.getElementById('bp-lt-rates').textContent = formatPrice(ltRates + ltInsurance);
  document.getElementById('bp-lt-rates').dataset.tooltip = `Rates: ${formatPrice(totalPrice)} × 0.5% = ${formatPrice(ltRates)}\nInsurance: ${formatPrice(totalPrice)} × 0.2% = ${formatPrice(ltInsurance)}`;

  document.getElementById('bp-lt-maintenance').textContent = formatPrice(ltMaintenance);
  document.getElementById('bp-lt-maintenance').dataset.tooltip = `5% of effective revenue\n${formatPrice(ltEffectiveRevenue)} × 5% = ${formatPrice(ltMaintenance)}`;

  const ltMortgageRow = document.getElementById('bp-lt-mortgage-row');
  if (annualMortgage > 0) {
    ltMortgageRow.style.display = '';
    document.getElementById('bp-lt-mortgage').textContent = formatPrice(annualMortgage);
    document.getElementById('bp-lt-mortgage').dataset.tooltip = `Loan: ${formatPrice(loanAmount)} (${(ltvFinal*100).toFixed(0)}% LTV)\nRate: ${(rateFinal*100).toFixed(1)}% over 20yr\n${formatPrice(Math.round(monthlyMortgage))}/month`;
  } else {
    ltMortgageRow.style.display = 'none';
  }

  document.getElementById('bp-lt-tax').textContent = formatPrice(ltIncomeTax);
  document.getElementById('bp-lt-tax').dataset.tooltip = `Income tax: 25% flat rate (non-residents)\nApplied on net operating income\n${formatPrice(ltNetIncomePreTax)} × 25% = ${formatPrice(ltIncomeTax)}`;

  document.getElementById('bp-lt-net').innerHTML = `${formatPrice(ltNetIncome)} <small style="color:#888;font-weight:400">${formatEur(ltNetIncome)}/yr</small>`;
  document.getElementById('bp-lt-net').dataset.tooltip = `${formatPrice(ltEffectiveRevenue)} revenue\n- ${formatPrice(ltTotalExpenses)} expenses${annualMortgage > 0 ? `\n- ${formatPrice(annualMortgage)} mortgage` : ''}\n= ${formatPrice(ltNetIncome)} net annual`;

  document.getElementById('bp-lt-net-yield').textContent = ltNetYield.toFixed(1) + '%';
  document.getElementById('bp-lt-net-yield').dataset.tooltip = `Net Yield (after tax) = Net Income / Total Investment\n${formatPrice(ltNetIncome)} / ${formatPrice(totalInvestment)}\n(Price ${formatPrice(totalPrice)} + Acquisition ${formatPrice(acquisitionTotal)})\n= ${ltNetYield.toFixed(2)}%`;

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
  const abMaintenance = abGrossRevenue * 0.07; // 7% of revenue (higher wear than LT)
  const abManagement = (abGrossRevenue - abFees) * 0.20; // 20% of net for management
  const abTotalExpenses = abFees + abCleaning + abUtilities + abMaintenance + abManagement + ltLevy + ltRates + ltInsurance;

  const abNetIncomePreTax = abGrossRevenue - abTotalExpenses - annualMortgage;
  const abIncomeTax = Math.max(0, abNetIncomePreTax * 0.25);
  const abNetIncome = abNetIncomePreTax - abIncomeTax;
  const abGrossYield = (abGrossRevenue / totalInvestment) * 100;
  const abNetYield = (abNetIncome / totalInvestment) * 100;

  document.getElementById('bp-ab-nightly').textContent = formatPrice(abNightlyRate);
  document.getElementById('bp-ab-nightly').dataset.tooltip = `Market rate for this area`;

  document.getElementById('bp-ab-annual').textContent = formatPrice(abGrossRevenue);
  document.getElementById('bp-ab-annual').dataset.tooltip = `${formatPrice(abNightlyRate)}/night × 365 days × ${(abOccupancy*100).toFixed(0)}% occ.\n= ${Math.round(abNightsPerYear)} nights/year\n= ${formatPrice(abGrossRevenue)} gross`;

  document.getElementById('bp-ab-occupancy').textContent = rental.airbnb.occupancy;
  document.getElementById('bp-ab-occupancy-header').textContent = rental.airbnb.occupancy + '% occ.';

  document.getElementById('bp-ab-fees').textContent = formatPrice(abFees);
  document.getElementById('bp-ab-fees').dataset.tooltip = `Airbnb platform fee: 15%\n${formatPrice(abGrossRevenue)} × 15% = ${formatPrice(abFees)}`;

  document.getElementById('bp-ab-cleaning').textContent = formatPrice(abCleaning + abUtilities + abMaintenance);
  document.getElementById('bp-ab-cleaning').dataset.tooltip = `Cleaning: R400 × ${Math.round(abTurnovers)} turnovers = ${formatPrice(abCleaning)}\nUtilities: R80/m² × ${size}m² × 12 = ${formatPrice(abUtilities)}\nMaintenance: 7% revenue = ${formatPrice(abMaintenance)}`;

  document.getElementById('bp-ab-management').textContent = formatPrice(abManagement);
  document.getElementById('bp-ab-management').dataset.tooltip = `20% of net (after platform fees)\n(${formatPrice(abGrossRevenue)} - ${formatPrice(abFees)}) × 20%\n= ${formatPrice(abManagement)}`;

  const abMortgageRow = document.getElementById('bp-ab-mortgage-row');
  if (annualMortgage > 0) {
    abMortgageRow.style.display = '';
    document.getElementById('bp-ab-mortgage').textContent = formatPrice(annualMortgage);
    document.getElementById('bp-ab-mortgage').dataset.tooltip = `Same loan: ${formatPrice(loanAmount)}\n${formatPrice(Math.round(monthlyMortgage))}/month × 12`;
  } else {
    abMortgageRow.style.display = 'none';
  }

  document.getElementById('bp-ab-tax').textContent = formatPrice(abIncomeTax);
  document.getElementById('bp-ab-tax').dataset.tooltip = `Income tax: 25% flat rate (non-residents)\nApplied on net operating income\n${formatPrice(abNetIncomePreTax)} × 25% = ${formatPrice(abIncomeTax)}`;

  document.getElementById('bp-ab-net').innerHTML = `${formatPrice(abNetIncome)} <small style="color:#888;font-weight:400">${formatEur(abNetIncome)}/yr</small>`;
  document.getElementById('bp-ab-net').dataset.tooltip = `${formatPrice(abGrossRevenue)} gross revenue\n- ${formatPrice(abTotalExpenses)} total expenses${annualMortgage > 0 ? `\n- ${formatPrice(annualMortgage)} mortgage` : ''}\n= ${formatPrice(abNetIncome)} net annual`;

  document.getElementById('bp-ab-net-yield').textContent = abNetYield.toFixed(1) + '%';
  document.getElementById('bp-ab-net-yield').dataset.tooltip = `Net Yield (after tax) = Net Income / Total Investment\n${formatPrice(abNetIncome)} / ${formatPrice(totalInvestment)}\n(Price ${formatPrice(totalPrice)} + Acquisition ${formatPrice(acquisitionTotal)})\n= ${abNetYield.toFixed(2)}%`;

  // ============ RECOMMENDATION ============
  const recommendation = generateRecommendation(ltNetYield, abNetYield, abOccupancy, data.zone);
  document.getElementById('bp-recommendation').innerHTML = recommendation;

  // ============ 10-YEAR PROJECTION ============
  calculateProjection(totalPrice, ltNetIncome, abNetIncome, size);

  // ============ TAXES ============
  calculateTaxes(totalPrice, ltAnnualRevenue, abGrossRevenue);
}

function calculateTransferDuty(price) {
  // South Africa Transfer Duty rates (2024/2025)
  // R0 - R1,210,000: 0%
  // R1,210,001 - R1,663,800: 3% of value above R1,210,000
  // R1,663,801 - R2,329,500: R13,614 + 6% of value above R1,663,800
  // R2,329,501 - R2,994,000: R53,556 + 8% of value above R2,329,500
  // R2,994,001+: R106,716 + 11% of value above R2,994,000
  if (price <= 1210000) return 0;
  if (price <= 1663800) return (price - 1210000) * 0.03;
  if (price <= 2329500) return 13614 + (price - 1663800) * 0.06;
  if (price <= 2994000) return 53556 + (price - 2329500) * 0.08;
  return 106716 + (price - 2994000) * 0.11;
}

function calculateSaleCosts(salePrice, purchasePrice) {
  // Agent commission: 7% + 15% VAT = 8.05%
  const agentComm = salePrice * 0.0805;

  // Capital Gains Tax: 40% inclusion rate × marginal rate (~45% for non-resident)
  // Effective rate: ~18% on the gain
  const capitalGain = salePrice - purchasePrice;
  const cgt = capitalGain > 0 ? capitalGain * 0.18 : 0;

  // Non-resident withholding: 7.5% of sale price
  // This is a PREPAYMENT of CGT, refundable if CGT is less
  // So actual cost is MAX of CGT or minimum withholding
  const withholding = salePrice * 0.075;
  const actualTaxCost = Math.max(cgt, withholding);

  return agentComm + actualTaxCost;
}

function calculateProjection(purchasePrice, ltAnnualNet, abAnnualNet, size) {
  const appreciation = parseFloat(document.getElementById('bp-appreciation').value) / 100 || 0.05;
  const rentIncrease = parseFloat(document.getElementById('bp-rent-increase').value) / 100 || 0.06;
  const ltv = parseFloat(document.getElementById('bp-ltv').value) / 100 || 0;
  const interestRate = parseFloat(document.getElementById('bp-rate').value) / 100 || 0.11;

  // Acquisition costs: Transfer Duty (progressive) + Conveyancing
  // Note: In South Africa, buyer does NOT pay broker fees - seller pays the agent
  const transferDuty = calculateTransferDuty(purchasePrice);
  const conveyancing = 45000;
  const acquisitionCosts = transferDuty + conveyancing;

  // Loan calculation
  const loanAmount = purchasePrice * ltv;
  const equityRequired = purchasePrice + acquisitionCosts - loanAmount;
  const loanTerm = 20; // 20 years
  const monthlyRate = interestRate / 12;
  const numPayments = loanTerm * 12;
  const monthlyPayment = loanAmount > 0 ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1) : 0;
  const annualDebtService = monthlyPayment * 12;

  // FF&E Reserve (3% of Airbnb revenue for furniture replacement)
  const ffEReserve = abAnnualNet > 0 ? abAnnualNet * 0.03 : 0;

  const years = [];
  const ltTotalROI = [];  // Total ROI if sold at each year (cash + appreciation - costs)
  const abTotalROI = [];
  const ltROE = [];  // Return on Equity (annual income / equity)
  const abROE = [];

  // Initial equity investment (not full price if using leverage)
  let ltCashFlow = -equityRequired;
  let abCashFlow = -equityRequired;
  let ltCurrentNet = ltAnnualNet;
  let abCurrentNet = abAnnualNet - ffEReserve; // Subtract FF&E reserve for Airbnb
  let propertyValue = purchasePrice;
  let remainingLoan = loanAmount;

  let ltBreakeven = null;
  let abBreakeven = null;
  let ltSellSignal = null;  // When ROE drops below 7%
  let abSellSignal = null;

  for (let year = 0; year <= 10; year++) {
    years.push(year);

    if (year > 0) {
      // Calculate interest portion of debt service (simplified)
      const interestPortion = remainingLoan * interestRate;
      const principalPortion = annualDebtService - interestPortion;
      remainingLoan = Math.max(0, remainingLoan - principalPortion);

      // Net income after debt service and income tax
      const ltAfterDebt = ltCurrentNet - annualDebtService;
      const abAfterDebt = abCurrentNet - annualDebtService;

      // Apply income tax on positive income only
      const ltAfterTax = ltAfterDebt > 0 ? ltAfterDebt * 0.75 : ltAfterDebt;
      const abAfterTax = abAfterDebt > 0 ? abAfterDebt * 0.75 : abAfterDebt;

      ltCashFlow += ltAfterTax;
      abCashFlow += abAfterTax;

      // Increase rent for next year (with inflation)
      ltCurrentNet *= (1 + rentIncrease);
      abCurrentNet *= (1 + rentIncrease);

      // Property appreciation
      propertyValue *= (1 + appreciation);
    }

    // Calculate equity (property value - remaining loan)
    const currentEquity = propertyValue - remainingLoan;

    // Calculate ROE: Net annual income / Equity (as percentage)
    // Use current year's net income (after tax, after debt service)
    const ltNetForROE = year === 0 ? ltAnnualNet * 0.75 : (ltCurrentNet - annualDebtService) * 0.75;
    const abNetForROE = year === 0 ? (abAnnualNet - ffEReserve) * 0.75 : (abCurrentNet - annualDebtService) * 0.75;

    const ltROEValue = currentEquity > 0 ? (ltNetForROE / currentEquity) * 100 : 0;
    const abROEValue = currentEquity > 0 ? (abNetForROE / currentEquity) * 100 : 0;

    ltROE.push(ltROEValue);
    abROE.push(abROEValue);

    // Check when ROE drops below 7% (sell signal)
    if (ltSellSignal === null && year > 0 && ltROEValue < 7) {
      ltSellSignal = year;
    }
    if (abSellSignal === null && year > 0 && abROEValue < 7) {
      abSellSignal = year;
    }

    // Calculate total position if sold NOW (at this year)
    // Profit = Cash flow so far + (Property value - Remaining Loan - Sale costs)
    // Note: ltCashFlow already includes -equityRequired as initial investment
    const saleCostsNow = calculateSaleCosts(propertyValue, purchasePrice);

    const ltTotalNow = ltCashFlow + propertyValue - remainingLoan - saleCostsNow;
    const abTotalNow = abCashFlow + propertyValue - remainingLoan - saleCostsNow;

    ltTotalROI.push(ltTotalNow);
    abTotalROI.push(abTotalNow);

    // Check break-even (when total ROI becomes positive)
    if (ltBreakeven === null && ltTotalNow >= 0) {
      ltBreakeven = year;
    }
    if (abBreakeven === null && abTotalNow >= 0) {
      abBreakeven = year;
    }
  }

  // Final values (year 10)
  const ltFinalProfit = ltTotalROI[10];
  const abFinalProfit = abTotalROI[10];

  // Update break-even display
  document.getElementById('bp-breakeven-lt').textContent = ltBreakeven !== null ? `Year ${ltBreakeven}` : '> 10 years';
  document.getElementById('bp-breakeven-ab').textContent = abBreakeven !== null ? `Year ${abBreakeven}` : '> 10 years';

  // Update 10-year profit
  document.getElementById('bp-10y-lt-profit').textContent = formatPrice(Math.round(ltFinalProfit));
  document.getElementById('bp-10y-ab-profit').textContent = formatPrice(Math.round(abFinalProfit));

  // Update sell signal (when ROE < 7%)
  const sellLtEl = document.getElementById('bp-sell-lt');
  const sellAbEl = document.getElementById('bp-sell-ab');
  if (sellLtEl) sellLtEl.textContent = ltSellSignal !== null ? `Year ${ltSellSignal}` : '> 10 years';
  if (sellAbEl) sellAbEl.textContent = abSellSignal !== null ? `Year ${abSellSignal}` : '> 10 years';

  // Render chart with TOTAL ROI and ROE
  renderProjectionChart(years, ltTotalROI, abTotalROI, ltROE, abROE);
}

function renderProjectionChart(years, ltData, abData, ltROE, abROE) {
  const ctx = document.getElementById('bp-chart').getContext('2d');

  // Destroy existing chart
  if (bpChart) {
    bpChart.destroy();
  }

  bpChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years.map(y => `Y${y}`),
      datasets: [
        {
          label: 'Long-Term',
          data: ltData,
          borderColor: '#6366F1',
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#6366F1',
          borderWidth: 2,
          yAxisID: 'y'
        },
        {
          label: 'Airbnb',
          data: abData,
          borderColor: '#F97316',
          backgroundColor: 'rgba(249, 115, 22, 0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#F97316',
          borderWidth: 2,
          yAxisID: 'y'
        },
        {
          label: 'Sell @ 7% ROE',
          data: years.map(() => 7),
          borderColor: '#e74c3c',
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false,
          borderWidth: 2,
          yAxisID: 'y1'
        },
        {
          label: 'Break-even',
          data: years.map(() => 0),
          borderColor: '#999',
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false,
          borderWidth: 1,
          yAxisID: 'y'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            font: { size: 11 },
            color: '#666',
            padding: 16,
            filter: function(item) {
              // Hide reference lines from legend
              return item.text !== 'Break-even' && item.text !== 'Sell @ 7% ROE';
            }
          }
        },
        tooltip: {
          backgroundColor: '#fff',
          borderColor: '#e0e0e0',
          borderWidth: 1,
          titleColor: '#1a1a1a',
          bodyColor: '#666',
          padding: 12,
          callbacks: {
            label: function(context) {
              if (context.dataset.yAxisID === 'y1') {
                return context.dataset.label + ': ' + context.raw + '%';
              }
              if (context.dataset.label === 'Break-even') return null;
              return context.dataset.label + ': ' + formatPrice(Math.round(context.raw));
            }
          }
        }
      },
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          ticks: {
            callback: function(value) {
              return 'R' + (value / 1000).toFixed(0) + 'k';
            },
            font: { size: 10 },
            color: '#999'
          },
          grid: {
            color: '#f0f0f0'
          }
        },
        y1: {
          type: 'linear',
          position: 'right',
          min: 0,
          max: 15,
          ticks: {
            callback: function(value) {
              return value + '%';
            },
            font: { size: 10 },
            color: '#e74c3c',
            stepSize: 5
          },
          grid: {
            display: false
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: { size: 10 },
            color: '#999'
          }
        }
      }
    }
  });
}

function calculateTaxes(purchasePrice, ltAnnualRevenue, abGrossRevenue) {
  // Transfer duty calculation (2024/2025 rates)
  let transferDuty = 0;
  if (purchasePrice > 1210000) {
    if (purchasePrice <= 1663800) {
      transferDuty = (purchasePrice - 1210000) * 0.03;
    } else if (purchasePrice <= 2329500) {
      transferDuty = 13614 + (purchasePrice - 1663800) * 0.06;
    } else if (purchasePrice <= 2994000) {
      transferDuty = 53556 + (purchasePrice - 2329500) * 0.08;
    } else {
      transferDuty = 106716 + (purchasePrice - 2994000) * 0.11;
    }
  }

  const conveyancing = 45000;
  const totalAcquisition = transferDuty + conveyancing;

  // Annual taxes
  const municipalRates = purchasePrice * 0.0072;
  const ltIncomeTax = ltAnnualRevenue * 0.25; // Effective rate after deductions
  const abIncomeTax = abGrossRevenue * 0.25;

  // Sale costs (after 10 years with 5% appreciation)
  const futureValue = purchasePrice * Math.pow(1.05, 10);
  const agentComm = futureValue * 0.08; // 7% + VAT
  const capitalGain = futureValue - purchasePrice;
  const cgt = capitalGain * 0.18; // ~18% effective CGT
  const withholding = futureValue * 0.075;

  // Update display
  document.getElementById('bp-tax-transfer').textContent = formatPrice(Math.round(transferDuty));
  document.getElementById('bp-tax-acq-total').textContent = formatPrice(Math.round(totalAcquisition));
  document.getElementById('bp-tax-rates').textContent = formatPrice(Math.round(municipalRates)) + '/yr';
  document.getElementById('bp-tax-income').textContent = formatPrice(Math.round(ltIncomeTax)) + '/yr (LT)';
  document.getElementById('bp-tax-agent').textContent = formatPrice(Math.round(agentComm));
  document.getElementById('bp-tax-cgt').textContent = formatPrice(Math.round(cgt));
  document.getElementById('bp-tax-withhold').textContent = formatPrice(Math.round(withholding));
}

function generateRecommendation(ltYield, abYield, abOccupancy, zone) {
  const diff = abYield - ltYield;
  const isKiteZone = zone === 'west_coast';
  const isBeachZone = zone === 'false_bay' || zone === 'west_coast';
  const isPremium = zone.includes('premium');

  let rec = '';

  if (diff > 4) {
    rec = `<strong style="color:#27ae60">Airbnb strongly recommended (${abYield.toFixed(1)}% net yield vs ${ltYield.toFixed(1)}% LT)</strong><br>`;
    rec += `With ${(abOccupancy * 100).toFixed(0)}% occupancy, Airbnb significantly outperforms long-term rental. `;
  } else if (diff > 1.5) {
    rec = `<strong style="color:#3498db">Airbnb preferred (${abYield.toFixed(1)}% net yield vs ${ltYield.toFixed(1)}% LT)</strong><br>`;
    rec += `Airbnb offers better returns but requires more management effort. `;
  } else if (diff > 0) {
    rec = `<strong style="color:#f39c12">Similar returns - consider your lifestyle</strong><br>`;
    rec += `Both strategies yield similar returns. Long-term is hands-off, Airbnb requires active management. `;
  } else {
    rec = `<strong style="color:#9b59b6">Long-term rental recommended</strong><br>`;
    rec += `With current occupancy rates, long-term rental is more profitable and much easier to manage. `;
  }

  if (isKiteZone) {
    rec += `<br><br><em>Kitesurf zone: Peak season Nov-Mar can command premium nightly rates.</em>`;
  } else if (isBeachZone) {
    rec += `<br><br><em>Beach location: Summer (Dec-Feb) has highest demand and rates.</em>`;
  }

  if (isPremium) {
    rec += `<br><br><em>Premium area: Focus on quality furnishing for higher nightly rates.</em>`;
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

// ==================== //
// Rankings Tab         //
// ==================== //

function showTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.main-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  if (event && event.target) {
    event.target.classList.add('active');
  }

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById('tab-' + tabName).classList.add('active');

  // Calculate rankings when switching to rankings tab
  if (tabName === 'rankings') {
    calculateRankings();
  }

  // Populate all listings when switching to that tab
  if (tabName === 'all-listings') {
    populateAllListings();
  }

  // Populate top picks when switching to that tab
  if (tabName === 'top-picks') {
    populateTopPicks();
  }
}

function populateTopPicks() {
  const container = document.getElementById('top-picks-grid');
  if (!container || !listingsData || listingsData.length === 0) return;

  // Start with manually curated favorites
  let picks = listingsData.filter(l => l.favorite);

  // If fewer than 4 favorites, fill up with best yields
  if (picks.length < 4) {
    const favoriteIds = new Set(picks.map(l => l.id));
    const rest = listingsData
      .filter(l => !favoriteIds.has(l.id))
      .sort((a, b) => {
        const yA = calculateListingYields(a, priceData[a.neighborhood]);
        const yB = calculateListingYields(b, priceData[b.neighborhood]);
        return (yB ? yB.bestYield : -999) - (yA ? yA.bestYield : -999);
      });
    picks = [...picks, ...rest.slice(0, 6 - picks.length)];
  }

  // Sort picks by best yield descending
  picks.sort((a, b) => {
    const yA = calculateListingYields(a, priceData[a.neighborhood]);
    const yB = calculateListingYields(b, priceData[b.neighborhood]);
    return (yB ? yB.bestYield : -999) - (yA ? yA.bestYield : -999);
  });

  container.innerHTML = picks.map(listing => {
    const neighborhood = priceData[listing.neighborhood];
    return createListingCard(listing, neighborhood);
  }).join('');
}

function populateAllListings() {
  const container = document.getElementById('all-listings-grid');
  if (!container || !listingsData || listingsData.length === 0) return;

  filterListings();
}

function filterListings() {
  const container = document.getElementById('all-listings-grid');
  if (!container || !listingsData) return;

  const zoneFilter = document.getElementById('filter-zone').value;
  const priceFilter = parseInt(document.getElementById('filter-price').value);
  const bedsFilter = document.getElementById('filter-beds').value;

  let filtered = listingsData.filter(listing => {
    if (zoneFilter !== 'all' && listing.neighborhood !== zoneFilter) return false;
    if (listing.price > priceFilter) return false;
    if (bedsFilter !== 'all' && listing.bedrooms !== parseInt(bedsFilter)) return false;
    return true;
  });

  // Sort by best yield (descending) - highest yield first
  filtered.sort((a, b) => {
    const neighborhoodA = priceData[a.neighborhood];
    const neighborhoodB = priceData[b.neighborhood];
    const yieldsA = calculateListingYields(a, neighborhoodA);
    const yieldsB = calculateListingYields(b, neighborhoodB);
    const bestA = yieldsA ? yieldsA.bestYield : -999;
    const bestB = yieldsB ? yieldsB.bestYield : -999;
    return bestB - bestA; // Descending order
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div class="zone-instruction">No listings match your filters.</div>';
    return;
  }

  container.innerHTML = filtered.map(listing => {
    const neighborhood = priceData[listing.neighborhood];
    return createListingCard(listing, neighborhood);
  }).join('');
}

function calculateRankings() {
  if (!priceData || Object.keys(priceData).length === 0) return;

  const size = 35; // 35m² apartment
  const rankings = {
    ltResale: [],
    ltNew: [],
    abResale: [],
    abNew: []
  };

  // Calculate yields for all neighborhoods
  Object.entries(priceData).forEach(([id, data]) => {
    const purchase = data.purchase;
    const rental = data.rental;

    // For each purchase type (resale and new)
    ['resale', 'new'].forEach(purchaseType => {
      const pricePerSqm = purchase[purchaseType].median;
      const totalPrice = pricePerSqm * size;

      // Long-term calculation
      const ltRent = rental.longTerm.median * size;
      const ltAnnual = ltRent * 12 * 0.95; // 95% occupancy
      const ltLevy = size * 45 * 12;
      const ltRates = totalPrice * 0.005;
      const ltInsurance = totalPrice * 0.002;
      const ltMaintenance = ltAnnual * 0.05;
      const ltNet = ltAnnual - ltLevy - ltRates - ltInsurance - ltMaintenance;
      const ltNetYield = (ltNet / totalPrice) * 100;

      // Airbnb calculation
      const abOccupancy = rental.airbnb.occupancy / 100;
      const abNightly = rental.airbnb.nightlyRate;
      const abGross = abNightly * 365 * abOccupancy;
      const abFees = abGross * 0.15;
      const abTurnovers = (365 * abOccupancy) / 3;
      const abCleaning = abTurnovers * 400;
      const abUtilities = size * 80 * 12;
      const abMaintenance = abGross * 0.07;
      const abManagement = (abGross - abFees) * 0.20;
      const abNet = abGross - abFees - abCleaning - abUtilities - abMaintenance - abManagement - ltLevy - ltRates - ltInsurance;
      const abNetYield = (abNet / totalPrice) * 100;

      if (purchaseType === 'resale') {
        rankings.ltResale.push({ name: data.name, id, yield: ltNetYield });
        rankings.abResale.push({ name: data.name, id, yield: abNetYield });
      } else {
        rankings.ltNew.push({ name: data.name, id, yield: ltNetYield });
        rankings.abNew.push({ name: data.name, id, yield: abNetYield });
      }
    });
  });

  // Sort and display
  displayRanking('rank-lt-resale', rankings.ltResale);
  displayRanking('rank-lt-new', rankings.ltNew);
  displayRanking('rank-ab-resale', rankings.abResale);
  displayRanking('rank-ab-new', rankings.abNew);
}

function displayRanking(elementId, data) {
  const sorted = data.sort((a, b) => b.yield - a.yield).slice(0, 5);
  const container = document.getElementById(elementId);

  container.innerHTML = sorted.map((item, index) => `
    <li onclick="highlightNeighborhood('${item.id}')">
      <span class="ranking-name">${item.name}</span>
      <span class="ranking-yield ${index === 0 ? 'top' : ''}">${item.yield.toFixed(1)}%</span>
    </li>
  `).join('');
}

function highlightNeighborhood(id) {
  // Find and click the neighborhood on the map
  geojsonLayer.eachLayer(layer => {
    if (layer.feature.properties.id === id) {
      // Trigger click on this layer
      layer.fire('click');
      // Switch to zone tab
      document.querySelectorAll('.main-tab').forEach(tab => tab.classList.remove('active'));
      document.querySelector('.main-tab').classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById('tab-zone').classList.add('active');
    }
  });
}

// ==================== //
// Contextual Listings  //
// ==================== //

let listingsData = [];
let searchUrls = {};

async function loadListings() {
  try {
    const response = await fetch('data/listings.json');
    const data = await response.json();
    listingsData = data.listings;
    searchUrls = data.searchUrls || {};
    populateAllListings();
  } catch (error) {
    console.error('Error loading listings:', error);
  }
}

// Calculate yields for a listing (returns object with ltNetYield, abNetYield, bestYield)
// IMPORTANT: Must match calculateBP() logic exactly for consistency
function calculateListingYields(listing, neighborhood) {
  if (!neighborhood) return null;

  const size = listing.size;
  const totalPrice = listing.price;
  const rental = neighborhood.rental;

  // ============ LONG-TERM (same as BP) ============
  const ltRentPerSqm = rental.longTerm.median;
  const ltMonthlyRent = ltRentPerSqm * size;
  const ltAnnualRevenue = ltMonthlyRent * 12;
  const ltOccupancy = 0.95; // 95% occupancy
  const ltEffectiveRevenue = ltAnnualRevenue * ltOccupancy;

  // Expenses (annual)
  const ltLevy = size * 45 * 12;
  const ltRates = totalPrice * 0.005;
  const ltInsurance = totalPrice * 0.002;
  const ltMaintenance = ltEffectiveRevenue * 0.05;
  const ltTotalExpenses = ltLevy + ltRates + ltInsurance + ltMaintenance;

  // Acquisition costs + total investment (match _renderBPModal)
  const transferDuty = calculateTransferDuty(totalPrice);
  const acquisitionTotal = transferDuty + 45000;
  const totalInvestment = totalPrice + acquisitionTotal;

  const ltNetIncomePreTax = ltEffectiveRevenue - ltTotalExpenses;
  const ltIncomeTax = Math.max(0, ltNetIncomePreTax * 0.25);
  const ltNetIncome = ltNetIncomePreTax - ltIncomeTax;
  const ltNetYield = (ltNetIncome / totalInvestment) * 100;

  // ============ AIRBNB (same as BP) ============
  const abNightlyRate = rental.airbnb.nightlyRate;
  const abOccupancy = rental.airbnb.occupancy / 100;
  const abNightsPerYear = 365 * abOccupancy;
  const abGrossRevenue = abNightlyRate * abNightsPerYear;

  // Expenses (annual)
  const abFees = abGrossRevenue * 0.15;
  const abTurnovers = abNightsPerYear / 3;
  const abCleaning = abTurnovers * 400;
  const abUtilities = size * 80 * 12;
  const abMaintenance = abGrossRevenue * 0.07; // 7% of revenue (higher wear than LT)
  const abManagement = (abGrossRevenue - abFees) * 0.20;
  const abTotalExpenses = abFees + abCleaning + abUtilities + abMaintenance + abManagement + ltLevy + ltRates + ltInsurance;

  const abNetIncomePreTax = abGrossRevenue - abTotalExpenses;
  const abIncomeTax = Math.max(0, abNetIncomePreTax * 0.25);
  const abNetIncome = abNetIncomePreTax - abIncomeTax;
  const abNetYield = (abNetIncome / totalInvestment) * 100;

  const bestYield = Math.max(ltNetYield, abNetYield);

  return { ltNetYield, abNetYield, bestYield };
}

// Create a listing card HTML - Clean, minimal design
function createListingCard(listing, neighborhood) {
  const pricePerSqm = Math.round(listing.price / listing.size);

  // Favorite badge (inline with title)
  const favoriteBadge = listing.favorite ? `<span class="listing-favorite-badge">TOP PICK</span>` : '';

  // Calculate yields for compact display
  let yieldHtml = '';
  const yields = calculateListingYields(listing, neighborhood);
  if (yields) {
    const ltNetYield = yields.ltNetYield.toFixed(1);
    const abNetYield = yields.abNetYield.toFixed(1);

    const bestStrategy = yields.abNetYield > yields.ltNetYield ? 'ab' : 'lt';
    const ltPositive = yields.ltNetYield >= 0;
    const abPositive = yields.abNetYield >= 0;

    yieldHtml = `
      <div class="listing-yields">
        <div class="yield-item ${bestStrategy === 'lt' ? 'best' : ''} ${!ltPositive ? 'negative' : ''}">
          <span class="yield-label">LT</span>
          <span class="yield-value">${ltNetYield}%</span>
        </div>
        <div class="yield-item ${bestStrategy === 'ab' ? 'best' : ''} ${!abPositive ? 'negative' : ''}">
          <span class="yield-label">AB</span>
          <span class="yield-value">${abNetYield}%</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="listing-card ${listing.favorite ? 'favorite' : ''}">
      <div class="listing-header">
        <div class="listing-meta">
          <span class="listing-size">${listing.size}m²</span>
          <span class="listing-beds">${listing.bedrooms === 0 ? 'Studio' : listing.bedrooms + ' bed'}</span>
          ${listing.parking > 0 ? `<span class="listing-parking">P${listing.parking}</span>` : ''}
        </div>
        <div class="listing-price">${formatPrice(listing.price)}</div>
      </div>
      <div class="listing-title">${listing.title}${favoriteBadge}</div>
      <div class="listing-sqm">R${(pricePerSqm / 1000).toFixed(0)}k/m²</div>
      ${yieldHtml}
      <div class="listing-actions">
        <button class="btn-simulate" onclick="openListingBP('${listing.id}')">Simulate →</button>
        <a href="${listing.url}" target="_blank" class="btn-view">View ↗</a>
      </div>
    </div>
  `;
}

function showZoneListings(neighborhoodId, zone) {
  const container = document.getElementById('zone-listings');

  // Filter listings ONLY for this exact neighborhood (no zone fallback)
  let filtered = listingsData.filter(l => l.neighborhood === neighborhoodId);

  // Get the correct search URL
  const searchUrl = searchUrls[neighborhoodId] || searchUrls.cape_town;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="zone-instruction">
        No listings available for this zone.
        <a href="${searchUrl}" target="_blank" style="display:block; margin-top:8px; color:var(--accent);">Search on Private Property</a>
      </div>
    `;
    return;
  }

  // Sort by best yield (descending) - highest yield first
  const neighborhoodData = priceData[neighborhoodId];
  filtered.sort((a, b) => {
    const yieldsA = calculateListingYields(a, neighborhoodData);
    const yieldsB = calculateListingYields(b, neighborhoodData);
    const bestA = yieldsA ? yieldsA.bestYield : -999;
    const bestB = yieldsB ? yieldsB.bestYield : -999;
    return bestB - bestA; // Descending order
  });

  container.innerHTML = filtered.map(listing => {
    const neighborhood = priceData[listing.neighborhood];
    return createListingCard(listing, neighborhood);
  }).join('');
}

// Open BP modal for a specific listing
function openListingBP(listingId) {
  const listing = listingsData.find(l => l.id === listingId);
  if (!listing) return;

  const neighborhood = priceData[listing.neighborhood];
  if (!neighborhood) return;

  // Store listing data for the modal
  currentNeighborhood = neighborhood;
  currentListing = listing;

  const modal = document.getElementById('bp-modal');
  modal.classList.add('active');

  // Set header with listing info
  document.getElementById('bp-title').textContent = listing.title;
  document.getElementById('bp-zone').textContent = `${listing.size}m² - ${formatPrice(listing.price)}`;

  // Restore saved preferences (except size, which is fixed for listings)
  restoreBPPreferences();
  document.getElementById('bp-size').value = listing.size;

  // Determine if it's new or resale based on price per sqm
  const pricePerSqm = listing.price / listing.size;
  const isNew = pricePerSqm >= neighborhood.purchase.new.min * 0.9;
  purchaseType = isNew ? 'new' : 'resale';
  document.getElementById('btn-resale').classList.toggle('active', !isNew);
  document.getElementById('btn-new').classList.toggle('active', isNew);

  // Show CTA if listing has URL
  const ctaDiv = document.getElementById('bp-listing-cta');
  if (listing.url) {
    document.getElementById('bp-listing-url').href = listing.url;
    ctaDiv.style.display = '';
  } else {
    ctaDiv.style.display = 'none';
  }

  // Calculate with listing's actual price
  calculateListingBP(listing);

  const listingHandler = () => { saveBPPreferences(); calculateListingBP(listing); };
  _addBPListeners(listingHandler);
}

function calculateListingBP(listing) {
  if (!currentNeighborhood || !listing) return;
  _renderBPModal(listing.price, listing.size, currentNeighborhood);
}

let currentListing = null;

// JS tooltip - uses position:fixed to escape overflow:hidden containers
(function() {
  const tip = document.createElement('div');
  tip.id = 'js-tooltip';
  tip.style.cssText = 'position:fixed;background:#1a1a1a;color:white;padding:8px 12px;font-size:11px;line-height:1.6;white-space:pre-line;max-width:320px;z-index:9999;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,0.3);pointer-events:none;display:none';
  document.body.appendChild(tip);

  document.addEventListener('mouseover', function(e) {
    const el = e.target.closest('[data-tooltip]');
    if (!el) return;
    tip.textContent = el.dataset.tooltip;
    tip.style.display = 'block';
  });

  document.addEventListener('mousemove', function(e) {
    if (tip.style.display === 'none') return;
    let x = e.clientX + 14, y = e.clientY - 44;
    const r = tip.getBoundingClientRect();
    if (x + r.width > window.innerWidth - 8) x = e.clientX - r.width - 14;
    if (y < 8) y = e.clientY + 14;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  });

  document.addEventListener('mouseout', function(e) {
    if (!e.relatedTarget || !e.relatedTarget.closest('[data-tooltip]')) {
      tip.style.display = 'none';
    }
  });
})();

// Load listings on init
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(loadListings, 500);
});
