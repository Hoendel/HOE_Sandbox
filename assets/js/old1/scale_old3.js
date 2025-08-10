(function () {
  const MIN = 0.85, MAX = 1.40, STEP = 0.05, DEF = 1.00;
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

  function buildControl(mount) {
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

    const range = wrap.querySelector(".scale-ctrl__range");
    const minus = wrap.querySelector('[data-delta^="-"]');
    const plus  = wrap.querySelector('[data-delta]:not([data-delta^="-"])');
    const reset = wrap.querySelector('[data-reset]');

    function set(val) {
      const s = clamp(val);
      range.value = s;
      apply(s); save(s);
    }

    range.addEventListener("input", () => set(range.value));
    minus.addEventListener("click", () => set(Number(range.value) - STEP));
    plus .addEventListener("click", () => set(Number(range.value) + STEP));
    reset.addEventListener("click", () => set(DEF));

    mount.appendChild(wrap);
    set(load());
  }

  function mountWhenReady() {
    const target = document.querySelector(".md-header__inner");
    if (target && !target.querySelector(".scale-ctrl")) {
      buildControl(target);
      return;
    }
    setTimeout(mountWhenReady, 120);
  }

  document.addEventListener("DOMContentLoaded", mountWhenReady);
  document.addEventListener("DOMContentSwitch", mountWhenReady);
})();
