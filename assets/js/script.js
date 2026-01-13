'use strict';

// ============================================
// Portfolio Data & State
// ============================================
let projectsData = null;
let resumeData = null;
let profileData = null;
let uiTranslations = null;
let currentLanguage = 'ko';

// ============================================
// Fetch portfolio JSON files from data/ directory
// ============================================
const PORTFOLIO_FILES = [
  'data/portfolio-01-classum-library-backoffice.json',
  'data/portfolio-02-classum-team-activity.json',
  'data/portfolio-03-modernlion-jangbeomjune.json',
  'data/portfolio-04-modernlion-checkout-admin.json',
  'data/portfolio-05-dreamary-designer-map.json',
  'data/portfolio-06-dreamary-inapp-review.json'
];
const RESUME_DATA_URL = './data/resume.json';
const PROFILE_DATA_URL = './data/profile.json';

async function loadProjectsData() {
  try {
    const promises = PORTFOLIO_FILES.map(file => 
      fetch(file)
        .then(response => {
          if (!response.ok) throw new Error(`Failed to load ${file}`);
          return response.json();
        })
        .catch(error => {
          console.warn(`Error loading ${file}:`, error);
          return null;
        })
    );
    
    const results = await Promise.all(promises);
    projectsData = results.filter(project => project !== null);
    
    // Sort by portfolio number if needed
    projectsData.sort((a, b) => {
      const aNum = parseInt(a.id.match(/\d+/)?.[0] || '0');
      const bNum = parseInt(b.id.match(/\d+/)?.[0] || '0');
      return aNum - bNum;
    });
    
    console.log(`Loaded ${projectsData.length} portfolio projects`);
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

// Load Experience section specifically
async function loadExperience() {
  try {
    console.log('Loading experience data from:', RESUME_DATA_URL);
    const response = await fetch(RESUME_DATA_URL);
    if (!response.ok) {
      console.error('Failed to load resume.json:', response.status, response.statusText);
      throw new Error(`Failed to load resume.json: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Resume data loaded:', data);
    console.log('Experience array:', data.experience);
    resumeData = data; // Store for other functions
    renderExperience();
    return true;
  } catch (error) {
    console.error('Error loading experience data:', error);
    return false;
  }
}

async function loadProfileData() {
  try {
    const response = await fetch(PROFILE_DATA_URL);
    if (!response.ok) {
      console.error(`Failed to load profile.json: ${response.status} ${response.statusText}`);
      // Try to render with default values if file doesn't exist
      renderProfile();
      return false;
    }
    profileData = await response.json();
    console.log('Profile data loaded:', profileData);
    renderProfile();
    return true;
  } catch (error) {
    console.error('Error loading profile data:', error);
    console.error('Profile data URL:', PROFILE_DATA_URL);
    // Try to render with default values even on error
    renderProfile();
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

  // Set up CSS grid layout
  projectGrid.className = 'project-grid';
  projectGrid.innerHTML = '';

  projectsData.forEach((project, index) => {
    const data = getLocalizedProject(project);
    const card = document.createElement('div');
    card.className = 'group cursor-pointer';
    card.dataset.projectIndex = index;

    // Apple-style light theme card layout
    card.innerHTML = `
      <div class="project-card bg-apple-card border border-apple-border">
        <div class="project-image-wrapper bg-apple-bg border border-apple-border">
          <img src="./assets/images/${project.id}.jpg"
               alt="${data.title}"
               class="project-image">
          <div class="project-placeholder text-apple-text-secondary">
            ${getInitials(data.title || project.company)}
          </div>
        </div>
        <div class="project-card-content">
          <div class="project-meta text-apple-text-secondary">
            <span class="project-company text-apple-text-primary">${project.company}</span>
            <span class="project-period">${project.period}</span>
          </div>
          <h3 class="project-title text-apple-text-primary">${data.title}</h3>
          <p class="project-summary text-apple-text-secondary">${data.hero_summary || ''}</p>
          ${data.hypothesis
            ? `<div class="project-hypothesis">${data.hypothesis}</div>`
            : ''
          }
          ${data.results && data.results.length
            ? `<ul class="project-results-preview">
                 ${data.results.slice(0, 2).map(r => `<li>${highlightMetrics(r)}</li>`).join('')}
               </ul>`
            : ''
          }
        </div>
      </div>
    `;

    // Image fallback handling
    const img = card.querySelector('.project-image');
    const placeholder = card.querySelector('.project-placeholder');
    if (img && placeholder) {
      img.addEventListener('error', () => {
        img.classList.remove('loaded');
        placeholder.style.display = 'flex';
      });
      img.addEventListener('load', () => {
        img.classList.add('loaded');
        placeholder.style.display = 'none';
      });
      // Try to load the image
      const imgSrc = img.getAttribute('src');
      if (imgSrc) {
        img.src = imgSrc;
      }
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
  console.log('renderExperience called, container:', container);
  console.log('resumeData:', resumeData);
  
  if (!container) {
    console.error('Experience list container not found!');
    return;
  }
  
  if (!resumeData) {
    console.error('Resume data not loaded yet!');
    return;
  }

  if (!resumeData.experience || !Array.isArray(resumeData.experience)) {
    console.error('Experience array not found or invalid:', resumeData);
    return;
  }

  console.log('Rendering', resumeData.experience.length, 'experience items');

  // Ensure it's an ol element with Tailwind classes matching the CSS design
  if (container.tagName !== 'OL') {
    const ol = document.createElement('ol');
    ol.className = 'text-sm ml-[45px] relative';
    ol.id = 'experience-list';
    container.parentNode.replaceChild(ol, container);
    container = ol;
  } else {
    container.className = 'text-sm ml-[45px] relative';
  }

  container.innerHTML = resumeData.experience.map((item, index, array) => {
    console.log('Rendering experience item:', item);
    return `
    <li class="relative pb-5 ${index !== array.length - 1 ? 'before:content-[""] before:absolute before:top-0 before:-left-[30px] before:w-px before:h-full before:bg-apple-border' : ''} after:content-[""] after:absolute after:top-[5px] after:-left-[33px] after:h-2 after:w-2 after:bg-apple-blue after:rounded-full after:shadow-[0_0_0_4px_#FFFFFF,0_0_0_5px_#D2D2D7]">
      <h4 class="text-base leading-[1.3] mb-[7px] text-apple-text-primary">${item.title || ''}</h4>
      <span class="text-apple-blue font-normal leading-[1.6] block mb-2">${item.period || ''}</span>
      <p class="text-apple-text-secondary font-light leading-[1.6]">
        <strong class="text-apple-text-primary font-medium">${item.company || ''}</strong><br>
        ${item.description || ''}
      </p>
    </li>
  `;
  }).join('');
  
  console.log('Experience rendering complete. Container innerHTML length:', container.innerHTML.length);
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
      <h4 class="h4 timeline-item-title text-apple-text-primary">${item.school}</h4>
      <span class="text-apple-blue">${item.period}</span>
      <p class="timeline-text text-apple-text-secondary">
        ${item.degree ? `<strong class="text-apple-text-primary">${item.degree}</strong><br>` : ''}
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
        <h5 class="h5 text-apple-text-primary">${skill.name}</h5>
        <data value="${skill.value}" class="text-apple-text-secondary">${skill.value}%</data>
      </div>
      <div class="skill-progress-bg bg-apple-border">
        <div class="skill-progress-fill" style="width: ${skill.value}%;"></div>
      </div>
      ${skill.description ? `<p class="skill-description text-apple-text-secondary" style="margin-top: 8px; font-size: 13px; line-height: 1.5;">${skill.description}</p>` : ''}
    </li>
  `).join('');
}

// ============================================
// Render Profile to Sidebar
// ============================================
function renderProfile() {
  // If profileData is not loaded, use default values from HTML
  if (!profileData) {
    console.warn('Profile data not loaded, using default values from HTML');
    return;
  }

  // Update profile avatar
  const profileAvatar = document.getElementById('profile-avatar');
  if (profileAvatar) {
    // Use the avatar path from profile.json
    let avatarPath = profileData.avatar || 'assets/images/my-avatar.png';
    
    // Ensure relative path starts with ./ for proper resolution
    if (!avatarPath.startsWith('./') && !avatarPath.startsWith('/') && !avatarPath.startsWith('http')) {
      avatarPath = './' + avatarPath;
    }
    
    console.log('Loading profile image from:', avatarPath);
    profileAvatar.src = avatarPath;
    profileAvatar.alt = profileData.name || 'Profile';
    
    // Ensure image is visible
    profileAvatar.style.display = 'block';
    
    // Handle image load errors
    profileAvatar.onerror = function() {
      console.error('Failed to load profile image:', avatarPath);
      // Try alternative paths
      const alternatives = [
        './assets/images/my-avatar.png',
        'assets/images/anseunghwan-profile-github.JPG',
        './assets/images/anseunghwan-profile-github.JPG'
      ];
      
      let triedPaths = [avatarPath];
      let currentIndex = 0;
      
      const tryNextPath = () => {
        if (currentIndex < alternatives.length) {
          const altPath = alternatives[currentIndex];
          if (!triedPaths.includes(altPath)) {
            triedPaths.push(altPath);
            console.log('Trying alternative path:', altPath);
            this.src = altPath;
            currentIndex++;
          } else {
            currentIndex++;
            tryNextPath();
          }
        } else {
          // All paths failed, show initials
          console.warn('All image paths failed, showing initials');
          this.style.display = 'none';
          const avatarBox = this.closest('.avatar-box');
          if (avatarBox && !avatarBox.querySelector('.avatar-initials')) {
            const initials = document.createElement('div');
            initials.className = 'avatar-initials';
            initials.textContent = getInitials(profileData.name || '');
            initials.style.cssText = 'display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 24px; font-weight: 600; color: var(--white-2);';
            avatarBox.appendChild(initials);
          }
        }
      };
      
      // Try next alternative path
      tryNextPath();
    };
    
    // Ensure image is visible when loaded successfully
    profileAvatar.onload = function() {
      console.log('Profile image loaded successfully:', this.src);
      this.style.display = 'block';
      const initials = this.closest('.avatar-box')?.querySelector('.avatar-initials');
      if (initials) {
        initials.remove();
      }
    };
  }

  // Update profile name
  const profileName = document.getElementById('profile-name');
  if (profileName) {
    profileName.textContent = profileData.name || '';
    profileName.title = profileData.name || '';
  }

  // Update profile title
  const profileTitle = document.getElementById('profile-title');
  if (profileTitle) {
    profileTitle.textContent = profileData.jobTitle || '';
  }

  // Update email
  const profileEmail = document.getElementById('profile-email');
  if (profileEmail) {
    profileEmail.textContent = profileData.email || '';
    profileEmail.href = `mailto:${profileData.email || ''}`;
  }

  // Update phone
  const profilePhone = document.getElementById('profile-phone');
  if (profilePhone) {
    profilePhone.textContent = profileData.phone || '';
    profilePhone.href = `tel:${profileData.phone || ''}`;
  }

  // Render social links
  const socialList = document.getElementById('social-list');
  if (socialList && profileData.links && profileData.links.length > 0) {
    socialList.innerHTML = profileData.links.map(link => {
      // Handle different icon formats (logo-linkedin vs logo-linkedin-outline)
      let iconName = link.icon;
      // If icon doesn't have -outline suffix and is a logo, try adding it
      if (iconName.startsWith('logo-') && !iconName.includes('-outline')) {
        // Keep as is for logo icons
      }
      return `
      <li class="social-item">
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="social-link text-apple-text-secondary hover:text-apple-blue" title="${link.name}">
          <ion-icon name="${iconName}"></ion-icon>
        </a>
      </li>
    `;
    }).join('');
  }
}

// ============================================
// Project Modal
// ============================================
function openProjectModal(project) {
  const modalContainer = document.getElementById('project-modal-container');
  const modalContent = document.getElementById('project-modal-content');

  if (!modalContainer || !modalContent) return;

  const data = getLocalizedProject(project);
  
  // 1. Resolve data source (handle nested details)
  const details = data.details || data;

  // 2. Helper: Render text (handles Arrays vs Strings)
  const renderText = (content) => {
    if (!content) return '';
    if (Array.isArray(content)) {
      return content.map(text => `<p class="mb-2 leading-relaxed text-gray-300">${text}</p>`).join('');
    }
    return `<p class="leading-relaxed text-gray-300">${content}</p>`;
  };

  // 3. Helper: Render lists (for Actions/Results/Background/Problem/Hypothesis)
  const renderList = (items, highlight = false) => {
    if (!items) return '';
    // Handle both arrays and strings - convert strings to array
    const itemsArray = Array.isArray(items) ? items : [items];
    if (itemsArray.length === 0) return '';
    return itemsArray.map(item => 
      `<li class="mb-1 text-apple-text-secondary">${highlight ? highlightMetrics(item) : item}</li>`
    ).join('');
  };

  // 4. Resolve Hero Image URL
  const heroImageSrc = data.hero_image || details.hero_image;

  modalContent.innerHTML = `
    <div class="project-modal-header mb-6">
      <div class="flex flex-wrap gap-2 mb-2">
        <span class="px-3 py-1 text-xs font-bold text-white bg-apple-blue rounded-full">${project.company}</span>
        <span class="px-3 py-1 text-xs font-medium text-gray-400 border border-gray-700 rounded-full">${project.period}</span>
      </div>
      <h3 class="text-2xl font-bold text-apple-text-primary mb-2">${data.title}</h3>
    </div>

    ${heroImageSrc ? `
    <div class="mb-6 rounded-xl overflow-hidden border border-apple-border">
      <img src="${heroImageSrc}" alt="${data.title}" class="w-full h-auto object-cover" onerror="this.parentElement.style.display='none'">
    </div>
    ` : ''}

    <div class="project-modal-hero mb-8 p-4 bg-apple-bg rounded-xl border border-apple-border">
      <p class="text-lg font-medium text-apple-text-primary italic">"${data.hero_summary || details.hero_summary || ''}"</p>
    </div>

    <div class="star-section mb-6">
      <div class="flex items-center gap-3 mb-3">
        <span class="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-apple-blue rounded-full">S</span>
        <h4 class="text-lg font-bold text-apple-text-primary">${t('background')}</h4>
      </div>
      <ul class="pl-11 list-disc list-outside ml-4 space-y-2 text-apple-text-secondary">
        ${renderList(details.background)}
      </ul>
    </div>

    <div class="star-section mb-6">
      <div class="flex items-center gap-3 mb-3">
        <span class="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-apple-blue rounded-full">T</span>
        <h4 class="text-lg font-bold text-apple-text-primary">${t('problem')}</h4>
      </div>
      <ul class="pl-11 list-disc list-outside ml-4 space-y-2 text-apple-text-secondary">
        ${renderList(details.problem)}
      </ul>
    </div>

    ${details.hypothesis ? `
    <div class="star-section mb-6">
      <div class="flex items-center gap-3 mb-3">
        <span class="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-apple-blue rounded-full">H</span>
        <h4 class="text-lg font-bold text-apple-text-primary">가설</h4>
      </div>
      <ul class="pl-11 list-disc list-outside ml-4 space-y-2 text-apple-text-secondary">
        ${renderList(details.hypothesis)}
      </ul>
    </div>
    ` : ''}

    <div class="star-section mb-6">
      <div class="flex items-center gap-3 mb-3">
        <span class="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-apple-blue rounded-full">A</span>
        <h4 class="text-lg font-bold text-apple-text-primary">${t('actions')}</h4>
      </div>
      <ul class="pl-11 list-disc list-outside ml-4 space-y-2 text-apple-text-secondary">
        ${renderList(details.actions)}
      </ul>
    </div>

    <div class="star-section mb-6">
      <div class="flex items-center gap-3 mb-3">
        <span class="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-apple-blue rounded-full">R</span>
        <h4 class="text-lg font-bold text-apple-text-primary">${t('results')}</h4>
      </div>
      <ul class="pl-11 list-disc list-outside ml-4 space-y-2 text-apple-text-secondary">
        ${renderList(details.results, true)}
      </ul>
    </div>

    ${(details.lesson_learned && details.lesson_learned.length > 0) ? `
    <div class="star-section mb-6 pt-6 border-t border-apple-border">
      <div class="flex items-center gap-3 mb-3">
        <span class="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-apple-blue rounded-full">L</span>
        <h4 class="text-lg font-bold text-apple-text-primary">${t('lessons')}</h4>
      </div>
      <ul class="pl-11 list-disc list-outside ml-4 space-y-2 text-apple-text-secondary italic">
        ${renderList(details.lesson_learned)}
      </ul>
    </div>
    ` : ''}
  `;

  if (modalContainer) {
    modalContainer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
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
  // Load projects, resume & profile data
  loadProjectsData();
  loadResumeData();
  loadProfileData();
  // Load Experience section
  loadExperience();

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
