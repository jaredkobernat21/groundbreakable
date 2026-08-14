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

  /* ---- Orb intro animation (black/charcoal particle orb) ---- */
  var orbCanvas = document.getElementById("homeOrb");
  if (orbCanvas) {
    var orbCtx = orbCanvas.getContext("2d");
    var orbDpr = window.devicePixelRatio || 1;
    var orbSize = orbCanvas.width;
    orbCanvas.width = orbSize * orbDpr;
    orbCanvas.height = orbSize * orbDpr;
    orbCtx.scale(orbDpr, orbDpr);

    var orbCenter = orbSize / 2;
    var orbRadius = orbSize * 0.46;
    var orbCount = Math.round(24 + orbSize * 0.9);

    var orbParticles = [];
    for (var oi = 0; oi < orbCount; oi++) {
      var oAngle = Math.random() * Math.PI * 2;
      var oR = Math.pow(Math.random(), 0.55) * orbRadius;
      orbParticles.push({
        x: Math.cos(oAngle) * oR,
        y: Math.sin(oAngle) * oR,
        size: Math.random() * 1.6 + 0.7,
        phase: Math.random() * Math.PI * 2,
        speed: 0.0007 + Math.random() * 0.0012,
        minOpacity: 0.35,
        maxOpacity: 1,
      });
    }

    var orbBreatheDuration = 3200;
    var orbRotateDuration = 26000;
    var orbReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var orbFrame = function (t) {
      orbCtx.clearRect(0, 0, orbSize, orbSize);

      var breatheT = (t % (orbBreatheDuration * 2)) / (orbBreatheDuration * 2);
      var breathe = (Math.sin(breatheT * Math.PI * 2 - Math.PI / 2) + 1) / 2;
      var scale = 0.94 + breathe * (1.06 - 0.94);

      var rotateT = (t % orbRotateDuration) / orbRotateDuration;
      var rotation = rotateT * Math.PI * 2;

      orbCtx.save();
      orbCtx.translate(orbCenter, orbCenter);
      orbCtx.rotate(rotation);
      orbCtx.scale(scale, scale);

      orbParticles.forEach(function (p) {
        var shimmer = (Math.sin(t * p.speed + p.phase) + 1) / 2;
        var opacity = p.minOpacity + shimmer * (p.maxOpacity - p.minOpacity);
        orbCtx.beginPath();
        orbCtx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        orbCtx.fillStyle = "rgba(28,28,28," + opacity + ")";
        orbCtx.fill();
      });

      orbCtx.restore();
      if (!orbReduceMotion) requestAnimationFrame(orbFrame);
    };

    requestAnimationFrame(orbFrame);
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

  /* ---- Footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
