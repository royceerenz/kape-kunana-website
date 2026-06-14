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

const menuCarousel = document.querySelector("[data-menu-carousel]");

if (menuCarousel) {
  const cards = [...menuCarousel.querySelectorAll("[data-menu-card]")];
  const dots = [...menuCarousel.querySelectorAll("[data-menu-dot]")];
  const prevButton = menuCarousel.querySelector("[data-menu-prev]");
  const nextButton = menuCarousel.querySelector("[data-menu-next]");
  let activeMenuIndex = 0;
  let dragStartX = null;
  let autoplayTimer = null;
  const autoplayDelay = 3600;

  const getLoopOffset = (index) => {
    const rawOffset = index - activeMenuIndex;
    const half = Math.floor(cards.length / 2);

    if (rawOffset > half) {
      return rawOffset - cards.length;
    }

    if (rawOffset < -half) {
      return rawOffset + cards.length;
    }

    return rawOffset;
  };

  const renderMenuCarousel = () => {
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const spacing = isMobile ? 88 : 116;

    cards.forEach((card, index) => {
      const offset = getLoopOffset(index);
      const absOffset = Math.abs(offset);
      const x = offset * spacing;
      const y = absOffset * (isMobile ? 2 : 4);
      const rotateZ = offset * (isMobile ? -1.8 : -1.25);
      const scale = Math.max(isMobile ? 0.78 : 0.84, 1 - absOffset * (isMobile ? 0.08 : 0.035));
      const opacity = absOffset > (isMobile ? 2 : 3) ? 0 : Math.max(0.58, 1 - absOffset * 0.08);

      card.classList.toggle("is-active", offset === 0);
      card.style.zIndex = String(20 - absOffset);
      card.style.opacity = opacity;
      card.style.filter = absOffset === 0 ? "none" : "saturate(0.9) contrast(0.96)";
      card.style.transform = `translate3d(calc(-50% + ${x}%), calc(-50% + ${y}px), 0) rotateZ(${rotateZ}deg) scale(${scale})`;
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeMenuIndex);
    });
  };

  const setMenuIndex = (index) => {
    activeMenuIndex = (index + cards.length) % cards.length;
    renderMenuCarousel();
  };

  const stopAutoplay = () => {
    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  const startAutoplay = () => {
    if (autoplayTimer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    autoplayTimer = window.setInterval(() => {
      setMenuIndex(activeMenuIndex + 1);
    }, autoplayDelay);
  };

  const restartAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  prevButton?.addEventListener("click", () => {
    setMenuIndex(activeMenuIndex - 1);
    restartAutoplay();
  });

  nextButton?.addEventListener("click", () => {
    setMenuIndex(activeMenuIndex + 1);
    restartAutoplay();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      setMenuIndex(Number(dot.dataset.menuDot));
      restartAutoplay();
    });
  });

  menuCarousel.addEventListener("pointerdown", (event) => {
    stopAutoplay();
    dragStartX = event.clientX;
  });

  menuCarousel.addEventListener("pointerup", (event) => {
    if (dragStartX === null) {
      return;
    }

    const delta = event.clientX - dragStartX;
    dragStartX = null;

    if (Math.abs(delta) > 42) {
      setMenuIndex(activeMenuIndex + (delta < 0 ? 1 : -1));
    }

    startAutoplay();
  });

  menuCarousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      setMenuIndex(activeMenuIndex - 1);
      restartAutoplay();
    }

    if (event.key === "ArrowRight") {
      setMenuIndex(activeMenuIndex + 1);
      restartAutoplay();
    }
  });

  menuCarousel.addEventListener("mouseenter", stopAutoplay);
  menuCarousel.addEventListener("mouseleave", startAutoplay);
  menuCarousel.addEventListener("focusin", stopAutoplay);
  menuCarousel.addEventListener("focusout", startAutoplay);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  window.addEventListener("resize", renderMenuCarousel);
  renderMenuCarousel();
  startAutoplay();
}

