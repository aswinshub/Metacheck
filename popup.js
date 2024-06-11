document.getElementById('compare').addEventListener('click', async () => {
  const url1 = document.getElementById('url1').value;
  const url2 = document.getElementById('url2').value;

  if (!url1 || !url2) {
    alert('Please enter both URLs.');
    return;
  }

  const results = document.getElementById('results');
  results.innerHTML = 'Comparing...';

  try {
    const metaTags1 = await fetchMetaTags(url1);
    const metaTags2 = await fetchMetaTags(url2);

    const comparison = compareMetaTags(metaTags1, metaTags2);
    displayComparison(comparison);
  } catch (error) {
    results.innerHTML = 'Error fetching meta tags. Please check the URLs and try again.';
  }
});

document.getElementById('downloadExcel').addEventListener('click', () => {
  const comparisonTable = document.querySelector('#results table');
  if (comparisonTable) {
    downloadExcel(comparisonTable);
  } else {
    alert('No comparison data available to download.');
  }
});

async function fetchMetaTags(url) {
  const response = await fetch(url);
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  const metaTags = Array.from(doc.querySelectorAll('meta')).reduce((acc, tag) => {
    const name = tag.getAttribute('name') || tag.getAttribute('property');
    if (name) {
      acc[name] = tag.getAttribute('content');
    }
    return acc;
  }, {});
  return metaTags;
}

function compareMetaTags(tags1, tags2) {
  const keys = new Set([...Object.keys(tags1), ...Object.keys(tags2)]);
  const comparison = {};
  keys.forEach(key => {
    comparison[key] = { url1: tags1[key], url2: tags2[key] };
  });
  return comparison;
}

function displayComparison(comparison) {
  const results = document.getElementById('results');
  results.innerHTML = '';

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  thead.innerHTML = `
    <tr>
      <th>Meta Tag</th>
      <th>URL 1</th>
      <th>URL 2</th>
    </tr>
  `;
  
  for (const [key, { url1, url2 }] of Object.entries(comparison)) {
    const row = document.createElement('tr');
    if (url1 !== url2) {
      row.classList.add('difference');
    }
    row.innerHTML = `
      <td>${key}</td>
      <td>${url1 || 'N/A'}</td>
      <td>${url2 || 'N/A'}</td>
    `;
    tbody.appendChild(row);
  }

  table.appendChild(thead);
  table.appendChild(tbody);
  results.appendChild(table);
}

function downloadExcel(table) {
  const ws = XLSX.utils.table_to_sheet(table);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Meta Tags Comparison');
  XLSX.writeFile(wb, 'meta-tags-comparison.xlsx');
}
