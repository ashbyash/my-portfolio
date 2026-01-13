'use strict';

// ============================================
// Portfolio Data & State
// ============================================
let projectsData = null;
let uiTranslations = null;
let currentLanguage = 'ko';

// ============================================
// Fetch portfolio-*.json files from data/ directory
// ============================================
const PORTFOLIO_FILES = [
  'data/portfolio-01-classum-library-backoffice.json',
  'data/portfolio-02-classum-team-activity.json',
  'data/portfolio-03-modernlion-jangbeomjune.json',
  'data/portfolio-04-modernlion-checkout-admin.json',
  'data/portfolio-05-dreamary-designer-map.json',
  'data/portfolio-06-dreamary-inapp-review.json'
];

async function loadProjectsData() {
  try {
    const responses = await Promise.all(
      PORTFOLIO_FILES.map(file => fetch(file).then(r => r.json()))
    );
    projectsData = responses;
    renderProjects();
    return true;
  } catch (error) {
    console.error('Error loading portfolio data:', error);
    return false;
  }
}

// Get project data (flat structure from individual JSON files)
function getLocalizedProject(project) {
  return project;
}

// UI Translations (hardcoded for now)
const UI_LABELS = {
  background: '배경',
  problem: '문제',
  actions: '실행',
  results: '성과',
  lessons: '교훈'
};

function t(key) {
  return UI_LABELS[key] || key;
}

// Highlight metrics (numbers, percentages, currency) in text
function highlightMetrics(text) {
  // Match patterns: 49건, 100%, 40시간, $1000, 80개, 5개월, etc.
  return text.replace(/(\d+(?:\.\d+)?(?:%|건|시간|개|개월|배|달|만원|억|천만)?)/g, '<strong>$1</strong>');
}

// ============================================
// Render Projects to Portfolio
// ============================================
function renderProjects() {
  const projectList = document.getElementById('project-list');
  if (!projectList || !projectsData) return;

  projectList.innerHTML = '';

  projectsData.forEach((project, index) => {
    const data = getLocalizedProject(project);
    const li = document.createElement('li');
    li.className = 'project-item active';
    li.dataset.filterItem = '';
    li.dataset.category = project.company.toLowerCase();
    li.dataset.projectIndex = index;

    li.innerHTML = `
      <a href="#" onclick="return false;">
        <figure class="project-img">
          <div class="project-item-icon-box">
            <ion-icon name="eye-outline"></ion-icon>
          </div>
          <div class="project-placeholder" style="
            background: linear-gradient(135deg, hsl(240, 1%, 18%) 0%, hsl(240, 2%, 12%) 100%);
            width: 100%;
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 16px;
          ">
            <span style="color: hsl(45, 100%, 71%); font-size: 24px; font-weight: 600;">${project.company.charAt(0)}</span>
          </div>
        </figure>

        <h3 class="project-title">${data.title}</h3>

        <p class="project-category">${project.company}</p>
      </a>
    `;

    // Add click event to open modal
    li.addEventListener('click', function(e) {
      e.preventDefault();
      openProjectModal(project);
    });

    projectList.appendChild(li);
  });

  // Reinitialize filter functionality
  initializeFilterForDynamicProjects();
}

