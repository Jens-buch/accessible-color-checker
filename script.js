const colorInputsContainer = document.getElementById('color-inputs');
const colorRows = [];

function createColorRow(name = '', hex = '#000000') {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex items-center gap-4';

  // Name input
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Color name';
  nameInput.value = name;
  nameInput.className = 'border px-2 py-1 rounded w-40';

  // Native color input
  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.value = hex;
  colorInput.className = 'w-10 h-10 border rounded';

  // Remove button
  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Remove';
  removeBtn.className = 'text-red-600 hover:underline';
  removeBtn.onclick = () => {
    const index = colorRows.findIndex(r => r.name === nameInput && r.color === colorInput);
    if (index !== -1) colorRows.splice(index, 1);
    wrapper.remove();
  };

  wrapper.appendChild(nameInput);
  wrapper.appendChild(colorInput);
  wrapper.appendChild(removeBtn);
  colorInputsContainer.appendChild(wrapper);

  colorRows.push({ name: nameInput, color: colorInput });
}

function initDefaultColors() {
  const defaults = [
    { name: 'White', value: '#FFFFFF' },
    { name: 'Color 2', value: '#FEDC2A' },
    { name: 'Color 3', value: '#5A3B5D' },
    { name: 'Color 4', value: '#8B538F' },
    { name: 'Color 5', value: '#C3A3C9' }
  ];
  defaults.forEach(c => createColorRow(c.name, c.value));
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
  if (ratio >= 7) return 'passAAA';
  if (ratio >= 4.5) return 'passAA';
  return 'fail';
}

function buildMatrix(names, values) {
  const table = document.createElement('table');
  table.className = 'table-auto border-collapse w-full';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const emptyTh = document.createElement('th');
  emptyTh.className = 'p-2';
  headerRow.appendChild(emptyTh);

  names.forEach(name => {
    const th = document.createElement('th');
    th.className = 'p-2 border bg-gray-200';
    th.textContent = name;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  values.forEach((bgValue, rowIdx) => {
    const tr = document.createElement('tr');
    const rowHeader = document.createElement('th');
    rowHeader.className = 'p-2 border bg-gray-200';
    rowHeader.textContent = names[rowIdx];
    tr.appendChild(rowHeader);

    values.forEach((textValue, colIdx) => {
      const td = document.createElement('td');
      td.className = 'p-2 border text-center text-sm text-white';
      td.style.backgroundColor = bgValue;
      td.style.color = textValue;

      const ratio = contrast(bgValue, textValue);
      td.textContent = ratio.toFixed(2);
      td.classList.add(getRating(ratio));

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  return table;
}

function createLink(names, values) {
  const params = new URLSearchParams();
  names.forEach(n => params.append('n', n));
  values.forEach(v => params.append('v', v.replace('#', '')));
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

function generateMatrix() {
  const names = [];
  const values = [];

  colorRows.forEach(row => {
    const name = row.name.value;
    const hex = row.color.value;
    if (name && hex) {
      names.push(name);
      values.push(hex);
    }
  });

  const container = document.getElementById('matrix');
  container.innerHTML = '';
  container.appendChild(buildMatrix(names, values));

  const shareLink = document.getElementById('share-link');
  shareLink.href = createLink(names, values);
  shareLink.textContent = shareLink.href;
}

document.addEventListener('DOMContentLoaded', () => {
  initDefaultColors();
  document.getElementById('add-color').addEventListener('click', () => createColorRow());
});
