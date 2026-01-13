// Portfolio Scripts - Dynamic Bento Grid, Modal & i18n
(function() {
  'use strict';

  // State
  let currentLanguage = 'ko'; // Default to Korean
  let projectsData = null;
  let uiTranslations = null;

  // Fetch unified projects.json
  async function loadProjectsData() {
    try {
      const response = await fetch('projects.json');
      if (!response.ok) throw new Error('Failed to load projects.json');
      const data = await response.json();
      projectsData = data.projects;
      uiTranslations = data.ui;
      return true;
    } catch (error) {
      console.error('Error loading projects data:', error);
      return false;
    }
  }

  // Get localized project data
  function getLocalizedProject(project) {
    const langData = project[currentLanguage] || project.ko;
    return {
      id: project.id,
      company: project.company,
      period: project.period,
      ...langData
    };
  }

  // Get UI translation by dot notation path
  function t(path) {
    if (!uiTranslations) return path;
    const keys = path.split('.');
    let value = uiTranslations[currentLanguage];

    for (const key of keys) {
      if (value && value[key] !== undefined) {
        value = value[key];
      } else {
        // Fallback to Korean
        value = uiTranslations.ko;
        for (const k of keys) {
          if (value && value[k] !== undefined) {
            value = value[k];
          } else {
            return path;
          }
        }
        break;
      }
    }
    return value;
  }

  // Render Bento Grid
  function renderBentoGrid() {
    const gridContainer = document.getElementById('bento-grid');
    if (!gridContainer || !projectsData) return;

    gridContainer.innerHTML = '';

    projectsData.forEach((project, index) => {
      const data = getLocalizedProject(project);
      const card = document.createElement('div');
      card.className = `bento-card ${getCardSizeClass(index)} ftco-animate`;
      card.dataset.projectId = project.id;

      // Get first result as key metric
      const keyMetric = data.results && data.results.length > 0 ? data.results[0] : '';

      card.innerHTML = `
        <div class="bento-card-content">
          <div class="bento-card-header">
            <span class="bento-company">${data.company}</span>
            <span class="bento-period">${data.period}</span>
          </div>
          <h3 class="bento-title">${data.title}</h3>
          <p class="bento-summary">${data.hero_summary}</p>
          ${keyMetric ? `
          <div class="bento-metrics">
            <span class="bento-metric-label">${t('projects.keyMetric')}</span>
            <p class="bento-metric-text">${keyMetric}</p>
          </div>
          ` : ''}
          <div class="bento-card-footer">
            <span class="bento-read-more">${t('projects.readMore')} &rarr;</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => openModal(project));
      gridContainer.appendChild(card);
    });

    // Re-initialize AOS/ftco animations if available
    if (typeof AOS !== 'undefined') {
      AOS.refresh();
    }
  }

  // Get card size class for Bento grid layout
  function getCardSizeClass(index) {
    const patterns = [
      'bento-large',   // 0 - Featured
      'bento-medium',  // 1
      'bento-small',   // 2
      'bento-medium',  // 3
      'bento-small',   // 4
      'bento-large'    // 5 - Featured
    ];
    return patterns[index % patterns.length];
  }

  // Open modal with full STAR narrative
  function openModal(project) {
    const modal = document.getElementById('project-modal');
    const modalContent = document.getElementById('modal-content');
    if (!modal || !modalContent) return;

    const data = getLocalizedProject(project);

    modalContent.innerHTML = `
      <div class="modal-header">
        <div class="modal-header-top">
          <span class="modal-company">${data.company}</span>
          <span class="modal-period">${data.period}</span>
        </div>
        <h2 class="modal-title">${data.title}</h2>
        <button class="modal-close" aria-label="${t('modal.close')}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <!-- Hero Summary -->
        <div class="star-hero">
          <p class="star-hero-text">${data.hero_summary}</p>
        </div>

        <!-- Situation (Background) -->
        <div class="star-section">
          <h3 class="star-label">
            <span class="star-icon">S</span>
            ${t('modal.background')}
          </h3>
          <p class="star-content">${data.background || ''}</p>
        </div>

        <!-- Task (Problem) -->
        <div class="star-section">
          <h3 class="star-label">
            <span class="star-icon">T</span>
            ${t('modal.problem')}
          </h3>
          <p class="star-content">${data.problem || ''}</p>
        </div>

        <!-- Action -->
        <div class="star-section">
          <h3 class="star-label">
            <span class="star-icon">A</span>
            ${t('modal.actions')}
          </h3>
          <ul class="star-list">
            ${(data.actions || []).map(action => `<li>${action}</li>`).join('')}
          </ul>
        </div>

        <!-- Result -->
        <div class="star-section">
          <h3 class="star-label">
            <span class="star-icon">R</span>
            ${t('modal.results')}
          </h3>
          <ul class="star-list star-results">
            ${(data.results || []).map(result => `<li>${result}</li>`).join('')}
          </ul>
        </div>

        <!-- Lessons Learned -->
        ${data.lesson_learned && data.lesson_learned.length > 0 ? `
        <div class="star-section star-lessons">
          <h3 class="star-label">
            <span class="star-icon-alt">L</span>
            ${t('modal.lessons')}
          </h3>
          <ul class="star-list">
            ${data.lesson_learned.map(lesson => `<li>${lesson}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Close button event
    const closeBtn = modalContent.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    // Close on backdrop click
    const backdropHandler = function(e) {
      if (e.target === modal) {
        closeModal();
        modal.removeEventListener('click', backdropHandler);
      }
    };
    modal.addEventListener('click', backdropHandler);

    // Close on Escape key
    const escHandler = function(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  // Close modal
  function closeModal() {
    const modal = document.getElementById('project-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Update all UI text based on language
  function updateUILanguage() {
    if (!uiTranslations) return;

    // Update language toggle button
    const toggle = document.getElementById('language-toggle');
    if (toggle) {
      toggle.textContent = currentLanguage === 'ko' ? 'EN' : 'KO';
      toggle.setAttribute('data-lang', currentLanguage);
    }

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = t(key);
      if (translation && translation !== key) {
        el.textContent = translation;
      }
    });

    // Update hero section
    const heroName = document.getElementById('hero-name');
    if (heroName) {
      heroName.textContent = t('hero.name');
    }

    // Update hero roles for txt-rotate
    const heroRoles = document.getElementById('hero-roles');
    if (heroRoles) {
      const roles = t('hero.roles');
      if (Array.isArray(roles)) {
        heroRoles.setAttribute('data-rotate', JSON.stringify(roles));
        // Reinitialize txt-rotate if it exists
        if (typeof TxtRotate !== 'undefined') {
          heroRoles.innerHTML = '';
          new TxtRotate(heroRoles, roles, 500);
        }
      }
    }

    // Update CTA heading (contains HTML)
    const ctaHeading = document.getElementById('cta-heading');
    if (ctaHeading) {
      ctaHeading.innerHTML = t('cta.heading');
    }

    // Update About section name display
    const aboutName = document.getElementById('about-name');
    if (aboutName) {
      aboutName.textContent = t('hero.name');
    }

    // Re-render the grid with new language
    renderBentoGrid();
  }

  // Initialize language toggle
  function initLanguageToggle() {
    const toggle = document.getElementById('language-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
      currentLanguage = currentLanguage === 'ko' ? 'en' : 'ko';
      localStorage.setItem('portfolio-language', currentLanguage);
      updateUILanguage();
    });

    // Check for saved language preference
    const savedLang = localStorage.getItem('portfolio-language');
    if (savedLang && (savedLang === 'ko' || savedLang === 'en')) {
      currentLanguage = savedLang;
    }
  }

  // Initialize
  async function init() {
    // Load data first
    const loaded = await loadProjectsData();
    if (!loaded) {
      console.error('Failed to initialize: Could not load projects data');
      return;
    }

    // Initialize language toggle
    initLanguageToggle();

    // Initial UI update
    updateUILanguage();

    // Render the grid
    renderBentoGrid();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
