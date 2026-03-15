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

        .framer-1i11eel-container.case-study-reading-preview {
          isolation: isolate;
        }

        .framer-1i11eel-container [data-framer-name="Available for new projects"],
        .framer-1i11eel-container [data-framer-name="Available for new projects"] .framer-text {
          color: #fff !important;
          --framer-text-color: #fff !important;
          --extracted-r6o4lv: #fff !important;
          --variable-reference-Shm0RqnCk-xqlGn3fpu: #fff !important;
        }

        .framer-1i11eel-container.case-study-reading-preview::after {
          content: "";
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 140px;
          aspect-ratio: 820 / 1248;
          background: url("/our-dollar-your-problem.jpeg") center center / cover no-repeat;
          border-radius: 16px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
          opacity: 0;
          transform: translateY(-8px);
          pointer-events: none;
          z-index: 41;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .framer-1i11eel-container.case-study-reading-preview:hover::after,
        .framer-1i11eel-container.case-study-reading-preview:focus-within::after {
          opacity: 1;
          transform: translateY(0);
        }
      `;
      document.head.appendChild(style);
    }

    document
      .querySelectorAll(".framer-1i11eel-container")
      .forEach((container) => {
        container.classList.add("case-study-reading-preview");
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
