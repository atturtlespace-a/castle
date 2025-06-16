//unified-card-carousel.js
"use strict";

/**
 * Unified Card Carousel System
 * Handles multiple carousel types: threecol, singlecol, and fourcol
 */

// Configuration for different carousel types
const CAROUSEL_CONFIGS = {
  threecol_pagination: {
    defaults: { desktop: 3, tablet: 2, mobile: 1 },
    selector: "[splide='threecol_pagination']"
  },
  singlecol__pagination: {
    defaults: { desktop: 1, tablet: 1, mobile: 1 },
    selector: "[splide='singlecol__pagination']"
  },
  fourcol_pagination: {
    defaults: { desktop: 4, tablet: 2, mobile: 1 },
    selector: "[splide='fourcol_pagination']"
  }
};

// Store initialized carousels to prevent conflicts
const initializedCarousels = new WeakSet();

/**
 * Initialize all card carousels found on the page
 */
function initializeCardCarousels() {
  let totalCarouselsFound = 0;
  
  // Initialize each carousel type
  Object.entries(CAROUSEL_CONFIGS).forEach(([type, config]) => {
    const carouselElements = document.querySelectorAll(config.selector);
    
    if (carouselElements.length > 0) {
      console.log(`Found ${carouselElements.length} ${type} carousel(s)`);
      totalCarouselsFound += carouselElements.length;
      
      Array.from(carouselElements).forEach(element => {
        if (!initializedCarousels.has(element)) {
          initializeSingleCarousel(element, config);
          initializedCarousels.add(element);
        }
      });
    }
  });
  
  if (totalCarouselsFound === 0) {
    console.log("No card carousels found");
  } else {
    console.log(`Initialized ${totalCarouselsFound} total carousel(s)`);
  }
}

/**
 * Initialize a single carousel instance
 * @param {HTMLElement} carouselElement - The carousel DOM element
 * @param {Object} config - Configuration object for this carousel type
 */
function initializeSingleCarousel(carouselElement, config) {
  try {
    const slideList = carouselElement.querySelector(".splide__list");
    
    if (!slideList) {
      console.warn("No .splide__list found in carousel element:", carouselElement);
      return;
    }
    
    const slideCount = slideList.childElementCount;
    
    if (slideCount === 0) {
      console.warn("No slides found in carousel:", carouselElement);
      return;
    }
    
    // Determine slides per page based on slide count and carousel type
    const slidesPerPage = calculateSlidesPerPage(slideCount, config.defaults);
    
    // Create Splide instance with unified configuration
    const splide = new Splide(carouselElement, {
      perPage: slidesPerPage.desktop,
      rewind: true,
      arrows: false, // Controlled via setupResponsiveNavigation
      gap: "1.5rem",
      pagination: true,
      classes: {
        pagination: "splide__pagination card-carousel__pagination",
        page: "splide__pagination__page card-carousel__page", 
        arrow: "nav-arrow",
        prev: "nav-arrow--prev",
        next: "nav-arrow--next",
      },
      breakpoints: {
        991: { perPage: slidesPerPage.tablet },
        768: { perPage: slidesPerPage.mobile },
        441: { perPage: 1 },
      },
    });
    
    // Setup carousel features
    setupProgressBar(splide);
    setupResponsiveNavigation(splide);
    
    // Mount the carousel
    splide.mount();
    
    console.log(`Carousel initialized with ${slideCount} slides, showing ${slidesPerPage.desktop} per page on desktop`);
    
  } catch (error) {
    console.error("Error initializing carousel:", error, carouselElement);
  }
}

/**
 * Calculate slides per page based on total slide count and carousel defaults
 * @param {number} slideCount - Total number of slides
 * @param {Object} defaults - Default slides per page for each breakpoint
 * @returns {Object} Slides per page configuration
 */
function calculateSlidesPerPage(slideCount, defaults) {
  // Special configurations for small slide counts
  const specialConfigurations = {
    1: { desktop: 1, tablet: 1, mobile: 1 },
    2: { desktop: 2, tablet: 2, mobile: 2 },
    3: { desktop: 3, tablet: 3, mobile: 2 }
  };
  
  return specialConfigurations[slideCount] || defaults;
}

/**
 * Setup progress bar functionality
 * @param {Splide} splide - Splide instance
 */
function setupProgressBar(splide) {
  const progressBar = splide.root.querySelector(".card-carousel__progress");
  
  if (!progressBar) return;
  
  splide.on("mounted move", function() {
    try {
      const totalPages = splide.Components.Controller.getEnd() + 1;
      const currentProgress = Math.min((splide.index + 1) / totalPages, 1);
      progressBar.style.width = `${100 * currentProgress}%`;
    } catch (error) {
      console.error("Error updating progress bar:", error);
    }
  });
}

