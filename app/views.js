// Rendering for the deal finder: deal cards, the detail page, the summary
// strip and the empty state. Pure string building over the DEALS catalogue;
// nothing here touches the network, and the markup it emits is the site's
// visible text, so a revision must keep every emitted string identical
// even while the helpers around it are renamed or split.

// ---------------------------------------------------------------------------
// Small formatting helpers
// ---------------------------------------------------------------------------

// Format a dollar amount the way the site shows it: two decimals, with a
// trailing ".00" dropped, e.g. 149 -> "$149" and 1299.98 -> "$1299.98".
function formatPrice(amount) {
  return "$" + amount.toFixed(2).replace(/\.00$/, "");
}

// Escape the characters that would break out of HTML text or an attribute
// value. Deal fields are our own data, but escaping keeps the markup
// well-formed even for a name containing "&" or a quote.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// The monogram shown on a deal's tile: the first letters of the first two
// words of the product name, upper-cased. Punctuation is stripped first so
// a name like "65-inch ..." contributes "6" rather than a stray character.
function tileMonogram(deal) {
  const words = deal.name.replace(/[^A-Za-z0-9 ]/g, "").split(" ").filter(Boolean);
  const first = words[0] ? words[0][0] : "?";
  const second = words[1] ? words[1][0] : "";
  return (first + second).toUpperCase();
}

// CSS class for a verdict chip. The four verdicts each get their own tone;
// anything unexpected falls back to the quiet "modest" tone.
function verdictTone(verdict) {
  if (verdict === "Record low") return "verdict-record";
  if (verdict === "Strong deal") return "verdict-strong";
  if (verdict === "Solid deal") return "verdict-solid";
  return "verdict-modest";
}

// ---------------------------------------------------------------------------
// Shared fragments used by both the card and the detail page
// ---------------------------------------------------------------------------

// "Store · Category" line, identical on the card and the detail page.
function storeLine(deal) {
  return '<p class="card-store">' + escapeHtml(deal.store) + " &middot; " + escapeHtml(deal.category) + "</p>";
}

// The price row: sale price, struck-through regular price and the red
// discount badge. `large` selects the detail page's bigger variant.
function priceRow(deal, large) {
  const size = large ? " big" : "";
  return (
    '<span class="sale' + size + '">' + formatPrice(deal.sale) + '</span> ' +
    '<span class="regular"><s>' + formatPrice(deal.regular) + "</s></span> " +
    '<span class="pct' + size + '">-' + pctOff(deal) + "%</span>"
  );
}

// The verdict chip ("Record low", "Strong deal", ...).
function verdictChip(deal) {
  return '<p class="card-verdict ' + verdictTone(deal.verdict) + '">' + escapeHtml(deal.verdict) + "</p>";
}

// The amber button that opens the store's own product page in a new tab.
// `cssClass` picks the card or detail styling; `label` is the button text
// without the trailing arrow.
function storeButton(deal, cssClass, label) {
  return (
    '<a class="' + cssClass + '" href="' + escapeHtml(deal.url) + '" target="_blank" rel="noopener">' +
    label + " &nearr;</a>"
  );
}

// ---------------------------------------------------------------------------
// Deal card (the grid)
// ---------------------------------------------------------------------------

// The dark tile at the top of a card: monogram on the left, category on the
// right, and the whole tile links to the deal's own page.
function cardTile(deal) {
  return (
    '<a class="card-tile" href="#/deal/' + deal.id + '" aria-label="' + escapeHtml(deal.name) + '">' +
    '<span class="tile-letters">' + escapeHtml(tileMonogram(deal)) + "</span>" +
    '<span class="tile-cat">' + escapeHtml(deal.category) + "</span>" +
    "</a>"
  );
}

