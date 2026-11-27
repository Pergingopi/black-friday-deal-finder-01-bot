// App wiring: search, filters, sorting and hash routing.
//
// Routes: "#/" is the deal grid, "#/deal/<id>" is one deal's page.
// The search box, category, store, minimum-discount and sort controls all
// re-render the grid live. A "?preset=search" or "?preset=deal" query is
// only a shortcut for screenshots; the controls hold the same state.

(function () {
  // Element handles for the two views and every control.
  const grid = document.getElementById("grid");
  const count = document.getElementById("count");
  const searchBox = document.getElementById("search");
  const categorySel = document.getElementById("category");
  const storeSel = document.getElementById("store");
  const minSel = document.getElementById("min-discount");
  const sortSel = document.getElementById("sort");
  const statsBox = document.getElementById("stats");
  const listView = document.getElementById("list-view");
  const detailView = document.getElementById("detail-view");

  // Dropdown values, derived from the catalogue so a future deal in a new
  // category or store shows up in the filters on its own. "All ..." stays
  // first; the rest are sorted alphabetically.
  const CATEGORIES = ["All categories"].concat(
    Array.from(new Set(DEALS.map((d) => d.category))).sort()
  );
  const STORES = ["All stores"].concat(
    Array.from(new Set(DEALS.map((d) => d.store))).sort()
  );

  function populateSelect(sel, values) {
    sel.innerHTML = values
      .map((v) => '<option value="' + v + '">' + v + "</option>")
      .join("");
  }
  populateSelect(categorySel, CATEGORIES);
  populateSelect(storeSel, STORES);

  // Snapshot of what the shopper has typed or picked, normalised for
  // matching: the query is trimmed and lower-cased, the minimum discount
  // is a number (0 when the control holds something unparsable).
  function readControls() {
    return {
      q: searchBox.value.trim().toLowerCase(),
      category: categorySel.value,
      store: storeSel.value,
      min: parseInt(minSel.value, 10) || 0,
      sort: sortSel.value
    };
  }

  // One predicate per filter rule, so each rule reads on its own. A deal
  // reaches the grid only when all four pass.
  function inCategory(deal, wanted) {
    return wanted === "All categories" || deal.category === wanted;
  }

  function inStore(deal, wanted) {
    return wanted === "All stores" || deal.store === wanted;
  }

  function meetsDiscount(deal, min) {
    return pctOff(deal) >= min;
  }

  function matchesQuery(deal, q) {
    if (!q) return true;
    const haystack = (deal.name + " " + deal.store + " " + deal.category).toLowerCase();
    return haystack.includes(q);
  }

  function filterDeals(state) {
    return DEALS.filter(
      (d) =>
        inCategory(d, state.category) &&
        inStore(d, state.store) &&
        meetsDiscount(d, state.min) &&
        matchesQuery(d, state.q)
    );
  }

  // Sort comparators, keyed by the sort control's value. Each takes two
  // deals and returns negative / zero / positive, as Array.sort expects.
  // An unknown sort value sorts nothing and leaves catalogue order.
  const SORTERS = {
    discount: (a, b) => pctOff(b) - pctOff(a),
    saved: (a, b) => amountSaved(b) - amountSaved(a),
    "price-low": (a, b) => a.sale - b.sale,
    "price-high": (a, b) => b.sale - a.sale
  };

  function filterAndSort(state) {
    const out = filterDeals(state);
    const sortBy = SORTERS[state.sort];
    if (sortBy) out.sort(sortBy);
    return out;
  }

  // Render the grid for the current control state. The summary strip
  // always describes the full catalogue, never the filtered list.
  function showList() {
    const state = readControls();
    const deals = filterAndSort(state);
    statsBox.innerHTML = summaryStrip(DEALS);
    grid.innerHTML = deals.length ? deals.map(cardHtml).join("") : noMatches();
    count.textContent =
      deals.length === DEALS.length
        ? "Showing all " + deals.length + " deals"
        : "Showing " + deals.length + " of " + DEALS.length + " deals";
    listView.hidden = false;
    detailView.hidden = true;
    detailView.innerHTML = "";
    window.__shotReady = true;
  }

  // Render one deal's page, or the not-found state for an unknown id.
  function showDetail(id) {
    const deal = DEALS.find((d) => d.id === id);
    listView.hidden = true;
    detailView.hidden = false;
    detailView.innerHTML = deal ? detailHtml(deal) : dealNotFound();
    window.__shotReady = true;
  }

  // "#/deal/<id>" opens the deal; anything else (including a bare "#/")
  // opens the grid. The id may contain letters, digits, underscores and
  // hyphens only.
  function routeHash() {
    const hash = window.location.hash || "#/";
    const match = hash.match(/^#\/deal\/([\w-]+)$/);
    if (match) {
      showDetail(match[1]);
    } else {
      showList();
    }
  }

  // Every control re-renders the grid live, on typing and on selection.
  [searchBox, categorySel, storeSel, minSel, sortSel].forEach((el) => {
    el.addEventListener("input", showList);
    el.addEventListener("change", showList);
  });
  window.addEventListener("hashchange", routeHash);

  // Screenshot presets: fill the controls exactly as a shopper would, so a
  // screenshot shows a state reachable through the UI itself. "search"
  // types a query and tightens the filters; "deal" navigates to one deal
  // (the hash change re-renders through the normal route).
  function applyPreset() {
    const params = new URLSearchParams(window.location.search);
    const preset = params.get("preset");
    if (preset === "search") {
      searchBox.value = "headphones";
      minSel.value = "50";
      sortSel.value = "discount";
    } else if (preset === "deal") {
      window.location.hash = "#/deal/airpods-pro-3";
    }
  }
  applyPreset();

  routeHash();
})();
