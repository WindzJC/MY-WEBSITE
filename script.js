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

    const getDocumentTop = (section) =>
      section.getBoundingClientRect().top + window.scrollY;
    const sectionsInPageOrder = [...sections].sort(
      (a, b) => getDocumentTop(a) - getDocumentTop(b)
    );
    let activeSection = sectionsInPageOrder[0];
    for (const section of sectionsInPageOrder) {
      if (scrollY + offset + 4 >= getDocumentTop(section)) activeSection = section;
    }

    const doc = document.documentElement;
    const isAtPageEnd = window.innerHeight + scrollY >= doc.scrollHeight - 4;
    if (isAtPageEnd) activeSection = sectionsInPageOrder.at(-1);

    pills.forEach((pill) => {
      const isActive = pill.getAttribute("data-target") === activeSection.id;
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

  
  // Auto-fill assessment focus while preserving known legacy service links.
  const legacyServiceValues = new Map([
    ["Author Website ($499)", "Author website / online presence"],
    ["Book Trailer ($999)", "Book promotion / trailer"],
    ["Bundle ($1299)", "I’m not sure — I’d like Astra to assess it"],
    ["Book Cover & Promo Graphics (from $399)", "Upcoming launch"],
  ]);

  const setServiceValue = (value) => {
    const select = document.getElementById("service");
    if (!select || !value) return;
    const normalizedValue = legacyServiceValues.get(value) || value;
    const exists = Array.from(select.options).some((o) => o.value === normalizedValue);
    if (exists) select.value = normalizedValue;
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

  // Keep the mobile CTA clear of the contact form and footer.
  const mobileCta = document.querySelector(".mobile-sticky-cta");
  const mobileCtaHideTargets = [
    document.getElementById("overview"),
    document.getElementById("start"),
    document.querySelector(".footer"),
  ].filter(Boolean);

  if (mobileCta && mobileCtaHideTargets.length && "IntersectionObserver" in window) {
    const visibleTargets = new Set();
    const mobileCtaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleTargets.add(entry.target);
          else visibleTargets.delete(entry.target);
        });
        mobileCta.classList.toggle("is-hidden", visibleTargets.size > 0);
      },
      { threshold: 0.05 }
    );

    mobileCtaHideTargets.forEach((target) => mobileCtaObserver.observe(target));
  }

  // =========================
  // Secure project inquiry form
  // =========================
  const contactForm = document.getElementById("contact-form");
  const statusEl = document.getElementById("contact-status");
  const formStartedAt = Date.now();
  let pendingRequestId = null;
  let pendingSubmittedAt = null;
  let isSubmitting = false;

  const createRequestId = () => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  };

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const hp = contactForm.querySelector('input[name="bot_field"]');
      if (hp && hp.value.trim() !== "") return;

      isSubmitting = true;
      pendingRequestId ||= createRequestId();
      pendingSubmittedAt ||= new Date().toISOString();

      if (statusEl) {
        statusEl.textContent = "Sending...";
        statusEl.classList.remove("ok", "error");
      }
      if (submitBtn) submitBtn.disabled = true;

      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());
      payload.request_id = pendingRequestId;
      payload.form_elapsed_ms = String(Date.now() - formStartedAt);
      payload.submitted_at = pendingSubmittedAt;

      let wasSuccessful = false;
      try {
        const response = await fetch("/api/inquiry", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        let result = {};
        try {
          result = await response.json();
        } catch {
          result = {};
        }

        if (!response.ok || !result.ok) {
          const submissionError = new Error(result.error || "Submission failed");
          submissionError.code = result.code || "";
          throw submissionError;
        }

        wasSuccessful = true;
        pendingRequestId = null;
        pendingSubmittedAt = null;
        if (statusEl) {
          statusEl.textContent = result.confirmationSent === false
            ? "Thanks! Astra received your request successfully."
            : "Thanks! Your request is in. Check your email for confirmation.";
          statusEl.classList.add("ok");
          statusEl.focus({ preventScroll: true });
        }
        contactForm.reset();
        window.setTimeout(() => {
          window.location.assign("/thank-you");
        }, 1200);
      } catch (error) {
        console.error("Inquiry submission failed", error);
        if (statusEl) {
          statusEl.textContent = error?.code === "rate_limited"
            ? "Please wait a few minutes before sending another request."
            : "Something went wrong. Please try again or email jc@astraproductions.co.";
          statusEl.classList.add("error");
          statusEl.focus({ preventScroll: true });
        }
      } finally {
        isSubmitting = false;
        if (submitBtn && !wasSuccessful) submitBtn.disabled = false;
      }
    });
  }

});