function cardHtml(deal) {
  const saved = amountSaved(deal);
  return (
    '<article class="card">' +
    cardTile(deal) +
    '<div class="card-body">' +
    storeLine(deal) +
    '<h3 class="card-name"><a href="#/deal/' + deal.id + '">' + escapeHtml(deal.name) + "</a></h3>" +
    '<p class="card-price">' + priceRow(deal, false) + "</p>" +
    '<p class="card-save">You save ' + formatPrice(saved) + "</p>" +
    verdictChip(deal) +
    '<p class="card-checked">Checked ' + escapeHtml(deal.checked) + " &middot; " + escapeHtml(deal.source) + "</p>" +
    storeButton(deal, "card-link", "View at " + escapeHtml(deal.store)) +
    "</div></article>"
  );
}

// ---------------------------------------------------------------------------
// Detail page (one deal)
// ---------------------------------------------------------------------------

function detailHtml(deal) {
  const pct = pctOff(deal);
  const saved = amountSaved(deal);
  return (
    '<article class="detail">' +
    '<p class="detail-back"><a href="#/">&larr; All deals</a></p>' +
    '<div class="detail-top">' +
    '<div class="detail-tile"><span class="tile-letters big">' + escapeHtml(tileMonogram(deal)) + "</span></div>" +
    '<div class="detail-head">' +
    storeLine(deal) +
    "<h2>" + escapeHtml(deal.name) + "</h2>" +
    '<p class="detail-price">' + priceRow(deal, true) + "</p>" +
    '<p class="card-save">You save ' + formatPrice(saved) + " (" + pct + "% off the usual price)</p>" +
    "</div></div>" +
    '<div class="detail-verdict ' + verdictTone(deal.verdict) + '">' +
    "<h3>Is it really a deal? " + escapeHtml(deal.verdict) + "</h3>" +
    "<p>" + escapeHtml(deal.evidence) + "</p></div>" +
    '<p class="detail-note">' + escapeHtml(deal.note) + "</p>" +
    '<p class="detail-meta">Price checked ' + escapeHtml(deal.checked) + " on the " + escapeHtml(deal.source) +
    ". Prices move during Black Friday week, so confirm the price at the store before you buy.</p>" +
    storeButton(deal, "detail-link", "View this product at " + escapeHtml(deal.store)) +
    "</article>"
  );
}

// ---------------------------------------------------------------------------
// Summary strip and empty states
// ---------------------------------------------------------------------------

// The five-number strip above the grid: deal count, total savings, average
// discount, store count and the deepest cut, all computed from the full
// catalogue (never from the filtered list).
function summaryStrip(deals) {
  const totalSaved = deals.reduce((sum, d) => sum + amountSaved(d), 0);
  const avgPct = Math.round(deals.reduce((sum, d) => sum + pctOff(d), 0) / deals.length);
  const storeCount = new Set(deals.map((d) => d.store)).size;
  const deepest = deals.reduce((a, b) => (pctOff(b) > pctOff(a) ? b : a), deals[0]);
  return (
    '<div class="stats" role="status">' +
    "<div><strong>" + deals.length + "</strong><span>verified deals</span></div>" +
    "<div><strong>" + formatPrice(totalSaved) + "</strong><span>total savings</span></div>" +
    "<div><strong>" + avgPct + "%</strong><span>average discount</span></div>" +
    "<div><strong>" + storeCount + "</strong><span>stores</span></div>" +
    '<div><strong>-' + pctOff(deepest) + '%</strong><span>deepest cut: ' + escapeHtml(deepest.name.split(",")[0]) + "</span></div>" +
    "</div>"
  );
}

// Shown in the grid when no deal passes the current search and filters.
function noMatches() {
  return (
    '<div class="empty"><h2>No deals match that search</h2>' +
    "<p>Try a different word, a wider category, or a lower minimum discount.</p>" +
    '<p><a href="#/">Show all deals</a></p></div>'
  );
}

// Shown on the detail view when the hash names an id the catalogue has not
// got.
function dealNotFound() {
  return '<div class="empty"><h2>Deal not found</h2><p><a href="#/">Back to all deals</a></p></div>';
}
