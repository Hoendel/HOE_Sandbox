(function () {
  // Symmetrischer Bereich um 1.00 => Regler steht bei 1.00 genau in der Mitte (50 %)
  const MIN = 0.80, MAX = 1.20, STEP = 0.05, DEF = 1.00;
  const KEY = "ui:layout-scale";

  const clamp = (v) => Math.min(MAX, Math.max(MIN, Number(v) || DEF));

  function apply(scale) {
    document.documentElement.style.setProperty("--layout-scale", String(scale));
  }

  function load() {
    try { return clamp(localStorage.getItem(KEY)); }
    catch { return DEF; }
  }

  function save(scale) {
    try { localStorage.setItem(KEY, String(scale)); } catch {}
  }

  function buildControl() {
    const wrap = document.createElement("div");
    wrap.className = "scale-ctrl";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Schriftgröße anpassen");

    wrap.innerHTML = `
      <span class="scale-ctrl__label" aria-hidden="true">Aa</span>
      <input class="scale-ctrl__range" type="range"
             min="${MIN}" max="${MAX}" step="${STEP}" value="${DEF}"
             aria-label="Schriftgröße" />
      <button class="scale-ctrl__btn" type="button" data-delta="-${STEP}" aria-label="Kleiner">–</button>
      <button class="scale-ctrl__btn" type="button" data-delta="${STEP}" aria-label="Größer">+</button>
      <button class="scale-ctrl__btn" type="button" data-reset aria-label="Zurücksetzen">↺</button>
    `;

    const range = wrap.querySelector(".scale-ctrl__range");
    const minus = wrap.querySelector('[data-delta^="-"]');
    const plus  = wrap.querySelector('[data-delta]:not([data-delta^="-"])');
    const reset = wrap.querySelector('[data-reset]');

    function set(val) {
      const s = clamp(val);
      range.value = s;
      apply(s); save(s);
    }

    // Startwert setzen (und in UI spiegeln)
    const initial = load();
    set(initial);

    range.addEventListener("input", () => set(range.value));
    minus.addEventListener("click", () => set(Number(range.value) - STEP));
    plus .addEventListener("click", () => set(Number(range.value) + STEP));
    reset.addEventListener("click", () => set(DEF));

    // Direkt an <body> hängen (nicht in den Header),
    // damit Position/Größe NIE vom Header-Layout abhängen
    document.body.appendChild(wrap);
  }

  function init() {
    if (document.body) { buildControl(); }
    else { document.addEventListener("DOMContentLoaded", buildControl); }
  }

  init();
})();
