const slideRoot = document.querySelector("[data-scroll-slides]");

if (slideRoot) {
  const slideCopies = [...slideRoot.querySelectorAll("[data-slide-copy]")];
  const slideMedia = [...slideRoot.querySelectorAll("[data-slide-media]")];
  const slideSteps = [...slideRoot.querySelectorAll("[data-slide-step]")];
  const slideNav = [...slideRoot.querySelectorAll("[data-slide-nav]")];
  const slideCurrent = slideRoot.querySelector("[data-slide-current]");
  let activeIndex = 0;

  const setActiveSlide = (index) => {
    if (index === activeIndex && slideCopies[index]?.classList.contains("is-active")) {
      return;
    }

    activeIndex = index;

    slideCopies.forEach((item, itemIndex) => {
      item.classList.toggle("is-active", itemIndex === index);
    });

    slideMedia.forEach((item, itemIndex) => {
      item.classList.toggle("is-active", itemIndex === index);
    });

    slideNav.forEach((item, itemIndex) => {
      item.classList.toggle("is-active", itemIndex === index);
    });

    if (slideCurrent) {
      slideCurrent.textContent = String(index + 1).padStart(2, "0");
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const activeEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (activeEntry) {
        setActiveSlide(Number(activeEntry.target.dataset.slideStep));
      }
    },
    {
      rootMargin: "-42% 0px -42% 0px",
      threshold: [0, 0.2, 0.5, 0.8, 1],
    }
  );

  slideSteps.forEach((step) => observer.observe(step));

  slideNav.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.slideNav);
      slideSteps[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
      setActiveSlide(index);
    });
  });

  const updateParallax = () => {
    const rect = slideRoot.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - window.innerHeight)));
    const offset = (progress - 0.5) * 42;

    slideRoot.style.setProperty("--slide-parallax", `${offset}px`);
    requestAnimationFrame(updateParallax);
  };

  setActiveSlide(0);

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    requestAnimationFrame(updateParallax);
  }
}

const canAnimateStory = window.gsap && window.ScrollTrigger && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canAnimateStory) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.from("[data-story-reveal]", {
    y: 34,
    opacity: 0,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.12,
    scrollTrigger: {
      trigger: ".our-story",
      start: "top 70%",
    },
  });

  gsap.from("[data-story-image]", {
    y: 48,
    opacity: 0,
    scale: 0.96,
    duration: 1,
    ease: "power3.out",
    stagger: 0.14,
    scrollTrigger: {
      trigger: ".story-editorial",
      start: "top 76%",
    },
  });

  gsap.to(".our-story", {
    "--story-parallax": "-38px",
    ease: "none",
    scrollTrigger: {
      trigger: ".our-story",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
}
