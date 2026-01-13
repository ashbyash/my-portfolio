'use strict';

// ============================================
// Portfolio Data & State
// ============================================
let projectsData = null;
let resumeData = null;
let uiTranslations = null;
let currentLanguage = 'ko';

// ============================================
// Fetch projects.json from data/ directory
// ============================================
const PROJECTS_DATA_URL = 'data/projects.json';
const RESUME_DATA_URL = 'data/resume.json';

async function loadProjectsData() {
  try {
    const response = await fetch(PROJECTS_DATA_URL);
    if (!response.ok) throw new Error('Failed to load projects.json');
    const json = await response.json();
    projectsData = json.projects || [];
    renderProjects();
    return true;
  } catch (error) {
    console.error('Error loading portfolio data:', error);
    return false;
  }
}

async function loadResumeData() {
  try {
    const response = await fetch(RESUME_DATA_URL);
    if (!response.ok) throw new Error('Failed to load resume.json');
    resumeData = await response.json();
    renderResumeSections();
    return true;
  } catch (error) {
    console.error('Error loading resume data:', error);
    return false;
  }
}

// Get project data (flat structure from individual JSON files)
function getLocalizedProject(project) {
  return project;
}

function getInitials(text = '') {
  return text
    .split(' ')
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'PM';
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
  const projectGrid = document.getElementById('project-grid');
  if (!projectGrid || !projectsData) return;

  // Set up Tailwind grid layout
  projectGrid.className = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6';
  projectGrid.innerHTML = '';

  projectsData.forEach((project, index) => {
    const data = getLocalizedProject(project);
    const card = document.createElement('div');
    card.className = 'group cursor-pointer';
    card.dataset.projectIndex = index;

    // Tailwind-based card layout (Modern Minimalist)
    card.innerHTML = `
      <div class="h-full bg-white border border-gray-200 rounded-2xl p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
        <div class="relative h-48 w-full mb-4 overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
          <img src="./assets/images/${project.id}.jpg"
               alt="${data.title}"
               class="project-image hidden w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]">
          <div class="placeholder flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 font-semibold text-2xl">
            ${getInitials(data.title || project.company)}
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm text-gray-500">
            <span class="font-medium text-gray-700">${project.company}</span>
            <span>${project.period}</span>
          </div>
          <h3 class="project-title text-lg font-semibold text-gray-900 leading-snug">${data.title}</h3>
          <p class="text-sm text-gray-700 leading-relaxed">${data.hero_summary || ''}</p>
          ${data.results && data.results.length
            ? `<ul class="text-sm text-gray-700 list-disc list-inside space-y-1 mt-2">
                 ${data.results.slice(0, 2).map(r => `<li>${highlightMetrics(r)}</li>`).join('')}
               </ul>`
            : ''
          }
        </div>
      </div>
    `;

    // Image fallback handling
    const img = card.querySelector('.project-image');
    const placeholder = card.querySelector('.placeholder');
    if (img) {
      img.addEventListener('error', () => {
        img.classList.add('hidden');
        placeholder.classList.remove('hidden');
      });
      img.addEventListener('load', () => {
        placeholder.classList.add('hidden');
        img.classList.remove('hidden');
      });
    }

    // Add click event to open modal
    card.addEventListener('click', function(e) {
      e.preventDefault();
      openProjectModal(project);
    });

    projectGrid.appendChild(card);
  });
}

function renderResumeSections() {
  if (!resumeData) return;
  renderExperience();
  renderEducation();
  renderSkills();
}

function renderExperience() {
  const container = document.getElementById('experience-list');
  if (!container) return;

  // Ensure it's an ol element with timeline-list class
  if (container.tagName !== 'OL') {
    const ol = document.createElement('ol');
    ol.className = 'timeline-list';
    ol.id = 'experience-list';
    container.parentNode.replaceChild(ol, container);
    container = ol;
  } else {
    container.className = 'timeline-list';
  }

  container.innerHTML = (resumeData.experience || []).map(item => `
    <li class="timeline-item">
      <h4 class="h4 timeline-item-title">${item.title}</h4>
      <span>${item.period}</span>
      <p class="timeline-text">
        <strong>${item.company}</strong><br>
        ${item.description}
      </p>
    </li>
  `).join('');
}

function renderEducation() {
  const container = document.getElementById('education-list');
  if (!container) return;

  // Ensure it's an ol element with timeline-list class
  if (container.tagName !== 'OL') {
    const ol = document.createElement('ol');
    ol.className = 'timeline-list';
    ol.id = 'education-list';
    container.parentNode.replaceChild(ol, container);
    container = ol;
  } else {
    container.className = 'timeline-list';
  }

  container.innerHTML = (resumeData.education || []).map(item => `
    <li class="timeline-item">
      <h4 class="h4 timeline-item-title">${item.school}</h4>
      <span>${item.period}</span>
      <p class="timeline-text">
        ${item.degree ? `<strong>${item.degree}</strong><br>` : ''}
        ${item.major ? `${item.major}<br>` : ''}
        ${item.description || ''}
      </p>
    </li>
  `).join('');
}

function renderSkills() {
  const container = document.getElementById('skills-list');
  if (!container) return;

  container.className = 'skills-list content-card';
  container.innerHTML = (resumeData.skills || []).map(skill => `
    <li class="skills-item">
      <div class="title-wrapper">
        <h5 class="h5">${skill.name}</h5>
        <data value="${skill.value}">${skill.value}%</data>
      </div>
      <div class="skill-progress-bg">
        <div class="skill-progress-fill" style="width: ${skill.value}%;"></div>
      </div>
      ${skill.description ? `<p class="skill-description" style="margin-top: 8px; font-size: 13px; color: hsl(0, 0%, 60%); line-height: 1.5;">${skill.description}</p>` : ''}
    </li>
  `).join('');
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
  // Load projects & resume data
  loadProjectsData();
  loadResumeData();

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
