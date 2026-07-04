// A dependency-free approximation of "AI smart search" / "AI auto matching".
// Real embeddings (OpenAI/CLIP) need an external API key and network access, which this
// local sandbox doesn't have. This module scores text similarity with token overlap +
// simple synonym awareness so search and match suggestions still feel smart out of the box.
// Swap `scoreTextSimilarity` for a real embeddings call later without touching callers.

const SYNONYMS = {
  bottle: ['flask', 'container'],
  navy: ['blue', 'dark blue'],
  blue: ['navy', 'dark blue'],
  mobile: ['phone', 'smartphone', 'cell'],
  phone: ['mobile', 'smartphone', 'cell'],
  laptop: ['notebook', 'macbook'],
  earphones: ['earbuds', 'headphones'],
  headphones: ['earphones', 'earbuds'],
  wallet: ['purse'],
  specs: ['spectacles', 'glasses'],
  spectacles: ['specs', 'glasses']
};

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function expand(tokens) {
  const set = new Set(tokens);
  tokens.forEach((t) => {
    (SYNONYMS[t] || []).forEach((s) => set.add(s));
  });
  return set;
}

// Returns a 0-1 similarity score between two free-text strings.
function scoreTextSimilarity(a, b) {
  const setA = expand(tokenize(a));
  const setB = expand(tokenize(b));
  if (!setA.size || !setB.size) return 0;
  let overlap = 0;
  setA.forEach((t) => {
    if (setB.has(t)) overlap += 1;
  });
  return overlap / Math.max(setA.size, setB.size);
}

// Combines several weighted fields into one similarity score between a lost item and a found item.
function scoreItemPair(itemA, itemB) {
  const fields = [
    { a: itemA.title, b: itemB.title, weight: 0.3 },
    { a: itemA.category, b: itemB.category, weight: 0.25 },
    { a: itemA.color, b: itemB.color, weight: 0.15 },
    { a: itemA.brand, b: itemB.brand, weight: 0.1 },
    { a: itemA.description, b: itemB.description, weight: 0.15 },
    { a: `${itemA.campusBlock} ${itemA.building}`, b: `${itemB.campusBlock} ${itemB.building}`, weight: 0.05 }
  ];
  let total = 0;
  fields.forEach(({ a, b, weight }) => {
    total += scoreTextSimilarity(a, b) * weight;
  });
  return Math.min(1, total);
}

module.exports = { scoreTextSimilarity, scoreItemPair };
