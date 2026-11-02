(function () {
  'use strict';

  var desktop = window.matchMedia('(min-width: 768px)');

  // Mobile menu
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  function menuIsOpen() {
    return nav.classList.contains('is-open');
  }

  menuBtn.addEventListener('click', function () {
    setMenu(!menuIsOpen());
  });

  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('click', function (event) {
    if (menuIsOpen() && !nav.contains(event.target) && !menuBtn.contains(event.target)) setMenu(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menuIsOpen()) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  desktop.addEventListener('change', function () {
    setMenu(false);
  });

  // Services: first 5 on mobile, all 10 on desktop (handled in CSS)
  var toggle = document.getElementById('services-toggle');
  var list = document.getElementById('services-list');

  toggle.addEventListener('click', function () {
    var expanded = list.classList.toggle('is-expanded');
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? 'Show fewer services' : 'Show all 10 services';
  });

  // The values row only scrolls on mobile, so it only needs keyboard focus there
  var valuesRow = document.getElementById('values-row');

  function syncValuesRow() {
    if (desktop.matches) valuesRow.removeAttribute('tabindex');
    else valuesRow.setAttribute('tabindex', '0');
  }

  syncValuesRow();
  desktop.addEventListener('change', syncValuesRow);

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.rv, .rv-stagger > *, .rv-stagger-md > *, .rv-zoom, .rv-zoom-md').forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  // Pause the scene while it is off-screen
  var sceneObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      entry.target.classList.toggle('is-paused', !entry.isIntersecting);
    });
  });

  document.querySelectorAll('.scene').forEach(function (scene) {
    sceneObserver.observe(scene);
  });

  // Scroll reveal fallback for browsers without CSS scroll-driven animations
  var scrollDriven = window.CSS && CSS.supports('animation-timeline: view()');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!scrollDriven && !reducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.rv, .rv-stagger > *, .rv-stagger-md > *, .rv-zoom, .rv-zoom-md').forEach(function (el) {
      revealObserver.observe(el);
    });
  }
})();
