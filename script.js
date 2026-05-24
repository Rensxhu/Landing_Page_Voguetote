document.addEventListener("DOMContentLoaded", () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const header = document.querySelector(".site-header");
    const navLinks = Array.from(document.querySelectorAll(".nav-link[href^='#']"));
    const internalLinks = Array.from(document.querySelectorAll("a[href^='#']"));
    const revealItems = Array.from(document.querySelectorAll(".reveal"));
    const navCollapse = document.querySelector("#mainNav");

    const headerOffset = () => (header ? header.offsetHeight : 0);

    const hashToId = (hash) => {
        if (!hash || hash === "#") {
            return "";
        }

        const rawId = hash.slice(1);

        try {
            return decodeURIComponent(rawId);
        } catch {
            return rawId;
        }
    };

    const getTargetFromHash = (hash) => {
        const id = hashToId(hash);
        return id ? document.getElementById(id) : null;
    };

    const focusTarget = (target) => {
        if (!target || typeof target.focus !== "function") {
            return;
        }

        const hadTabIndex = target.hasAttribute("tabindex");

        if (!hadTabIndex) {
            target.setAttribute("tabindex", "-1");
        }

        target.focus({ preventScroll: true });

        if (!hadTabIndex) {
            target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
        }
    };

    const setActiveLink = (id) => {
        navLinks.forEach((link) => {
            const isActive = link.getAttribute("href") === `#${id}`;
            link.classList.toggle("active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    };

    internalLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            if (link.hasAttribute("data-placeholder-link")) {
                event.preventDefault();
                return;
            }

            const targetId = link.getAttribute("href");
            const target = getTargetFromHash(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            const targetTop = Math.max(target.getBoundingClientRect().top + window.pageYOffset - headerOffset() + 2, 0);

            window.scrollTo({
                top: targetTop,
                behavior: prefersReducedMotion ? "auto" : "smooth"
            });

            focusTarget(target);

            if (target.id) {
                setActiveLink(target.id);
            }

            if (window.history.pushState) {
                window.history.pushState(null, "", targetId);
            }

            if (navCollapse && navCollapse.classList.contains("show") && window.bootstrap) {
                window.bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
            }
        });
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
    } else {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.18
        });

        revealItems.forEach((item) => revealObserver.observe(item));
    }

    const sections = navLinks
        .map((link) => getTargetFromHash(link.getAttribute("href")))
        .filter(Boolean);

    const initialTarget = getTargetFromHash(window.location.hash);

    if (initialTarget && sections.includes(initialTarget)) {
        setActiveLink(initialTarget.id);
    } else if (sections[0]) {
        setActiveLink(sections[0].id);
    }

    if ("IntersectionObserver" in window && sections.length) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveLink(entry.target.id);
                }
            });
        }, {
            rootMargin: "-35% 0px -55% 0px",
            threshold: 0
        });

        sections.forEach((section) => sectionObserver.observe(section));
    }
});
