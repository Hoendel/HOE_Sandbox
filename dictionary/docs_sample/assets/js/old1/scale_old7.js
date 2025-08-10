(function () {
  // Grenzen & Defaults
  const MIN = 0.90, MAX = 1.40, STEP = 0.05, DEF = 1.00;
  const KEY = "ui:font-scale";

  const clamp = (v) => Math.min(MAX, Math.max(MIN, Number(v) || DEF));

  function apply(scale) {
    document.documentElement.style.setProperty("--user-font-scale", String(scale));
  }
  function load() {
    try { return clamp(localStorage.getItem(KEY)); } catch { return DEF; }
  }
  function save(scale) {
    try { localStorage.setItem(KEY, String(scale)); } catch {}
  }

  function buildBar(target){
    const bar = document.createElement("div");
    bar.className = "fs-ctrl-bar";
    bar.innerHTML = `
      <div class="fs-ctrl" role="group" aria-label="Schriftgröße anpassen">
        <span class="fs-ctrl__label" aria-hidden="true">Aa</span>
        <input class="fs-ctrl__range" type="range"
               min="${MIN}" max="${MAX}" step="${STEP}" value="${load()}"
               aria-label="Schriftgröße" />
        <button class="fs-ctrl__btn" type="button" data-delta="-${STEP}" aria-label="Kleiner">–</button>
        <button class="fs-ctrl__btn" type="button" data-delta="${STEP}" aria-label="Größer">+</button>
        <button class="fs-ctrl__btn" type="button" data-reset aria-label="Zurücksetzen">↺</button>
      </div>`;
    target.appendChild(bar);

    const range = bar.querySelector(".fs-ctrl__range");
    const [minus, plus] = bar.querySelectorAll("[data-delta]");
    const reset = bar.querySelector("[data-reset]");

    const set = (v) => { const s = clamp(v); range.value = s; apply(s); save(s); };

    range.addEventListener("input", () => set(range.value));
    minus.addEventListener("click", () => set(Number(range.value) - STEP));
    plus .addEventListener("click", () => set(Number(range.value) + STEP));
    reset.addEventListener("click", () => set(DEF));

    // initial anwenden
    set(load());
  }

  function mount() {
    const headerInner = document.querySelector(".md-header__inner");
    if (headerInner && !headerInner.querySelector(".fs-ctrl-bar")) buildBar(headerInner);
    else setTimeout(mount, 120);
  }

  document.addEventListener("DOMContentLoaded", mount);
  // bei SPA-Navigation von mkdocs-material:
  document.addEventListener("DOMContentSwitch", mount);
})();
