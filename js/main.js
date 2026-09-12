// Groundbreakable — main.js

(function () {
  "use strict";

  /* ---- Mobile nav ---- */
  var toggle = document.getElementById("navToggle");
  var mobile = document.getElementById("navMobile");
  if (toggle && mobile) {
    toggle.addEventListener("click", function () {
      var open = mobile.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobile.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobile.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Overlay header (home hero only) ----
     Only present when the header has the --overlay modifier (index.html) —
     floats transparent over the full-screen hero, then solidifies once
     the hero has scrolled past. */
  var overlayNav = document.querySelector(".nav--overlay");
  var heroEl = document.querySelector(".hero");
  if (overlayNav && heroEl) {
    var onNavScroll = function () {
      var threshold = Math.max(12, heroEl.offsetHeight - overlayNav.offsetHeight);
      overlayNav.classList.toggle("is-scrolled", window.scrollY > threshold);
    };
    onNavScroll();
    window.addEventListener("scroll", onNavScroll, { passive: true });
    window.addEventListener("resize", onNavScroll, { passive: true });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Hero search preview (display-only, typed/backspaced placeholder) ---- */
  var heroSearchText = document.getElementById("heroSearchText");
  if (heroSearchText) {
    var searchPrompts = [
      "Where should I build next?",
      "What can I build here?",
      "What could stop or delay this build?",
      "How much will this project cost?",
      "Who are the best contractors to hire for my specific home?",
      "Show me a buildable concept design for my idea."
    ];
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      heroSearchText.textContent = searchPrompts[0];
    } else {
      var promptIndex = 0, charIndex = 0, deleting = false;
      var TYPE_MS = 42, DELETE_MS = 26, HOLD_MS = 1700, PAUSE_MS = 450;
      (function stepSearchText() {
        var current = searchPrompts[promptIndex];
        if (!deleting) {
          charIndex++;
          heroSearchText.textContent = current.slice(0, charIndex);
          if (charIndex >= current.length) {
            deleting = true;
            setTimeout(stepSearchText, HOLD_MS);
          } else {
            setTimeout(stepSearchText, TYPE_MS);
          }
        } else {
          charIndex--;
          heroSearchText.textContent = current.slice(0, charIndex);
          if (charIndex <= 0) {
            deleting = false;
            promptIndex = (promptIndex + 1) % searchPrompts.length;
            setTimeout(stepSearchText, PAUSE_MS);
          } else {
            setTimeout(stepSearchText, DELETE_MS);
          }
        }
      })();
    }
  }

  /* ---- Footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
