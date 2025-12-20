// Highlight nav pill based on scroll position + smooth scroll
document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // NAV PILLS
  // =========================
  const pills = document.querySelectorAll(".nav-pill[data-target]");
  const sections = Array.from(pills).map((pill) => {
    const id = pill.getAttribute("data-target");
    return document.getElementById(id);
  });

  function setActivePill() {
    const scrollY = window.scrollY;
    const offset = 120; // distance from top

    let activeIndex = 0;

    sections.forEach((section, index) => {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const top = rect.top + window.scrollY;

      if (scrollY + offset >= top) {
        activeIndex = index;
      }
    });

    pills.forEach((pill, index) => {
      if (index === activeIndex) {
        pill.classList.add("active");
      } else {
        pill.classList.remove("active");
      }
    });
  }

  // Initial state + scroll listener
  setActivePill();
  window.addEventListener("scroll", setActivePill);

  // Smooth scroll on click
  pills.forEach((pill) => {
    pill.addEventListener("click", (e) => {
      const targetId = pill.getAttribute("data-target");
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      e.preventDefault();
      const rect = targetEl.getBoundingClientRect();
      const top = rect.top + window.scrollY - 80; // adjust for sticky nav

      window.scrollTo({
        top,
        behavior: "smooth",
      });
    });
  });

  // =========================
  // EmailJS contact form hook
  // =========================

  const EMAILJS_PUBLIC_KEY = "IavxRtiZvs4FLoFc7";
  const EMAILJS_SERVICE_ID = "service_aj58jzd";
  const EMAILJS_TEMPLATE_ID = "template_vttb9qs";

  // Init EmailJS
  if (window.emailjs) {
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      console.log("EmailJS initialized");
    } catch (err) {
      console.error("EmailJS init error:", err);
    }
  } else {
    console.warn("EmailJS script not loaded.");
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
        .then((response) => {
          console.log("EmailJS success:", response);
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
