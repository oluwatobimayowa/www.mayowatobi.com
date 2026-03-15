document.addEventListener("DOMContentLoaded", function () {
  var ENABLE_SCROLL_COLLAPSE = false;
  var sidebar = document.querySelector(".case-nav");
  var scrollResetTimer = null;

  if (!sidebar) {
    return;
  }

  var activeTrigger = sidebar.querySelector(".case-nav-btn.active");

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

  function setScrollingState(isScrolling) {
    document.body.classList.toggle("case-study-nav-scrolling", isScrolling);
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

    setScrollingState(false);
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

    setScrollingState(false);
    closeNav();
    document.body.classList.remove("case-study-nav-ready");
    activeTrigger.removeAttribute("aria-haspopup");
    activeTrigger.removeAttribute("aria-expanded");
  }

  function handleScroll() {
    if (!ENABLE_SCROLL_COLLAPSE) {
      return;
    }

    if (!isMobile() || sidebar.classList.contains("is-open")) {
      return;
    }

    setScrollingState(true);

    if (scrollResetTimer) {
      window.clearTimeout(scrollResetTimer);
    }

    scrollResetTimer = window.setTimeout(function () {
      setScrollingState(false);
    }, 180);
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

  window.addEventListener("scroll", handleScroll, { passive: true });
  mobileQuery.addEventListener("change", syncMode);
  syncMode();
});
