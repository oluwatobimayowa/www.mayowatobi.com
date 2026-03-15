(() => {
  const WORK_TARGET = "/zalando-contextual-personalization";
  const CASE_STUDY_PATH = /\/(zalando-contextual-personalization|zalando-unified-sso|zalando-complete-the-look|busha-selected-works)(?:\.html)?\/?$/;

  const workLinkSelector = [
    'a[data-framer-name="Work"]',
    'a[href="work.html"]',
    'a[href="./work.html"]',
    'a[href="/work"]',
    'a[href="work"]',
  ].join(", ");

  const patchWorkLinks = () => {
    document.querySelectorAll(workLinkSelector).forEach((link) => {
      if (!(link instanceof HTMLAnchorElement)) return;
      link.setAttribute("href", WORK_TARGET);
      link.dataset.workNavPatched = "true";
    });
  };

  const patchCaseStudyReading = () => {
    if (!CASE_STUDY_PATH.test(window.location.pathname)) return;

    if (!document.getElementById("case-study-reading-fix")) {
      const style = document.createElement("style");
      style.id = "case-study-reading-fix";
      style.textContent = `
        .framer-1ntuiii-container,
        .framer-1ntuiii-container > .ssr-variant,
        .framer-1ntuiii-container > .ssr-variant > [data-framer-name="desktop"],
        .framer-chqany,
        .framer-1pkp4mu,
        .framer-1i11eel-container {
          position: relative;
          overflow: visible !important;
          z-index: 40;
        }

        .framer-1i11eel-container [data-framer-name="Available for new projects"],
        .framer-1i11eel-container [data-framer-name="Available for new projects"] .framer-text {
          color: #fff !important;
          --framer-text-color: #fff !important;
          --extracted-r6o4lv: #fff !important;
          --variable-reference-Shm0RqnCk-xqlGn3fpu: #fff !important;
        }

        .case-study-reading-float {
          position: fixed;
          top: 0;
          left: 0;
          width: 140px;
          aspect-ratio: 820 / 1248;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
          opacity: 0;
          transform: translateY(-8px);
          pointer-events: none;
          z-index: 2147483647;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .case-study-reading-float img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .case-study-reading-float.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `;
      document.head.appendChild(style);
    }

    let preview = document.getElementById("case-study-reading-float");
    if (!preview) {
      preview = document.createElement("div");
      preview.id = "case-study-reading-float";
      preview.className = "case-study-reading-float";

      const image = document.createElement("img");
      image.src = "/our-dollar-your-problem.jpeg";
      image.alt = "";
      preview.appendChild(image);
      document.body.appendChild(preview);
    }

    const positionPreview = (container) => {
      const rect = container.getBoundingClientRect();
      preview.style.top = `${rect.bottom + 12}px`;
      preview.style.left = `${rect.right - 140}px`;
    };

    document.querySelectorAll(".framer-1i11eel-container").forEach((container) => {
      if (!(container instanceof HTMLElement)) return;
      if (container.dataset.readingPreviewBound === "true") return;

      container.dataset.readingPreviewBound = "true";

      const showPreview = () => {
        positionPreview(container);
        preview.classList.add("is-visible");
      };

      const hidePreview = () => {
        preview.classList.remove("is-visible");
      };

      const movePreview = () => {
        if (!preview.classList.contains("is-visible")) return;
        positionPreview(container);
      };

      container.addEventListener("mouseenter", showPreview);
      container.addEventListener("mousemove", movePreview);
      container.addEventListener("mouseleave", hidePreview);
      container.addEventListener("focusin", showPreview);
      container.addEventListener("focusout", hidePreview);
    });
  };

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest(workLinkSelector);
      if (!(link instanceof HTMLAnchorElement)) return;

      event.preventDefault();
      event.stopPropagation();
      window.location.href = WORK_TARGET;
    },
    true
  );

  patchWorkLinks();
  patchCaseStudyReading();

  const observer = new MutationObserver(() => {
    patchWorkLinks();
    patchCaseStudyReading();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
