const grid = document.querySelector('#album-grid');
const stats = document.querySelector('#sort-stats');
const buttons = document.querySelectorAll('[data-sort]');
document.querySelector('#album-count').textContent = `(${albums.length})`;

// Merge sort divides the collection into halves and merges them in order.
function mergeSort(items, compare, counter) {
  if (items.length <= 1) return items.slice();
  const middle = Math.floor(items.length / 2);
  const left = mergeSort(items.slice(0, middle), compare, counter);
  const right = mergeSort(items.slice(middle), compare, counter);
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    counter.count++;
    if (compare(left[i], right[j]) <= 0) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return result.concat(left.slice(i), right.slice(j));
}

// Run selection sort on the same input to give the comparison count a baseline.
function selectionSortComparisons(items, compare) {
  const copy = items.slice();
  let count = 0;
  for (let i = 0; i < copy.length - 1; i++) {
    let smallest = i;
    for (let j = i + 1; j < copy.length; j++) {
      count++;
      if (compare(copy[j], copy[smallest]) < 0) smallest = j;
    }
    [copy[i], copy[smallest]] = [copy[smallest], copy[i]];
  }
  return count;
}

const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });
const textCompare = key => (a, b) => collator.compare(a[key] || '', b[key] || '');
// Missing dates go last; ISO dates sort chronologically as strings.
const dateCompare = (key, descending) => (a, b) => {
  if (!a[key] || !b[key]) return a[key] ? -1 : b[key] ? 1 : 0;
  return descending ? b[key].localeCompare(a[key]) : a[key].localeCompare(b[key]);
};
const comparators = {
  title: textCompare('title'),
  artist: textCompare('artist'),
  added: dateCompare('added', true),
  release: dateCompare('release', false)
};

function render(items) {
  const fragment = document.createDocumentFragment();
  for (const album of items) {
    const card = document.createElement('article');
    card.className = 'album-card';
    const img = document.createElement('img');
    img.className = 'cover';
    img.src = album.image;
    img.alt = '';
    img.loading = 'lazy';
    const title = document.createElement('h3');
    title.textContent = album.title;
    const artist = document.createElement('p');
    artist.textContent = album.artist;
    const date = document.createElement('p');
    date.className = 'date';
    date.textContent = `Released ${album.release || 'unknown'} · Saved ${album.added ? album.added.slice(0, 10) : 'unknown'}`;
    card.append(img, title, artist, date);
    fragment.append(card);
  }
  grid.replaceChildren(fragment);
}

function changeSort(sort) {
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.sort === sort)));
  if (sort === 'original') {
    render(albums);
    stats.textContent = 'Original export order. Choose a sort to compare merge sort with selection sort.';
    return;
  }
  const counter = { count: 0 };
  const sorted = mergeSort(albums, comparators[sort], counter);
  const baseline = selectionSortComparisons(albums, comparators[sort]);
  render(sorted);
  stats.textContent = `For ${albums.length} albums: merge sort made ${counter.count.toLocaleString()} comparisons; selection sort made ${baseline.toLocaleString()}. Both sort the same original list.`;
}
buttons.forEach(button => button.addEventListener('click', () => changeSort(button.dataset.sort)));
render(albums);
