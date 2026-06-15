const compactScreen = window.matchMedia("(max-width: 760px)");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const initMobileReveals = () => {
  if (!compactScreen.matches || reduceMotion.matches || !("IntersectionObserver" in window)) {
    return;
  }

  const revealItems = [
    ".benefit-list li",
    ".menu-preview-heading",
    "[data-menu-carousel]",
    ".menu-preview-cta",
    "[data-testimonial-reveal]",
    "[data-location-reveal]",
    "[data-location-map]",
    ".booking-inner > *",
    "[data-footer-reveal]",
  ];

  const targets = [...document.querySelectorAll(revealItems.join(","))]
    .filter((item, index, items) => items.indexOf(item) === index);

  targets.forEach((item, index) => {
    item.classList.add("mobile-reveal");
    item.style.setProperty("--mobile-reveal-delay", `${Math.min(index % 6, 5) * 55}ms`);
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.18,
    }
  );

  targets.forEach((item) => revealObserver.observe(item));
};

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const navbar = document.querySelector(".navbar");

if (navToggle && navLinks) {
  const setMenuOpen = (isOpen) => {
    navToggle.classList.toggle("is-open", isOpen);
    navLinks.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  };

  navToggle.addEventListener("click", () => {
    setMenuOpen(!navLinks.classList.contains("is-open"));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  });

  document.addEventListener("click", (event) => {
    if (!navbar?.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  compactScreen.addEventListener("change", (event) => {
    if (!event.matches) {
      setMenuOpen(false);
    }
  });
}

const initEventInquiryModal = () => {
  const modal = document.querySelector("[data-event-modal]");
  const form = document.querySelector("[data-event-form]");
  const triggers = [...document.querySelectorAll("[data-event-inquiry-trigger]")];

  if (!modal || !form || !triggers.length) {
    return;
  }

  const closeControls = [...modal.querySelectorAll("[data-event-modal-close]")];
  const firstInput = form.querySelector("input, textarea, button");
  const requiredFields = [
    "fullName",
    "contactNumber",
    "eventDate",
    "eventLocation",
    "eventType",
    "estimatedGuests",
  ];
  const fieldLabels = {
    fullName: "Full Name",
    contactNumber: "Contact Number",
    eventDate: "Event Date",
    eventLocation: "Event Location",
    eventType: "Event Type",
    estimatedGuests: "Estimated Number of Guests",
  };
  const messengerBaseUrl = "https://m.me/KapeKunana";
  let previousFocus = null;

  const clearErrors = () => {
    form.querySelectorAll(".event-field.is-invalid").forEach((field) => {
      field.classList.remove("is-invalid");
    });

    form.querySelectorAll("[data-error-for]").forEach((error) => {
      error.textContent = "";
    });
  };

  const setModalOpen = (isOpen) => {
    modal.classList.toggle("is-open", isOpen);
    modal.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("event-modal-open", isOpen);

    if (isOpen) {
      previousFocus = document.activeElement;
      clearErrors();
      window.setTimeout(() => firstInput?.focus(), 120);
      return;
    }

    previousFocus?.focus?.();
  };

  const getField = (name) => form.elements[name];

  const validateForm = () => {
    clearErrors();

    const invalidFields = requiredFields.filter((name) => {
      const field = getField(name);
      const value = field?.value?.trim() || "";

      if (!value) {
        return true;
      }

      if (name === "estimatedGuests" && Number(value) < 1) {
        return true;
      }

      return false;
    });

    invalidFields.forEach((name) => {
      const field = getField(name);
      const wrapper = field?.closest(".event-field");
      const error = form.querySelector(`[data-error-for="${name}"]`);

      wrapper?.classList.add("is-invalid");

      if (error) {
        error.textContent = `${fieldLabels[name]} is required.`;
      }
    });

    if (invalidFields.length) {
      getField(invalidFields[0])?.focus();
    }

    return invalidFields.length === 0;
  };

  const buildMessengerMessage = () => {
    const values = {
      fullName: getField("fullName").value.trim(),
      contactNumber: getField("contactNumber").value.trim(),
      eventDate: getField("eventDate").value.trim(),
      eventLocation: getField("eventLocation").value.trim(),
      eventType: getField("eventType").value.trim(),
      estimatedGuests: getField("estimatedGuests").value.trim(),
      additionalNotes: getField("additionalNotes").value.trim() || "None",
    };

    return [
      "Hello Kape Kunana!",
      "",
      "I\u2019d like to inquire about your coffee bar service.",
      "",
      `Name: ${values.fullName}`,
      `Contact Number: ${values.contactNumber}`,
      `Event Date: ${values.eventDate}`,
      `Event Location: ${values.eventLocation}`,
      `Event Type: ${values.eventType}`,
      `Estimated Guests: ${values.estimatedGuests}`,
      `Additional Notes: ${values.additionalNotes}`,
    ].join("\n");
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      setModalOpen(true);
    });
  });

  closeControls.forEach((control) => {
    control.addEventListener("click", () => {
      setModalOpen(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      setModalOpen(false);
    }
  });

  form.addEventListener("input", (event) => {
    const field = event.target.closest("input, textarea");

    if (!field) {
      return;
    }

    field.closest(".event-field")?.classList.remove("is-invalid");

    const error = form.querySelector(`[data-error-for="${field.name}"]`);

    if (error) {
      error.textContent = "";
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const encodedMessage = encodeURIComponent(buildMessengerMessage());
    const messengerUrl = `${messengerBaseUrl}?text=${encodedMessage}`;

    window.open(messengerUrl, "_blank", "noopener,noreferrer");
  });
};

initEventInquiryModal();

const slideRoot = document.querySelector("[data-scroll-slides]");

if (slideRoot) {
  const slideCopies = [...slideRoot.querySelectorAll("[data-slide-copy]")];
  const slideMedia = [...slideRoot.querySelectorAll("[data-slide-media]")];
  const slideNav = [...slideRoot.querySelectorAll("[data-slide-nav]")];
  const slideCurrent = slideRoot.querySelector("[data-slide-current]");
  let activeIndex = 0;
  let slideTrigger = null;

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

  const getScrollDistance = () => {
    const slideCount = Math.max(1, slideCopies.length - 1);
    const viewport = window.innerHeight || document.documentElement.clientHeight || 720;

    return Math.round(viewport * slideCount);
  };

  const setSlideFromProgress = (progress) => {
    const lastIndex = Math.max(0, slideCopies.length - 1);
    const index = Math.min(lastIndex, Math.max(0, Math.round(progress * lastIndex)));

    setActiveSlide(index);
  };

  if (window.gsap && window.ScrollTrigger && !reduceMotion.matches) {
    gsap.registerPlugin(ScrollTrigger);

    slideTrigger = ScrollTrigger.create({
      trigger: slideRoot,
      start: "top top",
      end: () => `+=${getScrollDistance()}`,
      pin: true,
      pinSpacing: true,
      scrub: 0.45,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        setSlideFromProgress(self.progress);
        slideRoot.style.setProperty("--slide-parallax", `${(self.progress - 0.5) * 34}px`);
      },
      onRefresh: (self) => {
        setSlideFromProgress(self.progress);
      },
    });
  }

  slideNav.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.slideNav);

      if (slideTrigger) {
        const lastIndex = Math.max(1, slideCopies.length - 1);
        const progress = index / lastIndex;
        const scrollTarget = slideTrigger.start + (slideTrigger.end - slideTrigger.start) * progress;

        window.scrollTo({
          top: scrollTarget,
          behavior: reduceMotion.matches ? "auto" : "smooth",
        });
      }

      if (!slideTrigger) {
        setActiveSlide(index);
      }
    });
  });

  setActiveSlide(0);
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
    const isMobile = compactScreen.matches;
    const spacing = isMobile ? 74 : 116;

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
    if (autoplayTimer || reduceMotion.matches) {
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

  menuCarousel.addEventListener("pointercancel", () => {
    dragStartX = null;
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

  compactScreen.addEventListener("change", () => {
    stopAutoplay();
    renderMenuCarousel();
    startAutoplay();
  });

  window.addEventListener("resize", renderMenuCarousel);
  renderMenuCarousel();
  startAutoplay();
}

const initStoryAnimations = () => {
  const storySection = document.querySelector(".our-story");
  const menuPreview = document.querySelector(".menu-preview");
  const canAnimateStory = storySection && window.gsap && window.ScrollTrigger && !reduceMotion.matches;

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

  if (compactScreen.matches && menuPreview) {
    gsap.set(menuPreview, {
      "--menu-overlap-y": "18svh",
    });

    gsap.to(menuPreview, {
      "--menu-overlap-y": "0svh",
      ease: "none",
      scrollTrigger: {
        trigger: storySection,
        start: "bottom bottom+=45%",
        end: "bottom bottom",
        scrub: 0.65,
        invalidateOnRefresh: true,
      },
    });
  }

  ScrollTrigger.refresh();
  window.setTimeout(() => ScrollTrigger.refresh(), 250);
};

const initTestimonialAnimations = () => {
  const testimonialSection = document.querySelector(".testimonials");
  const canAnimateTestimonials = testimonialSection && window.gsap && window.ScrollTrigger && !reduceMotion.matches && !compactScreen.matches;

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

const initTestimonialCarousel = () => {
  const testimonialGrid = document.querySelector(".testimonial-grid");

  if (!testimonialGrid) {
    return;
  }

  const cards = [...testimonialGrid.querySelectorAll("[data-testimonial-card]")];
  const dots = [...document.querySelectorAll("[data-testimonial-dot]")];
  const prevButton = document.querySelector("[data-testimonial-prev]");
  const nextButton = document.querySelector("[data-testimonial-next]");
  let activeIndex = 0;
  let dragStartX = null;

  if (!cards.length) {
    return;
  }

  const renderCarousel = () => {
    const isMobile = compactScreen.matches;

    cards.forEach((card, index) => {
      const isActive = index === activeIndex;

      card.classList.toggle("is-active", !isMobile || isActive);
      card.classList.toggle("is-before", isMobile && index < activeIndex);
      card.setAttribute("aria-hidden", String(isMobile && !isActive));
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
    });
  };

  const setTestimonialIndex = (index) => {
    activeIndex = (index + cards.length) % cards.length;
    renderCarousel();
  };

  prevButton?.addEventListener("click", () => {
    setTestimonialIndex(activeIndex - 1);
  });

  nextButton?.addEventListener("click", () => {
    setTestimonialIndex(activeIndex + 1);
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      setTestimonialIndex(Number(dot.dataset.testimonialDot));
    });
  });

  testimonialGrid.addEventListener("pointerdown", (event) => {
    if (!compactScreen.matches) {
      return;
    }

    dragStartX = event.clientX;
  });

  testimonialGrid.addEventListener("pointerup", (event) => {
    if (dragStartX === null || !compactScreen.matches) {
      dragStartX = null;
      return;
    }

    const delta = event.clientX - dragStartX;
    dragStartX = null;

    if (Math.abs(delta) > 42) {
      setTestimonialIndex(activeIndex + (delta < 0 ? 1 : -1));
    }
  });

  testimonialGrid.addEventListener("pointercancel", () => {
    dragStartX = null;
  });

  compactScreen.addEventListener("change", renderCarousel);
  renderCarousel();
};

const initLocationAnimations = () => {
  const locationSection = document.querySelector(".location-hours");
  const canAnimateLocation = locationSection && window.gsap && window.ScrollTrigger && !reduceMotion.matches && !compactScreen.matches;

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
  const canAnimateFooter = footer && window.gsap && window.ScrollTrigger && !reduceMotion.matches && !compactScreen.matches;

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
  requestAnimationFrame(initMobileReveals);
  requestAnimationFrame(initStoryAnimations);
  requestAnimationFrame(initTestimonialAnimations);
  requestAnimationFrame(initTestimonialCarousel);
  requestAnimationFrame(initLocationAnimations);
  requestAnimationFrame(initFooterAnimations);
} else {
  window.addEventListener("load", () => {
    requestAnimationFrame(initMobileReveals);
    requestAnimationFrame(initStoryAnimations);
    requestAnimationFrame(initTestimonialAnimations);
    requestAnimationFrame(initTestimonialCarousel);
    requestAnimationFrame(initLocationAnimations);
    requestAnimationFrame(initFooterAnimations);
  }, { once: true });
}
