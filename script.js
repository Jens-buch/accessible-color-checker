const colorInputsContainer = document.getElementById('color-inputs');
const colorRows = [];
const paletteNameInput = document.getElementById('palette-name');
const exportBtn = document.getElementById('export-png');
const matrixContainer = document.getElementById('matrix');
const shareLink = document.getElementById('share-link');

// Create a color input card
function createColorRow(hex = '#000000') {
  const wrapper = document.createElement('div');
  wrapper.className = 'color-card';

  const square = document.createElement('div');
  square.className = 'color-square';
  square.style.backgroundColor = hex;

  const hexInput = document.createElement('input');
  hexInput.type = 'text';
  hexInput.value = hex.toUpperCase();
  hexInput.className = 'hex-input';

  hexInput.addEventListener('input', () => {
    let val = hexInput.value.trim();
    if (/^#?[0-9a-fA-F]{6}$/.test(val)) {
      if (!val.startsWith('#')) val = '#' + val;
      square.style.backgroundColor = val;
    }
  });

  wrapper.appendChild(square);
  wrapper.appendChild(hexInput);
  colorInputsContainer.appendChild(wrapper);

  colorRows.push({ hexInput, square });
}

// Default colors
function initDefaultColors() {
  ['#FFFFFF', '#FEDC2A', '#5A3B5D', '#8B538F', '#C3A3C9'].forEach(hex => createColorRow(hex));
}

// Load palette from URL
function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const values = params.getAll('v');
  const title = params.get('title');
  if (title) paletteNameInput.value = decodeURIComponent(title);
  if (values.length > 0) {
    values.forEach(val => createColorRow('#' + val));
    return true;
  }
  return false;
}

// Contrast functions
function luminance(hex) {
  const rgb = hex.replace('#', '').match(/.{2}/g).map(c => {
    let ch = parseInt(c, 16) / 255;
    return ch <= 0.03928 ? ch / 12.92 : Math.pow((ch + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrast(hex1, hex2) {
  const lum1 = luminance(hex1);
  const lum2 = luminance(hex2);
  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
}

function getRating(ratio) {
  if (ratio >= 7) return 'passAAA';
  if (ratio >= 4.5) return 'passAA';
  return 'fail';
}

// Create table
function buildMatrix(values) {
  const table = document.createElement('table');

  // Header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const emptyTh = document.createElement('th');
  headerRow.appendChild(emptyTh);

  values.forEach(hex => {
    const th = document.createElement('th');
    th.innerHTML = `
      <div class="color-square" style="margin: auto; background-color: ${hex};"></div>
      <div class="hex-label">${hex.toUpperCase()}</div>`;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  values.forEach(bgHex => {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.innerHTML = `
      <div class="color-square" style="margin: auto; background-color: ${bgHex};"></div>
      <div class="hex-label">${bgHex.toUpperCase()}</div>`;
    tr.appendChild(th);

    values.forEach(textHex => {
      const ratio = contrast(bgHex, textHex);
      const rating = getRating(ratio);

const td = document.createElement('td');
// Remove 'cell-box' from the <td>'s classes
td.className = rating; 
td.style.opacity = bgHex.toLowerCase() === textHex.toLowerCase() ? '0' : rating === 'fail' ? '0.3' : '1';

// Add a wrapper <div> with the 'cell-box' class inside the <td>
td.innerHTML = `
  <div class="cell-box">
    <div class="c-square" style="background-color: ${bgHex}; color: ${textHex};">C</div>
    <span>${ratio.toFixed(2)} ${rating.replace('pass', '')}</span>
  </div>`;
tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  return table;
}

// Link creation
function createLink(values, title) {
  const params = new URLSearchParams();
  if (title) params.append('title', encodeURIComponent(title));
  values.forEach(v => params.append('v', v.replace('#', '')));
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

// Main generation logic
function generateMatrix() {
  const values = [];
  const title = paletteNameInput.value.trim();
  if (!title) return alert('Please enter a palette name.');

  colorRows.forEach(row => {
    const hex = row.hexInput.value;
    if (/^#?[0-9a-fA-F]{6}$/.test(hex)) {
      values.push(hex.startsWith('#') ? hex : '#' + hex);
    }
  });

  matrixContainer.innerHTML = '';
  const h2 = document.createElement('h2');
  h2.textContent = title;
  h2.style.textAlign = 'center';
  h2.style.marginBottom = '1rem';
  matrixContainer.appendChild(h2);
  matrixContainer.appendChild(buildMatrix(values));

  shareLink.href = createLink(values, title);
  shareLink.textContent = shareLink.href;
  exportBtn.style.display = 'inline-block';
}

// Export to PNG
exportBtn.addEventListener('click', () => {
  html2canvas(matrixContainer).then(canvas => {
    const link = document.createElement('a');
    link.download = 'color-matrix.png';
    link.href = canvas.toDataURL();
    link.click();
  });
});

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const loaded = loadFromURL();
  if (!loaded) initDefaultColors();
  document.getElementById('add-color').addEventListener('click', () => createColorRow());
  document.getElementById('generate-matrix').addEventListener('click', generateMatrix);
});
