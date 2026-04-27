import { useEffect } from "react";

export default function useReveal({ selector = "[data-reveal]" } = {}) {
  useEffect(() => {
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    let io = null;
    const seen = new WeakSet();
    let failOpenTimer = null;

    if (reducedMotion) {
      const apply = (root = document) => {
        root.querySelectorAll?.(selector)?.forEach?.((n) => n.classList.add("is-in"));
      };
      apply();
      const mo = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of m.addedNodes) {
            if (node?.nodeType === 1) apply(node);
          }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -12% 0px" }
    );

    const observeAll = (root = document) => {
      root.querySelectorAll?.(selector)?.forEach?.((n) => {
        if (n.classList.contains("is-in")) return;
        if (seen.has(n)) return;
        seen.add(n);
        n.classList.add("reveal-init");
        io.observe(n);
      });
    };

    observeAll();

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node?.nodeType === 1) observeAll(node);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // Fail-open: never leave content stuck invisible if IO doesn't fire.
    failOpenTimer = window.setTimeout(() => {
      document.querySelectorAll?.(`${selector}.reveal-init:not(.is-in)`)?.forEach?.((n) => n.classList.add("is-in"));
    }, 1200);

    return () => {
      mo.disconnect();
      if (failOpenTimer) window.clearTimeout(failOpenTimer);
      io.disconnect();
    };
  }, [selector]);
}