// ============================================
// Project Modal
// ============================================
function openProjectModal(project) {
  const modalContainer = document.getElementById('project-modal-container');
  const modalContent = document.getElementById('project-modal-content');

  if (!modalContainer || !modalContent) return;

  const data = getLocalizedProject(project);

  modalContent.innerHTML = `
    <div class="project-modal-header">
      <span class="company-badge">${project.company}</span>
      <span class="period">${project.period}</span>
      <h3>${data.title}</h3>
    </div>

    <div class="project-modal-hero">
      <p>${data.hero_summary}</p>
    </div>

    <!-- Situation (Background) -->
    <div class="star-section">
      <div class="star-label">
        <span class="star-icon">S</span>
        <h4>${t('background')}</h4>
      </div>
      <p class="star-content">${data.background || ''}</p>
    </div>

    <!-- Task (Problem) -->
    <div class="star-section">
      <div class="star-label">
        <span class="star-icon">T</span>
        <h4>${t('problem')}</h4>
      </div>
      <p class="star-content">${data.problem || ''}</p>
    </div>

    <!-- Action -->
    <div class="star-section">
      <div class="star-label">
        <span class="star-icon">A</span>
        <h4>${t('actions')}</h4>
      </div>
      <ul class="star-list">
        ${(data.actions || []).map(action => `<li>${action}</li>`).join('')}
      </ul>
    </div>

    <!-- Result -->
    <div class="star-section">
      <div class="star-label">
        <span class="star-icon">R</span>
        <h4>${t('results')}</h4>
      </div>
      <ul class="star-list">
        ${(data.results || []).map(result => `<li>${highlightMetrics(result)}</li>`).join('')}
      </ul>
    </div>

    <!-- Lessons Learned -->
    ${data.lesson_learned && data.lesson_learned.length > 0 ? `
    <div class="star-section star-lessons">
      <div class="star-label">
        <span class="star-icon-alt">L</span>
        <h4>${t('lessons')}</h4>
      </div>
      <ul class="star-list">
        ${data.lesson_learned.map(lesson => `<li>${lesson}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
  `;

  modalContainer.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  const modalContainer = document.getElementById('project-modal-container');
  if (modalContainer) {
    modalContainer.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ============================================
// Reinitialize filter for dynamic projects
// ============================================
function initializeFilterForDynamicProjects() {
  const filterItems = document.querySelectorAll("[data-filter-item]");
  const filterBtn = document.querySelectorAll("[data-filter-btn]");
  const selectItems = document.querySelectorAll("[data-select-item]");
  const selectValue = document.querySelector("[data-selecct-value]");

  const filterFunc = function (selectedValue) {
    for (let i = 0; i < filterItems.length; i++) {
      if (selectedValue === "all") {
        filterItems[i].classList.add("active");
      } else if (selectedValue === filterItems[i].dataset.category) {
        filterItems[i].classList.add("active");
      } else {
        filterItems[i].classList.remove("active");
      }
    }
  };

  // Update filter buttons
  let lastClickedBtn = filterBtn[0];
  for (let i = 0; i < filterBtn.length; i++) {
    filterBtn[i].addEventListener("click", function () {
      let selectedValue = this.innerText.toLowerCase();
      selectValue.innerText = this.innerText;
      filterFunc(selectedValue);
      lastClickedBtn.classList.remove("active");
      this.classList.add("active");
      lastClickedBtn = this;
    });
  }

  // Update select items
  for (let i = 0; i < selectItems.length; i++) {
    selectItems[i].addEventListener("click", function () {
      let selectedValue = this.innerText.toLowerCase();
      selectValue.innerText = this.innerText;
      filterFunc(selectedValue);
    });
  }
}

// ============================================
// Original vCard Theme Scripts
// ============================================

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
if (sidebarBtn) {
  sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });
}

// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  if (modalContainer) {
    modalContainer.classList.toggle("active");
    overlay.classList.toggle("active");
  }
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {
  testimonialsItem[i].addEventListener("click", function () {
    if (modalImg && modalTitle && modalText) {
      modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
      modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
      modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
      modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;
    }
    testimonialsModalFunc();
  });
}

// add click event to modal close button
if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", testimonialsModalFunc);
}
if (overlay) {
  overlay.addEventListener("click", testimonialsModalFunc);
}

// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

if (select) {
  select.addEventListener("click", function () { elementToggleFunc(this); });
}

// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {
    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }
  });
}

// ============================================
// One-Pager Scroll Spy Navigation
// ============================================
const navLinks = document.querySelectorAll('.navbar-link');
const sections = document.querySelectorAll('article[id]');

function updateActiveNav() {
  const scrollPosition = window.scrollY + 100;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', updateActiveNav);
window.addEventListener('load', updateActiveNav);

// ============================================
// Project Modal Event Listeners
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  // Load projects data
  loadProjectsData();

  // Project modal close button
  const projectModalClose = document.getElementById('project-modal-close');
  const projectModalOverlay = document.getElementById('project-modal-overlay');

  if (projectModalClose) {
    projectModalClose.addEventListener('click', closeProjectModal);
  }

  if (projectModalOverlay) {
    projectModalOverlay.addEventListener('click', closeProjectModal);
  }

  // Close modal on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeProjectModal();
    }
  });
});