/**
 * Setup responsive navigation (arrows)
 * @param {Splide} splide - Splide instance
 */
function setupResponsiveNavigation(splide) {
  // Create custom navigation arrows
  createNavigationArrows(splide);
  
  // Handle responsive behavior
  splide.on("ready resize resized", function() {
    handleResponsiveNavigation(splide);
  });
}

/**
 * Create navigation arrows for the carousel
 * @param {Splide} splide - Splide instance
 */
function createNavigationArrows(splide) {
  const root = splide.root;
  
  // Create arrows if they don't exist
  let prevArrow = root.querySelector(".nav-arrow--prev");
  let nextArrow = root.querySelector(".nav-arrow--next");
  
  if (!prevArrow) {
    prevArrow = document.createElement("button");
    prevArrow.className = "nav-arrow nav-arrow--prev";
    prevArrow.setAttribute("aria-label", "Previous slide");
    prevArrow.innerHTML = '<span aria-hidden="true">‹</span>';
  }
  
  if (!nextArrow) {
    nextArrow = document.createElement("button");
    nextArrow.className = "nav-arrow nav-arrow--next";
    nextArrow.setAttribute("aria-label", "Next slide");
    nextArrow.innerHTML = '<span aria-hidden="true">›</span>';
  }
  
  // Create wrapper li elements for desktop pagination
  const prevLi = document.createElement("li");
  prevLi.className = "nav-arrow-wrapper nav-arrow-wrapper--prev";
  prevLi.appendChild(prevArrow.cloneNode(true));
  
  const nextLi = document.createElement("li");
  nextLi.className = "nav-arrow-wrapper nav-arrow-wrapper--next";
  nextLi.appendChild(nextArrow.cloneNode(true));
  
  // Add click handlers to both sets of arrows
  const addClickHandlers = (prev, next) => {
    prev.addEventListener("click", (e) => {
      e.preventDefault();
      splide.go("<");
    });
    next.addEventListener("click", (e) => {
      e.preventDefault();
      splide.go(">");
    });
  };
  
  addClickHandlers(prevArrow, nextArrow);
  addClickHandlers(prevLi.querySelector(".nav-arrow--prev"), nextLi.querySelector(".nav-arrow--next"));
  
  // Store references for later use
  splide._customPrevArrow = prevArrow;
  splide._customNextArrow = nextArrow;
  splide._customPrevLi = prevLi;
  splide._customNextLi = nextLi;
}

/**
 * Handle responsive navigation placement
 * @param {Splide} splide - Splide instance
 */
function handleResponsiveNavigation(splide) {
  const { _customPrevArrow: prevArrow, _customNextArrow: nextArrow, 
          _customPrevLi: prevLi, _customNextLi: nextLi } = splide;
  
  const pagination = splide.root.querySelector(".splide__pagination");
  const mobileNav = splide.root.querySelector(".card-carousel__mobile-nav");
  
  if (!prevArrow || !nextArrow) return;
  
  const isMobile = window.innerWidth < 992;
  
  if (isMobile && mobileNav) {
    // Mobile layout: prev-arrow, progress-bar, next-arrow
    if (!mobileNav.contains(prevArrow)) {
      const progressBar = mobileNav.querySelector(".card-carousel__progress-bar");
      
      // Clear and rebuild mobile nav structure
      mobileNav.innerHTML = "";
      
      // Add elements in order: prev, progress, next
      mobileNav.appendChild(prevArrow);
      if (progressBar) {
        mobileNav.appendChild(progressBar);
      }
      mobileNav.appendChild(nextArrow);
    }
  } else if (!isMobile && pagination) {
    // Desktop layout: arrows as first and last pagination items
    if (!pagination.contains(prevLi)) {
      pagination.prepend(prevLi);
      pagination.appendChild(nextLi);
    }
  }
}

/**
 * Initialize carousels when DOM is ready
 */
function initWhenReady() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeCardCarousels);
  } else {
    initializeCardCarousels();
  }
}

/**
 * Public API for manual initialization
 */
window.CardCarousel = {
  init: initializeCardCarousels,
  initSingle: (element, type = 'threecol_pagination') => {
    const config = CAROUSEL_CONFIGS[type];
    if (config && !initializedCarousels.has(element)) {
      initializeSingleCarousel(element, config);
      initializedCarousels.add(element);
    }
  }
};

// Auto-initialize
initWhenReady();
