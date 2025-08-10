(function () {
  /* Bereich so wählen, dass die Mitte (Default) fühlbar größer ist:
     MIN=0.90  MAX=1.50  -> Mitte/Default = 1.20 */
  const MIN = 0.90, MAX = 1.50, STEP = 0.05, DEF = 1.20;
  const KEY = "ui:layout-scale";

  const clamp = (v) => Math.min(MAX, Math.max(MIN, Number(v) || DEF));

  function apply(scale) {
    document.documentElement.style.setProperty("--layout-scale", String(scale));
  }

  function load() {
    try {
      const v = localStorage.getItem(KEY);
      return v == null ? DEF : clamp(v);
    } catch { return DEF; }
  }

  function save(scale) {
    try { localStorage.setItem(KEY, String(scale)); } catch {}
  }

  function buildBar(host) {
    let bar = document.getElementById("scale-ctrl-bar");
    if (bar) return bar;

    bar = document.createElement("div");
    bar.id = "scale-ctrl-bar";
    bar.className = "scale-ctrl-bar";

    const wrap = document.createElement("div");
    wrap.className = "scale-ctrl";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Schriftgröße anpassen");
    wrap.innerHTML = `
      <span class="scale-ctrl__label" aria-hidden="true">Aa</span>
      <input class="scale-ctrl__range" type="range"
             min="${MIN}" max="${MAX}" step="${STEP}" value="${load()}"
             aria-label="Schriftgröße" />
      <button class="scale-ctrl__btn" type="button" data-delta="-${STEP}" aria-label="Kleiner">–</button>
      <button class="scale-ctrl__btn" type="button" data-delta="${STEP}" aria-label="Größer">+</button>
      <button class="scale-ctrl__btn" type="button" data-reset aria-label="Zurücksetzen">↺</button>
    `;
    bar.appendChild(wrap);
    host.appendChild(bar);
    return wrap;
  }

  function wireControl(ctrl) {
    const range = ctrl.querySelector(".scale-ctrl__range");
    const minus = ctrl.querySelector('[data-delta^="-"]');
    const plus  = ctrl.querySelector('[data-delta]:not([data-delta^="-"])');
    const reset = ctrl.querySelector('[data-reset]');

    function set(val) {
      const s = clamp(val);
      range.value = s;
      apply(s); save(s);
    }

    range.addEventListener("input", () => set(range.value));
    minus.addEventListener("click", () => set(Number(range.value) - STEP));
    plus .addEventListener("click", () => set(Number(range.value) + STEP));
    reset.addEventListener("click", () => set(DEF));

    set(load()); // initial anwenden
  }

  function init() {
    const headerInner = document.querySelector(".md-header__inner");
    const host = headerInner || document.body; // Fallback
    const ctrl = buildBar(host);
    wireControl(ctrl);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
