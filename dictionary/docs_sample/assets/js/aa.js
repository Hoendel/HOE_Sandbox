/*!
 * aa.js – aA-Schriftgrößen-Toolbar (fixed unter Header)
 * UI 0–100% → Δ 0–60% (100% UI = 160% Content)
 * Content skaliert 100%, Menü 50%
 * Version: 2025-09-15 (UI-normalized) + html.aa-enlarged toggle
 */
(() => {
  // Persistenz-Key (neuer, UI-normalisierter Wert 0..100)
  const KEY_UI = "aa-scale-ui";
  // Alter Key (Delta -10..+60) für Migration
  const KEY_OLD = "aa-scale-delta";

  // UI (Anzeige) – 0..100%
  const UI_MIN = 0;
  const UI_MAX = 100;
  const UI_STEP = 5;
  const UI_DEF = 0;

  // Fachliche Obergrenze der Vergrößerung (Δmax in %-Punkten)
  const DELTA_MAX = 60; // 0%..60% → 100%..160%

  const ready = fn =>
    (document.readyState === "loading")
      ? document.addEventListener("DOMContentLoaded", fn, { once: true })
      : fn();

  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

  // Mapping UI(0..100) → Δ(0..DELTA_MAX) und zurück
  const uiToDelta  = ui => (clamp(ui, UI_MIN, UI_MAX) / 100) * DELTA_MAX;
  const deltaToUi  = d  => Math.round(clamp(d, 0, DELTA_MAX) / DELTA_MAX * 100);

  function computeTop(header){
    if (!header) return 64;
    const cs  = getComputedStyle(header);
    const top = parseFloat(cs.top) || 0;
    const h   = header.getBoundingClientRect().height;
    return Math.floor(top + h); // anti-gap
  }

  function buildToolbar(){
    if (document.getElementById("aa-toolbar")) return null;
    const header = document.querySelector("header.md-header");
    if (!header) return null;

    const bar = document.createElement("div");
    bar.id = "aa-toolbar";
    bar.setAttribute("role","region");
    bar.setAttribute("aria-label","Schriftgröße");

    bar.innerHTML = `
      <div class="aa-wrap">
        <span class="aa-label" aria-hidden="true">Aa</span>
        <button class="aa-btn" type="button" data-aa="-">−</button>
        <input class="aa-range" type="range"
               min="${UI_MIN}" max="${UI_MAX}" step="${UI_STEP}" value="${UI_DEF}"
               aria-label="Vergrößerung in Prozent (0 bis 100)">
        <button class="aa-btn" type="button" data-aa="+">+</button>
        <button class="aa-btn aa-reset" type="button" data-aa="reset" title="Zurücksetzen">⟲</button>
        <span class="aa-value" aria-live="polite">0%</span>
      </div>`;

    // fixiert direkt NACH dem Header
    header.insertAdjacentElement("afterend", bar);

    const setTop = () => {
      document.documentElement.style.setProperty("--aa-top", computeTop(header) + "px");
    };
    setTop();
    window.addEventListener("resize", setTop);
    window.addEventListener("orientationchange", setTop);
    window.addEventListener("load", setTop);
    new MutationObserver(setTop).observe(header, { attributes:true, childList:true, subtree:true });

    return bar;
  }

  // Wendet einen UI-Wert (0..100) an: setzt Content-/Menü-Faktoren und UI-Anzeige
  function applyUI(uiValue, valueEl, rangeEl){
    const ui = clamp(Number(uiValue), UI_MIN, UI_MAX);
    const delta = uiToDelta(ui);          // Δ in %-Punkten (0..60)
    const abs   = 100 + delta;            // absolute Zielgröße in %
    const f     = abs / 100;              // Content-Faktor (1.00..1.60)
    const fn    = 1 + (f - 1) * 0.5;      // Menü-Faktor (50% Stärke)

    document.documentElement.style.setProperty("--aa-content-scale", f.toFixed(3));
    document.documentElement.style.setProperty("--aa-nav-scale", fn.toFixed(3));

    // NEU: Bei >0% Vergrößerung erlauben wir in CSS z. B. 2-zeilige Pillen
    document.documentElement.classList.toggle("aa-enlarged", ui > 0);

    // UI-Anzeige: normierter Wert (0..100 %), nicht die absolute Größe
    if (valueEl) valueEl.textContent = ui + "%";
    if (rangeEl) rangeEl.value = String(ui);

    localStorage.setItem(KEY_UI, String(ui));
  }

  // Einmalige Migration alter gespeicherter Werte (falls vorhanden)
  function migrateOldValue(){
    const old = Number(localStorage.getItem(KEY_OLD));
    if (!Number.isFinite(old)) return null;
    // alter Wert war Δ in %-Punkten (-10..+60). Wir kappen <0 und mappen auf UI.
    const uiFromOld = deltaToUi(Math.max(0, old));
    localStorage.setItem(KEY_UI, String(uiFromOld));
    // optional: alten Key löschen
    // localStorage.removeItem(KEY_OLD);
    return uiFromOld;
  }

  ready(() => {
    const bar = buildToolbar();
    if (!bar) return;

    const range = bar.querySelector(".aa-range");
    const value = bar.querySelector(".aa-value");
    const btns  = bar.querySelectorAll(".aa-btn");

    // Startwert (UI 0..100), ggf. aus alter Speicherung migrieren
    let savedUI = Number(localStorage.getItem(KEY_UI));
    if (!Number.isFinite(savedUI)) {
      const migrated = migrateOldValue();
      savedUI = Number.isFinite(migrated) ? migrated : UI_DEF;
    }
    applyUI(savedUI, value, range);

    range.addEventListener("input", e => applyUI(Number(e.target.value), value, range));
    btns.forEach(b => b.addEventListener("click", () => {
      const act = b.getAttribute("data-aa");
      let ui = Number(range.value);
      if (act === "+") ui = clamp(ui + UI_STEP, UI_MIN, UI_MAX);
      else if (act === "-") ui = clamp(ui - UI_STEP, UI_MIN, UI_MAX);
      else ui = UI_DEF;
      applyUI(ui, value, range);
    }));
  });
})();
