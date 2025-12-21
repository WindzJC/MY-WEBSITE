document.addEventListener("DOMContentLoaded", () => {
  const commandbar = document.querySelector(".commandbar");
  const pills = Array.from(document.querySelectorAll(".nav-pill[data-target]"));
  const sections = pills
    .map((pill) => document.getElementById(pill.getAttribute("data-target")))
    .filter(Boolean);

  const progressBar = document.getElementById("progress-bar");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const setStickyHeightVar = () => {
    const h = commandbar ? Math.ceil(commandbar.getBoundingClientRect().height) : 0;
    document.documentElement.style.setProperty("--stickyH", `${h}px`);
  };

  const getOffset = () => {
    // commandbar is sticky with top:10px, add a small breathing room
    const h = commandbar ? commandbar.getBoundingClientRect().height : 0;
    return h + 10 + 14;
  };

  const setActivePill = () => {
    if (!sections.length) return;

    const scrollY = window.scrollY;
    const offset = getOffset();

    let activeIndex = 0;
    for (let i = 0; i < sections.length; i++) {
      const top = sections[i].offsetTop;
      if (scrollY + offset >= top) activeIndex = i;
    }

    pills.forEach((pill, idx) => {
      const isActive = idx === activeIndex;
      pill.classList.toggle("is-active", isActive);
      if (isActive) pill.setAttribute("aria-current", "page");
      else pill.removeAttribute("aria-current");
    });
  };

  const setProgress = () => {
    if (!progressBar) return;
    const doc = document.documentElement;
    const height = doc.scrollHeight - doc.clientHeight;
    const pct = height > 0 ? (doc.scrollTop / height) * 100 : 0;
    progressBar.style.width = `${pct}%`;
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      setActivePill();
      setProgress();
      ticking = false;
    });
  };

  // Smooth scroll for internal anchors + focus management
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href === "#" || href.length < 2) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const top =
      href === "#top"
        ? 0
        : target.getBoundingClientRect().top + window.scrollY - getOffset();

    window.scrollTo({ top, behavior: reduceMotion.matches ? "auto" : "smooth" });

    // Focus the section for keyboard/screen reader users (no jump)
    if (href !== "#top") {
      const prevTabIndex = target.getAttribute("tabindex");
      target.setAttribute("tabindex", "-1");
      window.setTimeout(() => {
        target.focus({ preventScroll: true });
        if (prevTabIndex === null) target.removeAttribute("tabindex");
        else target.setAttribute("tabindex", prevTabIndex);
      }, reduceMotion.matches ? 0 : 350);
    }
  });

  
  // Auto-fill service in contact form when clicking a CTA with data-service
  const setServiceValue = (value) => {
    const select = document.getElementById("service");
    if (!select || !value) return;
    const exists = Array.from(select.options).some((o) => o.value === value);
    if (exists) select.value = value;
  };

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-service]");
    if (!el) return;
    setServiceValue(el.getAttribute("data-service"));
  });


  // Init measurements and listeners
  
  // If a service is passed via query string, preselect it (e.g., ?service=Bundle%20($1299))
  try{
    const sp = new URLSearchParams(window.location.search);
    const sv = sp.get("service");
    if (sv) setServiceValue(sv);
  }catch(_e){}


  setStickyHeightVar();
  setActivePill();
  setProgress();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener(
    "resize",
    () => {
      setStickyHeightVar();
      onScroll();
    },
    { passive: true }
  );

  // =========================
  // EmailJS contact form hook
  // =========================
  const EMAILJS_PUBLIC_KEY = "IavxRtiZvs4FLoFc7";
  const EMAILJS_SERVICE_ID = "service_aj58jzd";
  const EMAILJS_TEMPLATE_ID = "template_vttb9qs";

  if (window.emailjs) {
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    } catch (err) {
      console.error("EmailJS init error:", err);
    }
  }

  const contactForm = document.getElementById("contact-form");
  const statusEl = document.getElementById("contact-status");

  if (contactForm && window.emailjs) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Honeypot check
      const hp = contactForm.querySelector('input[name="company"]');
      if (hp && hp.value.trim() !== "") return;

      const submitBtn = contactForm.querySelector('button[type="submit"]');

      if (statusEl) {
        statusEl.textContent = "Sending...";
        statusEl.classList.remove("ok", "error");
      }
      if (submitBtn) submitBtn.disabled = true;

      emailjs
        .sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, contactForm)
        .then(() => {
          if (statusEl) {
            statusEl.textContent = "Message sent. I’ll get back to you soon.";
            statusEl.classList.add("ok");
          }
          contactForm.reset();
        })
        .catch((error) => {
          console.error("EmailJS error:", error);
          if (statusEl) {
            statusEl.textContent =
              "Something went wrong. Please try again or email me directly.";
            statusEl.classList.add("error");
          }
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }
});
