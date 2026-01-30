(() => {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // =========
  // Offcanvas menu
  // =========
  const menu = qs("[data-menu]");
  const overlay = qs("[data-overlay]");
  const btnOpen = qs("[data-menu-open]");
  const btnClose = qs("[data-menu-close]");

  function openMenu() {
    if (!menu || !overlay) return;

    menu.hidden = false;
    overlay.hidden = false;

    requestAnimationFrame(() => {
      menu.classList.add("is-active");
      overlay.classList.add("is-active");
    });

    menu.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    if (!menu || !overlay) return;

    menu.classList.remove("is-active");
    overlay.classList.remove("is-active");

    setTimeout(() => {
      menu.hidden = true;
      overlay.hidden = true;
      menu.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }, 300);
  }

  btnOpen?.addEventListener("click", openMenu);
  btnClose?.addEventListener("click", closeMenu);
  overlay?.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
      closeModal();
    }
  });

  // =========
  // Modals
  // =========
  const modals = qsa("[data-modal]");
  let activeModal = null;

  function openModal(name) {
    const m = qs(`[data-modal="${name}"]`);
    if (!m) return;
    activeModal = m;
    m.hidden = false;
    m.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!activeModal) return;
    activeModal.hidden = true;
    activeModal.setAttribute("aria-hidden", "true");
    activeModal = null;
    document.body.style.overflow = "";
  }

  qsa("[data-modal-close]").forEach((b) =>
    b.addEventListener("click", closeModal)
  );
  qsa("[data-open-lead]").forEach((b) =>
    b.addEventListener("click", () => openModal("lead"))
  );
  qsa("[data-open-calc]").forEach((b) =>
    b.addEventListener("click", () => {
      openModal("calc");

      // если клик по услуге — проставим service в селекте модалки
      const svc = b.getAttribute("data-service");
      if (svc) {
        const sel = qs('[data-modal="calc"] select[name="service"]');
        if (sel) sel.value = svc;
      }
    })
  );

  // клик вне панели модалки — закрыть
  modals.forEach((m) => {
    m.addEventListener("click", (e) => {
      const panel = qs(".modal__panel", m);
      if (!panel) return;
      if (!panel.contains(e.target)) closeModal();
    });
  });

  // =========
  // SEO prices toggle
  // =========
  const btnTogglePrices = qs("[data-toggle-prices]");
  const prices = qs("[data-prices]");

  btnTogglePrices?.addEventListener("click", () => {
    if (!prices) return;
    const isHidden = prices.hidden;
    prices.hidden = !isHidden;
    btnTogglePrices.setAttribute("aria-expanded", String(isHidden));
    btnTogglePrices.textContent = isHidden
      ? "Скрыть таблицу цен на главной"
      : "Показать таблицу цен на главной";
  });

  // =========
  // Forms: fake submit (demo)
  // =========
  qsa("[data-lead-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Демо: форма отправлена. В WP подключишь обработчик (AJAX/REST).");
      form.reset();
      closeModal();
    });
  });

  // =========
  // Calculator logic (lightweight, demo)
  // =========
  function estimate({ service, vehicle, situation }) {
    // базовые ориентиры — чтобы UI “жил”.
    // Позже заменишь на нормальную логику/ACF-конфиг.
    let priceFrom = 1500;
    let eta = "20–40 минут";

    // услуга
    if (service === "tech") priceFrom = 1200;
    if (service === "fuel") priceFrom = 1000;
    if (service === "sober") priceFrom = 2000;

    // тип авто
    if (vehicle === "suv") priceFrom += 200;
    if (vehicle === "other") priceFrom += 400;
    if (vehicle === "moto") priceFrom = Math.max(1200, priceFrom - 200);

    // ситуация
    if (situation === "wheels") priceFrom += 400;
    if (situation === "ditch") priceFrom += 600;
    if (situation === "battery" && service === "tech")
      priceFrom = Math.max(1000, priceFrom - 100);
    if (situation === "no-fuel" && service === "fuel")
      priceFrom = Math.max(900, priceFrom - 100);

    return { priceFrom, eta };
  }

  function updateCalcResult(form) {
    const result = qs("[data-calc-result]", form);
    if (!result) return;

    const service = qs('[name="service"]', form)?.value || "tow";
    const vehicle = qs('[name="vehicle"]', form)?.value || "light";
    const situation = qs('[name="case"]', form)?.value || "normal";

    const { priceFrom, eta } = estimate({ service, vehicle, situation });

    const priceEl = qs(".calc__price", result);
    const etaEl = qs(".calc__eta", result);

    if (priceEl)
      priceEl.innerHTML = `От <strong>${priceFrom.toLocaleString(
        "ru-RU"
      )} ₽</strong>`;
    if (etaEl) etaEl.innerHTML = `Подача: <strong>${eta}</strong>`;
  }

  qsa("[data-calc-form]").forEach((form) => {
    // live update on change
    form.addEventListener("change", () => updateCalcResult(form));
    updateCalcResult(form);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      updateCalcResult(form);

      const phone = "+74952041652";
      alert(
        "Ориентировочный расчёт обновлён. Для точной цены — звоните оператору."
      );
      // опционально: сразу предложить позвонить
      // window.location.href = `tel:${phone}`;
    });
  });
})();

// =========
// Header scroll effect
// =========
const header = document.querySelector("[data-header]");
let lastY = 0;

window.addEventListener("scroll", () => {
  const y = window.scrollY;

  if (y > 10) {
    header?.classList.add("is-scrolled");
  } else {
    header?.classList.remove("is-scrolled");
  }

  lastY = y;
});