const initStoryAnimations = () => {
  const storySection = document.querySelector(".our-story");
  const canAnimateStory = storySection && window.gsap && window.ScrollTrigger && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canAnimateStory) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const storyImages = gsap.utils.toArray("[data-story-image]");

  if (!storyImages.length) {
    return;
  }

  const getDistance = (multiplier) => Math.round(window.innerWidth * multiplier);
  const getStoryTransitionOverlap = () => {
    const overlapRatio = window.matchMedia("(max-width: 760px)").matches ? 0.28 : 0.42;

    return Math.round(window.innerHeight * overlapRatio);
  };

  const fromStates = [
    () => ({ x: getDistance(0.58), y: -18, z: -120, rotationY: -22, rotationZ: 5, scale: 0.88, opacity: 0.48 }),
    () => ({ x: getDistance(0.72), y: 32, z: 70, rotationY: -30, rotationZ: -4, scale: 1.04, opacity: 0.54 }),
    () => ({ x: getDistance(0.64), y: 96, z: -40, rotationY: -18, rotationZ: 7, scale: 0.92, opacity: 0.48 }),
    () => ({ x: getDistance(0.82), y: -84, z: 110, rotationY: -34, rotationZ: 3, scale: 0.86, opacity: 0.46 }),
    () => ({ x: getDistance(0.48), y: 52, z: -180, rotationY: -16, rotationZ: -8, scale: 0.8, opacity: 0.42 }),
  ];

  const toStates = [
    () => ({ x: 0, y: -8, z: 70, rotationY: 8, rotationZ: -3, scale: 1, opacity: 0.78 }),
    () => ({ x: 0, y: 6, z: -70, rotationY: 10, rotationZ: 3, scale: 0.96, opacity: 0.62 }),
    () => ({ x: 0, y: 0, z: 90, rotationY: 7, rotationZ: -4, scale: 1, opacity: 0.72 }),
    () => ({ x: 0, y: -10, z: -80, rotationY: 12, rotationZ: 2, scale: 0.92, opacity: 0.54 }),
    () => ({ x: 0, y: 8, z: 40, rotationY: 6, rotationZ: 5, scale: 0.94, opacity: 0.6 }),
  ];

  storyImages.forEach((image, index) => {
    gsap.set(image, {
      ...fromStates[index % fromStates.length](),
      transformPerspective: 1200,
      transformOrigin: "center center",
    });
  });

  const storyCarousel = gsap.timeline({
    scrollTrigger: {
      trigger: storySection,
      start: "top top",
      end: () => `bottom-=${getStoryTransitionOverlap()} bottom`,
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  });

  storyImages.forEach((image, index) => {
    storyCarousel.to(image, {
      ...toStates[index % toStates.length](),
      ease: "none",
      duration: 1,
    }, 0);
  });

  ScrollTrigger.refresh();
  window.setTimeout(() => ScrollTrigger.refresh(), 250);
};

const initTestimonialAnimations = () => {
  const testimonialSection = document.querySelector(".testimonials");
  const canAnimateTestimonials = testimonialSection && window.gsap && window.ScrollTrigger && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canAnimateTestimonials) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.from("[data-testimonial-reveal]", {
    y: 34,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
    scrollTrigger: {
      trigger: testimonialSection,
      start: "top 72%",
    },
  });

  gsap.from("[data-testimonial-card]", {
    y: 42,
    opacity: 0,
    scale: 0.97,
    duration: 0.8,
    ease: "power3.out",
    stagger: 0.1,
    scrollTrigger: {
      trigger: ".testimonial-grid",
      start: "top 78%",
    },
  });
};

const initLocationAnimations = () => {
  const locationSection = document.querySelector(".location-hours");
  const canAnimateLocation = locationSection && window.gsap && window.ScrollTrigger && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canAnimateLocation) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.from("[data-location-reveal]", {
    y: 34,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
    stagger: 0.08,
    scrollTrigger: {
      trigger: locationSection,
      start: "top 72%",
    },
  });

  gsap.from("[data-location-map]", {
    y: 48,
    opacity: 0,
    scale: 0.96,
    duration: 0.9,
    ease: "power3.out",
    scrollTrigger: {
      trigger: locationSection,
      start: "top 68%",
    },
  });

  gsap.to("[data-location-map]", {
    yPercent: -3,
    ease: "none",
    scrollTrigger: {
      trigger: locationSection,
      start: "top bottom",
      end: "bottom top",
      scrub: 0.8,
    },
  });
};

const initFooterAnimations = () => {
  const footer = document.querySelector(".site-footer");
  const canAnimateFooter = footer && window.gsap && window.ScrollTrigger && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canAnimateFooter) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.from("[data-footer-reveal]", {
    y: 24,
    opacity: 0,
    duration: 0.75,
    ease: "power3.out",
    stagger: 0.08,
    scrollTrigger: {
      trigger: footer,
      start: "top 78%",
    },
  });
};

if (document.readyState === "complete") {
  requestAnimationFrame(initStoryAnimations);
  requestAnimationFrame(initTestimonialAnimations);
  requestAnimationFrame(initLocationAnimations);
  requestAnimationFrame(initFooterAnimations);
} else {
  window.addEventListener("load", () => {
    requestAnimationFrame(initStoryAnimations);
    requestAnimationFrame(initTestimonialAnimations);
    requestAnimationFrame(initLocationAnimations);
    requestAnimationFrame(initFooterAnimations);
  }, { once: true });
}
