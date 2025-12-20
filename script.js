document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // NAV PILLS
  // =========================
  const pills = document.querySelectorAll(".nav-pill[data-target]");
  const navWrap = document.querySelector(".nav-wrap");

  const sections = Array.from(pills)
    .map((pill) => document.getElementById(pill.getAttribute("data-target")))
    .filter(Boolean);

  const getOffset = () => {
    const navH = navWrap ? navWrap.offsetHeight : 0;
    return navH + 18; // spacing under sticky nav
  };

  function setActivePill() {
    const scrollY = window.scrollY;
    const offset = getOffset();

    let activeIndex = 0;

    sections.forEach((section, index) => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      if (scrollY + offset >= top) activeIndex = index;
    });

    pills.forEach((pill, index) => {
      pill.classList.toggle("active", index === activeIndex);
    });
  }

  setActivePill();
  window.addEventListener("scroll", setActivePill, { passive: true });

  pills.forEach((pill) => {
    pill.addEventListener("click", (e) => {
      const targetId = pill.getAttribute("data-target");
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      e.preventDefault();
      const top = targetEl.getBoundingClientRect().top + window.scrollY - getOffset();

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

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

      if (statusEl) {
        statusEl.textContent = "Sending...";
        statusEl.classList.remove("ok", "error");
      }

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
        });
    });
  }
});
