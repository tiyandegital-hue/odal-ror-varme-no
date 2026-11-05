/* Odal Rør og Varme AS — site behaviour.
   BUSINESS_NAME is the ONE swappable constant for the business name;
   every JS-generated string that names the business uses it. */
const BUSINESS_NAME = "Odal Rør og Varme AS";

(function () {
  "use strict";

  /* Mobile nav */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) nav.classList.remove("open");
    });
  }

  /* Reveal on scroll (rest state is visible if JS/IO fails — elements start
     visible in CSS only when .reveal is added by JS below) */
  var revealEls = document.querySelectorAll("[data-reveal]");
  revealEls.forEach(function (el) { el.classList.add("reveal"); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* Hero pipe-line draw-on: animate the dashed line's stroke-dashoffset */
  var pipe = document.getElementById("pipe-line-path");
  if (pipe) {
    var len = pipe.getTotalLength ? pipe.getTotalLength() : 1200;
    pipe.style.strokeDasharray = len;
    pipe.style.strokeDashoffset = len;
    requestAnimationFrame(function () {
      pipe.style.transition = "stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1) .2s";
      pipe.style.strokeDashoffset = "0";
    });
  }

  /* FAQ single-open accordion */
  var faqs = document.querySelectorAll("details.faq");
  faqs.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) {
        faqs.forEach(function (other) { if (other !== d) other.removeAttribute("open"); });
      }
    });
  });

  /* Quote form: prefill service from ?tjeneste=, file list, validation,
     confirmation state (demo — no backend endpoint yet). */
  var form = document.getElementById("quote-form");
  if (form) {
    var service = document.getElementById("f-service");
    var params = new URLSearchParams(window.location.search);
    var pre = params.get("tjeneste");
    if (service && pre) {
      var opt = service.querySelector('option[value="' + pre + '"]');
      if (opt) service.value = pre;
    }

    var fileInput = document.getElementById("f-photos");
    var fileList = document.getElementById("file-list");
    var dropzone = document.getElementById("dropzone");
    if (fileInput && fileList) {
      fileInput.addEventListener("change", function () {
        fileList.innerHTML = "";
        Array.prototype.forEach.call(fileInput.files, function (f) {
          var row = document.createElement("div");
          row.textContent = f.name + " (" + Math.round(f.size / 1024) + " KB)";
          fileList.appendChild(row);
        });
      });
    }
    if (dropzone && fileInput) {
      ["dragenter", "dragover"].forEach(function (ev) {
        dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.add("drag"); });
      });
      ["dragleave", "drop"].forEach(function (ev) {
        dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.remove("drag"); });
      });
      dropzone.addEventListener("drop", function (e) {
        if (e.dataTransfer && e.dataTransfer.files.length) {
          fileInput.files = e.dataTransfer.files;
          fileInput.dispatchEvent(new Event("change"));
        }
      });
      dropzone.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      var firstBad = null;
      form.querySelectorAll("[data-required]").forEach(function (field) {
        var wrap = field.closest(".field");
        var bad = false;
        if (field.type === "checkbox") { bad = !field.checked; }
        else if (field.tagName === "SELECT") { bad = !field.value; }
        else if (field.type === "email") { bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim()); }
        else if (field.type === "tel") { bad = field.value.replace(/\D/g, "").length < 8; }
        else { bad = !field.value.trim(); }
        if (wrap) wrap.classList.toggle("invalid", bad);
        if (bad) { valid = false; if (!firstBad) firstBad = field; }
      });
      if (!valid) {
        if (firstBad) firstBad.focus();
        return;
      }
      var name = (document.getElementById("f-name") || {}).value || "";
      var firstName = name.trim().split(/\s+/)[0];
      var confirmBox = document.getElementById("form-success");
      var confirmText = document.getElementById("form-success-text");
      if (confirmText) {
        confirmText.textContent = (firstName ? "Takk, " + firstName + ". " : "Takk. ") +
          "Forespørselen din er mottatt av " + BUSINESS_NAME +
          ". Vi ser over beskrivelsen og tar kontakt så raskt vi kan.";
      }
      form.closest(".form-fields").style.display = "none";
      if (confirmBox) confirmBox.classList.add("show");
      confirmBox.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
})();
