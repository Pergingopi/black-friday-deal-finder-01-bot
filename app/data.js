// Deal catalogue for the Black Friday deal finder.
//
// Every entry below was read from the named store's own product page (or
// the store's own sale page) on Nov 27, 2026. `sale` is the price the store
// showed, `regular` is the price the same page showed as its usual /
// comparable value, and the discount percent is computed from those two
// numbers, rounded to the nearest whole percent. `url` is the store's own
// product page and `source` names where the price was read.
//
// The catalogue itself is frozen: product names, prices, links, stores and
// check times must not be edited by a revision. Only the two derived-value
// helpers at the bottom of this file are code, and they stay pure functions
// of a single deal.

const CHECKED_ON = "Nov 27, 2026";

const DEALS = [
  {
    id: "airpods-pro-3",
    name: "Apple AirPods Pro 3",
    store: "Walmart",
    category: "Electronics",
    sale: 149.0,
    regular: 249.0,
    url: "https://www.walmart.com/ip/AirPods-Pro-3/17835006350",
    source: "Walmart.com product page",
    checked: CHECKED_ON,
    verdict: "Record low",
    evidence: "Lowest price seen anywhere this season, $20 under the previous low of $169.",
    note: "Active noise cancellation, heart-rate sensing, up to 8 hours with ANC."
  },
  {
    id: "lg-c6-oled",
    name: "LG 65-inch C6 OLED evo AI 4K Smart TV (OLED65C6PUA)",
    store: "Walmart",
    category: "TVs",
    sale: 1299.98,
    regular: 2699.99,
    url: "https://www.walmart.com/ip/LG-65-C6-Series-4K-UHD-OLED-AI-Smart-webOS-26-TV-OLED65C6PUA/18196407846",
    source: "Walmart.com product page",
    checked: CHECKED_ON,
    verdict: "Strong deal",
    evidence: "52% off a current-model OLED TV, $1,400 under its list price.",
    note: "OLED evo panel, Dolby Vision and Atmos, 165Hz refresh for gaming."
  },
  {
    id: "lego-pikachu",
    name: "LEGO Pokemon Pikachu and Poke Ball (72152)",
    store: "Walmart",
    category: "Toys",
    sale: 159.95,
    regular: 199.99,
    url: "https://www.walmart.com/ip/LEGO-Pok-mon-Pikachu-Pok-Ball-Collectible-Building-Sets-Adults-Ages-18-Pok-mon-Figure-Display-Desk-Shelf-Office-Decor-Gift-Men-Women-72152/18109153195",
    source: "Walmart.com product page",
    checked: CHECKED_ON,
    verdict: "Strong deal",
    evidence: "Lowest price since launch for this 2,050-piece set, $40 off list.",
    note: "Posable Pikachu figure with a display-ready Poke Ball replica."
  },
  {
    id: "kitchenaid-deluxe",
    name: "KitchenAid Deluxe 4.5-Qt Tilt-Head Stand Mixer, Contour Silver",
    store: "Walmart",
    category: "Home",
    sale: 279.0,
    regular: 449.99,
    url: "https://www.walmart.com/ip/KitchenAid-Deluxe-Series-4-5-Quart-Tilt-Head-Stand-Mixer-with-Stainless-Bowl-Contour-Silver-KSM97CU/5152138331",
    source: "Walmart.com product page",
    checked: CHECKED_ON,
    verdict: "Solid deal",
    evidence: "38% off the $449.99 list; a recurring Black Friday price for this mixer.",
    note: "10 speeds, 4.5-quart stainless bowl, mixes up to 8 dozen cookies."
  },
  {
    id: "dyson-v8",
    name: "Dyson V8 Cyclone + Car Cleaning Kit Cordless Vacuum",
    store: "Walmart",
    category: "Home",
    sale: 299.99,
    regular: 449.99,
    url: "https://www.walmart.com/ip/Dyson-V8-Cyclone-Car-Cleaning-Kit-Cordless-Vacuum-Black-Khaki-New-Newest-Gen/20035273229",
    source: "Walmart.com product page",
    checked: CHECKED_ON,
    verdict: "Solid deal",
    evidence: "33% off; $150 under list, flagged as a Black Friday Deal on the page.",
    note: "Newest-gen V8, 60 minutes of run time, car cleaning tools included."
  },
  {
    id: "hisense-h5r1",
    name: "Hisense 65-inch H5R1 4K UHD HDR Smart Roku TV (65H5R1)",
    store: "Walmart",
    category: "TVs",
    sale: 228.0,
    regular: 398.0,
    url: "https://www.walmart.com/ip/Hisense-65-Class-H5R1-Series-4K-UHD-HDR-Smart-Roku-TV-65H5R1-2026-Model-Full-Array-LED-Dolby-Vision-AI-4K-Upscaler-Game-Mode-Plus-DTS-Virtual-X-Noise/20206324665",
    source: "Walmart.com product page",
    checked: CHECKED_ON,
    verdict: "Solid deal",
    evidence: "43% off; $170 under list, with a Black Friday Deal badge on the page.",
    note: "4K Roku TV with Dolby Vision, AI 4K upscaler and Game Mode Plus."
  },
  {
    id: "ipad-a16",
    name: "Apple iPad 11-inch, A16, Wi-Fi, 128GB, Silver",
    store: "Walmart",
    category: "Electronics",
    sale: 379.0,
    regular: 449.0,
    url: "https://www.walmart.com/ip/Apple-iPad-11-inch-A16-Wi-Fi-128GB-Silver/15483805722",
    source: "Walmart.com product page",
    checked: CHECKED_ON,
    verdict: "Modest deal",
    evidence: "16% off; a routine Apple cut, the same $70 saving seen before.",
    note: "11-inch Liquid Retina display, A16 chip, 128GB storage."
  },
  {
    id: "apple-watch-s12",
    name: "Apple Watch Series 12 GPS 42mm, Black Aluminum, Black Sport Band",
    store: "Walmart",
    category: "Electronics",
    sale: 299.0,
    regular: 399.0,
    url: "https://www.walmart.com/ip/Apple-Watch-Series-12-GPS-42mm-Black-Aluminum-Case-with-Black-Sport-Band-M-L/20989561129",
    source: "Walmart.com product page",
    checked: CHECKED_ON,
    verdict: "Modest deal",
    evidence: "25% off; standard Black Friday Apple pricing, not a new low.",
    note: "42mm GPS model with Ceramic Shield 2 and heart-rate sensing."
  },
  {
    id: "lego-grogu",
    name: "LEGO Star Wars Grogu with Hover Pram (75403)",
    store: "Walmart",
    category: "Toys",
    sale: 69.99,
    regular: 99.99,
    url: "https://www.walmart.com/ip/LEGO-Star-Wars-Mandalorian-Grogu-Hover-Pram-Building-Toy-Set-Star-Wars-Toy-Kids-Boys-Girls-Ages-10-Gift-Idea-Birthday-75403/6791824264",
    source: "Walmart.com product page",
    checked: CHECKED_ON,
    verdict: "Solid deal",
    evidence: "30% off the $99.99 list for this 1,048-piece set.",
    note: "Buildable Grogu figure in a brick-built hover pram, ages 10+."
  },
  {
    id: "airpods-4",
    name: "Apple AirPods 4",
    store: "Walmart",
    category: "Electronics",
    sale: 89.0,
    regular: 129.99,
    url: "https://www.walmart.com/ip/Apple-AirPods-4/11381374703",
    source: "Walmart.com product page",
    checked: CHECKED_ON,
    verdict: "Solid deal",
    evidence: "32% off; $41 under list.",
    note: "H2 chip, personalized spatial audio, IP54 dust and water resistance."
  },
  {
    id: "sony-xm5",
    name: "Sony WH-1000XM5 Wireless Noise Cancelling Over-Ear Headphones, Black",
    store: "Best Buy",
    category: "Electronics",
    sale: 169.99,
    regular: 398.0,
    url: "https://www.bestbuy.com/product/sony-wh-1000xm5-wireless-noise-cancelling-over-the-ear-headphones-black/J7XSRH5CXG/sku/6505727",
    source: "BestBuy.com product page",
    checked: CHECKED_ON,
    verdict: "Strong deal",
    evidence: "57% off; $228 under the $398 comparable value, sold by Best Buy.",
    note: "Doorbuster. Industry-leading noise cancelling, 30-hour battery life."
  },
  {
    id: "tcl-s4cf",
    name: "TCL 65-inch S4CF Series 4K UHD HDR Smart TV with Fire TV (2026)",
    store: "Best Buy",
    category: "TVs",
    sale: 229.99,
    regular: 469.99,
    url: "https://www.bestbuy.com/product/tcl-65-s4cf-series-4k-uhd-hdr-smart-tv-with-fire-tv-2026/J36QYTHZVP/sku/6687112",
    source: "BestBuy.com product page",
    checked: CHECKED_ON,
    verdict: "Strong deal",
    evidence: "51% off; $240 under the comparable value, a Black Friday Doorbuster.",
    note: "65-inch 4K Fire TV with Dolby Vision, HDR10 and a voice remote."
  },
  {
    id: "hp-omnibook-5",
    name: "HP OmniBook 5 14-inch 2K OLED Touchscreen Laptop, Starlit Blue",
    store: "Best Buy",
    category: "Electronics",
    sale: 449.99,
    regular: 799.99,
    url: "https://www.bestbuy.com/product/hp-omnibook-5-14-2k-oled-touchscreen-laptop-intel-core-5-series-3-2026-8gb-memory-256gb-ssd-starlit-blue/J3KSW748W6/sku/6690110",
    source: "BestBuy.com product page",
    checked: CHECKED_ON,
    verdict: "Solid deal",
    evidence: "44% off; $350 under list, sold by Best Buy as a Doorbuster.",
    note: "Intel Core 5, 8GB memory, 256GB SSD, 2K OLED touchscreen."
  },
  {
    id: "shark-powerdetect",
    name: "Shark PowerDetect Speed Cordless Stick Vacuum, HEPA, 60 Min Runtime (IA1121)",
    store: "Best Buy",
    category: "Home",
    sale: 199.99,
    regular: 499.99,
    url: "https://www.bestbuy.com/product/shark-powerdetect-speed-cordless-stick-vacuum-cleaner-hepa-filtration-60-min-runtime-ia1121-ivory/JXJVXL847Y/sku/6689453",
    source: "BestBuy.com product page",
    checked: CHECKED_ON,
    verdict: "Strong deal",
    evidence: "60% off; $300 under the $499.99 comparable value.",
    note: "HEPA filtration, 60-minute runtime, 12-inch cleaning path."
  },
  {
    id: "fire-tv-stick-hd",
    name: "Amazon Fire TV Stick HD (2nd Gen, 2026)",
    store: "Best Buy",
    category: "Smart Home",
    sale: 15.99,
    regular: 39.99,
    url: "https://www.bestbuy.com/product/amazon-fire-tv-stick-2nd-gen-hd-free-live-tv-alexa-voice-remote-powered-by-the-tv-effortless-setup-8gb-2026-black/J39TLSP338/sku/6674516",
    source: "BestBuy.com product page; list price per Amazon.com listing",
    checked: CHECKED_ON,
    verdict: "Record low",
    evidence: "60% off list; the lowest price recorded for this newest model.",
    note: "Fastest HD streaming stick, Wi-Fi 6, Alexa Voice Remote included."
  },
  {
    id: "dyson-v9",
    name: "Dyson V9 Motorbar Cordless Vacuum, 9.8-inch Cleaning Path, Nickel",
    store: "Target",
    category: "Home",
    sale: 269.99,
    regular: 599.99,
    url: "https://www.target.com/p/dyson-v9-motorbar-cordless-vacuum-9-8-34-cleaning-path-nickel/-/A-1011912746",
    source: "Target.com product page",
    checked: CHECKED_ON,
    verdict: "Strong deal",
    evidence: "55% off; $330 under the $599.99 regular price at Target.",
    note: "New at Target. 33% lighter than the Dyson V15, up to 40 minutes of suction."
  },
  {
    id: "beats-studio-pro",
    name: "Beats Studio Pro Bluetooth Wireless Headphones, Black",
    store: "Target",
    category: "Electronics",
    sale: 149.99,
    regular: 349.99,
    url: "https://www.target.com/p/beats-studio-pro-bluetooth-wireless-headphones-black/-/A-89401490",
    source: "Target.com product page",
    checked: CHECKED_ON,
    verdict: "Strong deal",
    evidence: "57% off; $200 under the regular price at Target.",
    note: "Adaptive noise cancelling, spatial audio, up to 40 hours of battery."
  },
  {
    id: "ring-doorbell-2k-plus",
    name: "Ring Wired Doorbell 2K Plus (Newest Model), Nickel Silver",
    store: "Ring",
    category: "Smart Home",
    sale: 89.99,
    regular: 179.99,
    url: "https://ring.com/products/wired-doorbell-plus",
    source: "Ring.com product page",
    checked: CHECKED_ON,
    verdict: "Strong deal",
    evidence: "50% off list; the lowest price tracked for this newest model.",
    note: "Retinal 2K video, 6x enhanced zoom, hardwired, night vision."
  }
];

// Discount percent for a deal, derived from its two prices and rounded to
// the nearest whole percent: a $149 sale against a $249 regular is 40% off.
function pctOff(deal) {
  return Math.round((1 - deal.sale / deal.regular) * 100);
}

// Dollars saved for a deal, derived from its two prices and rounded to the
// cent so the card and the detail page always agree with each other.
function amountSaved(deal) {
  return Math.round((deal.regular - deal.sale) * 100) / 100;
}
