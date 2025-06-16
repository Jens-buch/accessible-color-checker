const colorInputsContainer = document.getElementById('color-inputs');
const paletteNameInput = document.getElementById('palette-name');
const shareLink = document.getElementById('share-link');
const exportBtn = document.getElementById('export-png');
const matrixContainer = document.getElementById('matrix');

const colorRows = [];

function createColorRow(hex = '#000000') {
  const wrapper = document.createElement('div');
  wrapper.className = 'color-card';

  const colorSquare = document.createElement('div');
  colorSquare.className = 'color-square';
  colorSquare.style.backgroundColor = hex;

  const hexInput = document.createElement('input');
  hexInput.type = 'text';
  hexInput.className = 'hex-input';
  hexInput.value = hex.toUpperCase();

  hexInput.addEventListener('input', () => {
    colorSquare.style.backgroundColor = hexInput.value;
  });

  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Remove';
  removeBtn.style.marginTop = '0.5rem';
  removeBtn.onclick = () => {
    wrapper.remove();
    const index = colorRows.findIndex(r => r.hexInput === hexInput);
    if (index !== -1) colorRows.splice(index, 1);
  };

  wrapper.append(colorSquare, hexInput, removeBtn);
  colorInputsContainer.appendChild(wrapper);
  colorRows.push({ hexInput });
}

function initDefaultColors() {
  ['#FFFFFF', '#FEDC2A', '#5A3B5D', '#8B538F', '#C3A3C9'].forEach(c => createColorRow(c));
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const values = params.getAll('v');
  const title = params.get('title');

  if (title && paletteNameInput) {
    paletteNameInput.value = decodeURIComponent(title);
  }

  if (values.length > 0) {
    values.forEach(v => createColorRow(`#${v}`));
    return true;
  }

  return false;
}

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
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'Fail';
}

function buildMatrix(values) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const emptyTh = document.createElement('th');
  headerRow.appendChild(emptyTh);

  values.forEach(v => {
    const th = document.createElement('th');
    th.innerHTML = `<div class="color-square" style="background-color: ${v}"></div><div>${v}</div>`;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  values.forEach((bg, i) => {
    const tr = document.createElement('tr');

    const rowHeader = document.createElement('th');
    rowHeader.innerHTML = `<div class="color-square" style="background-color: ${bg}"></div><div>${bg}</div>`;
    tr.appendChild(rowHeader);

    values.forEach((fg, j) => {
      const td = document.createElement('td');
      const ratio = contrast(bg, fg);
      const rating = getRating(ratio);

      const cell = document.createElement('div');
      cell.className = 'cell-box';
      cell.style.opacity = (bg.toLowerCase() === fg.toLowerCase()) ? '0' : (rating === 'Fail' ? '0.3' : '1');

      const colorBox = document.createElement('div');
      colorBox.className = 'c-square';
      colorBox.style.backgroundColor = bg;
      colorBox.style.color = fg;
      colorBox.textContent = 'C';

      const label = document.createElement('span');
      label.innerHTML = `${ratio.toFixed(2)} • ${rating}`;

      cell.append(colorBox, label);
      td.appendChild(cell);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  return table;
}

function createLink(values, title) {
  const params = new URLSearchParams();
  if (title) params.append('title', encodeURIComponent(title));
  values.forEach(v => params.append('v', v.replace('#', '')));
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

function generateMatrix() {
  const values = colorRows.map(r => r.hexInput.value);
  const title = paletteNameInput.value.trim();
  matrixContainer.innerHTML = '';

  if (!title) {
    alert('Please enter a palette name.');
    return;
  }

  const h2 = document.createElement('h2');
  h2.textContent = title;
  h2.style.textAlign = 'center';
  matrixContainer.appendChild(h2);

  matrixContainer.appendChild(buildMatrix(values));
  shareLink.href = createLink(values, title);
  shareLink.textContent = shareLink.href;
  exportBtn.style.display = 'inline-block';
}

document.addEventListener('DOMContentLoaded', () => {
  const loaded = loadFromURL();
  if (!loaded) initDefaultColors();
  document.getElementById('add-color').addEventListener('click', () => createColorRow());
  document.getElementById('generate-matrix').addEventListener('click', generateMatrix);

  exportBtn.addEventListener('click', () => {
    html2canvas(matrixContainer).then(canvas => {
      const link = document.createElement('a');
      link.download = 'color-matrix.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  });
});
