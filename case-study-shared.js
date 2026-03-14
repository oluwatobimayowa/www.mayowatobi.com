document.addEventListener("DOMContentLoaded", function () {
  var sidebar = document.querySelector(".w2-sidebar");

  if (!sidebar) {
    return;
  }

  var activeTrigger = sidebar.querySelector(".w2-sidebar-btn.active");

  if (!activeTrigger) {
    return;
  }

  var mobileQuery = window.matchMedia("(max-width: 600px)");
  var backdrop = document.createElement("button");
  backdrop.type = "button";
  backdrop.className = "case-study-nav-backdrop";
  backdrop.setAttribute("aria-label", "Close case study navigation");
  document.body.appendChild(backdrop);

  function isMobile() {
    return mobileQuery.matches;
  }

  function closeNav() {
    sidebar.classList.remove("is-open");
    document.body.classList.remove("case-study-nav-open");
    activeTrigger.setAttribute("aria-expanded", "false");
  }

  function openNav() {
    if (!isMobile()) {
      return;
    }

    sidebar.classList.add("is-open");
    document.body.classList.add("case-study-nav-open");
    activeTrigger.setAttribute("aria-expanded", "true");
  }

  function syncMode() {
    if (isMobile()) {
      document.body.classList.add("case-study-nav-ready");
      activeTrigger.setAttribute("aria-haspopup", "dialog");
      activeTrigger.setAttribute("aria-expanded", sidebar.classList.contains("is-open") ? "true" : "false");
      return;
    }

    closeNav();
    document.body.classList.remove("case-study-nav-ready");
    activeTrigger.removeAttribute("aria-haspopup");
    activeTrigger.removeAttribute("aria-expanded");
  }

  activeTrigger.addEventListener("click", function (event) {
    if (!isMobile()) {
      return;
    }

    event.preventDefault();

    if (sidebar.classList.contains("is-open")) {
      closeNav();
      return;
    }

    openNav();
  });

  backdrop.addEventListener("click", closeNav);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeNav();
    }
  });

  mobileQuery.addEventListener("change", syncMode);
  syncMode();
});
