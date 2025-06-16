//card-carousel.js
"use strict";

// Initialize all card carousels
function initializeCardCarousels() {
const carouselElements = document.querySelectorAll("[splide='fourcol_pagination']");
  if (carouselElements.length === 0) {
    console.log("No card carousels found");
    return;
  }
  Array.from(carouselElements).forEach(element => {
    initializeSingleCarousel(element);
  });
}

function initializeSingleCarousel(carouselElement) {
  try {
    const slideList = carouselElement.querySelector(".splide__list");
    
    if (!slideList) {
      console.warn("No .splide__list found in carousel element");
      return;
    }
    
    const slideCount = slideList.childElementCount;
    
    if (slideCount === 0) {
      console.warn("No slides found in carousel");
      return;
    }
    
    // Determine slides per page based on slide count
    const slidesPerPage = calculateSlidesPerPage(slideCount);
    
    // Create Splide instance
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
        1200: { perPage: slidesPerPage.tablet },
        991: { perPage: slidesPerPage.mobile },
        767: { perPage: 1 },
      },
    });
    
    // Setup progress bar
    setupProgressBar(splide);
    
    // Setup responsive navigation
    setupResponsiveNavigation(splide);
    
    // Mount the carousel
    splide.mount();
    
  } catch (error) {
    console.error("Error initializing carousel:", error);
  }
}

function calculateSlidesPerPage(slideCount) {
  const defaults = { desktop: 4, tablet: 3, mobile: 2 };
  const configurations = {
    1: { desktop: 1, tablet: 1, mobile: 1 },
    2: { desktop: 2, tablet: 2, mobile: 2 },
    3: { desktop: 3, tablet: 3, mobile: 2 }
  };
  
  return configurations[slideCount] || defaults;
}

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

function setupResponsiveNavigation(splide) {
  // Create custom navigation arrows
  createNavigationArrows(splide);
  
  splide.on("ready resize resized", function() {
    handleResponsiveNavigation(splide);
  });
}

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
  
  // Create wrapper li elements for pagination
  const prevLi = document.createElement("li");
  prevLi.className = "nav-arrow-wrapper nav-arrow-wrapper--prev";
  prevLi.appendChild(prevArrow);
  
  const nextLi = document.createElement("li");
  nextLi.className = "nav-arrow-wrapper nav-arrow-wrapper--next";
  nextLi.appendChild(nextArrow);
  
  // Add click handlers
  prevArrow.addEventListener("click", () => splide.go("<"));
  nextArrow.addEventListener("click", () => splide.go(">"));
  
  // Store references for later use
  splide._customPrevArrow = prevArrow;
  splide._customNextArrow = nextArrow;
  splide._customPrevLi = prevLi;
  splide._customNextLi = nextLi;
}

function handleResponsiveNavigation(splide) {
  const prevArrow = splide._customPrevArrow;
  const nextArrow = splide._customNextArrow;
  const prevLi = splide._customPrevLi;
  const nextLi = splide._customNextLi;
  const pagination = splide.root.querySelector(".splide__pagination");
  const mobileNav = splide.root.querySelector(".card-carousel__mobile-nav");
  
  if (!prevArrow || !nextArrow) return;
  
  const isMobile = window.innerWidth < 992;
  
  if (isMobile && mobileNav && !mobileNav.contains(prevArrow)) {
    // For mobile: arrange as prev-arrow, progress-bar, next-arrow
    const progressBar = mobileNav.querySelector(".card-carousel__progress-bar");
    
    // Clear and rebuild the mobile nav structure
    mobileNav.innerHTML = "";
    
    // Add in desired order: prev, progress, next (arrows without li wrappers)
    mobileNav.appendChild(prevArrow);
    if (progressBar) {
      mobileNav.appendChild(progressBar);
    }
    mobileNav.appendChild(nextArrow);
    
  } else if (!isMobile && pagination && !pagination.contains(prevLi)) {
    // For desktop, place arrow li elements as siblings to pagination dots
    pagination.prepend(prevLi);
    pagination.appendChild(nextLi);
  }
}

// Initialize when DOM is ready
function initWhenReady() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeCardCarousels);
  } else {
    initializeCardCarousels();
  }
}

// Start initialization
initWhenReady();
