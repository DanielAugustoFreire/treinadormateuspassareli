document.addEventListener('DOMContentLoaded', function () {

  // ============================================
  // MENU MOBILE (hamburguer)
  // ============================================
  var navToggle   = document.querySelector('.nav-toggle');
  var mobileMenu  = document.getElementById('mobile-menu');

  if (navToggle && mobileMenu) {
    var mobileClose     = mobileMenu.querySelector('.mobile-menu-close');
    var mobileMenuLinks = mobileMenu.querySelectorAll('a');

    function openMenu() {
      mobileMenu.removeAttribute('inert');
      mobileMenu.removeAttribute('aria-hidden');
      mobileMenu.classList.add('is-open');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Fechar menu');
      document.body.classList.add('menu-open');
    }

    function closeMenu() {
      navToggle.focus(); // move foco para fora antes de tornar inert
      mobileMenu.classList.remove('is-open');
      mobileMenu.setAttribute('inert', '');
      mobileMenu.setAttribute('aria-hidden', 'true');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menu');
      document.body.classList.remove('menu-open');
    }

    navToggle.addEventListener('click', function () {
      mobileMenu.classList.contains('is-open') ? closeMenu() : openMenu();
    });

    if (mobileClose) mobileClose.addEventListener('click', closeMenu);

    mobileMenuLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        closeMenu();
        navToggle.focus();
      }
    });
  }

  // ============================================
  // LIGHTBOX — AVALIAÇÃO FÍSICA
  // ============================================
  var expandBtn      = document.getElementById('avaliacao-expand');
  var lightbox       = document.getElementById('lightbox-avaliacao');
  var lightboxClose  = document.getElementById('lightbox-close');

  if (expandBtn && lightbox) {
    function openLightbox() {
      lightbox.removeAttribute('inert');
      lightbox.removeAttribute('aria-hidden');
      lightbox.classList.add('is-open');
      document.body.classList.add('menu-open');
      lightboxClose.focus();
    }

    function closeLightbox() {
      expandBtn.focus(); // move foco para fora antes de tornar inert
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('inert', '');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
    }

    expandBtn.addEventListener('click', openLightbox);
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
        closeLightbox();
      }
    });
  }

  var experienciaSection = document.querySelector('.experiencia-wpp');
  var finalCta = document.getElementById('quer-ser-meu-aluno');

  // Links do WhatsApp que ficam FORA do CTA final
  var whatsappLinks = Array.from(
    document.querySelectorAll('a[href*="api.whatsapp.com/send"]')
  ).filter(function (link) {
    return !link.closest('#quer-ser-meu-aluno');
  });

  // ============================================
  // CARROSSEL GENÉRICO
  // Reutilizado pela Galeria e pelo Antes/Depois
  // ============================================
  function setupCarousel(config) {
    var root     = document.querySelector(config.rootSelector);
    var viewport = document.querySelector(config.viewportSelector);
    var items    = Array.from(document.querySelectorAll(config.itemSelector));
    var prevBtn  = document.querySelector(config.prevSelector);
    var nextBtn  = document.querySelector(config.nextSelector);
    var counter  = document.querySelector(config.counterSelector);
    var dotsWrap = document.querySelector(config.dotsSelector);

    if (!viewport || !items.length) return null;

    var currentIndex      = 0;
    var autoplayTimer     = null;
    var scrollDebounce    = null;
    var visibilityRaf     = null;
    var dotButtons        = [];
    var isVisible         = false;

    // Atualiza classe ativa, dots e contador de texto
    function updateState(newIndex) {
      currentIndex = (newIndex + items.length) % items.length;

      items.forEach(function (item, i) {
        item.classList.toggle('is-active', i === currentIndex);
      });

      dotButtons.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === currentIndex);
      });

      if (counter) {
        counter.textContent =
          String(currentIndex + 1).padStart(2, '0') + ' / ' +
          String(items.length).padStart(2, '0');
      }
    }

    // Rola o viewport até o item de índice newIndex
    function goTo(newIndex) {
      updateState(newIndex);
      var target     = items[currentIndex];
      var scrollLeft = Math.max(
        0,
        target.offsetLeft - (viewport.clientWidth - target.clientWidth) / 2
      );
      viewport.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function startAutoplay() {
      if (!isVisible) return;
      stopAutoplay();
      autoplayTimer = setInterval(function () {
        goTo(currentIndex + 1);
      }, config.intervalMs);
    }

    // Verifica se o carrossel está visível na viewport
    function checkVisibility() {
      if (!root) return;
      var rect = root.getBoundingClientRect();
      var nowVisible = rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.25;
      if (nowVisible === isVisible) return;
      isVisible = nowVisible;
      isVisible ? startAutoplay() : stopAutoplay();
    }

    function scheduleVisibilityCheck() {
      if (visibilityRaf) cancelAnimationFrame(visibilityRaf);
      visibilityRaf = requestAnimationFrame(function () {
        visibilityRaf = null;
        checkVisibility();
      });
    }

    // Cria os dots dinamicamente
    if (dotsWrap) {
      dotButtons = items.map(function (_, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = config.dotClass + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Ir para a imagem ' + (i + 1));
        dot.addEventListener('click', function () {
          goTo(i);
          startAutoplay();
        });
        dotsWrap.appendChild(dot);
        return dot;
      });
    }

    updateState(0);

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goTo(currentIndex - 1);
        startAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goTo(currentIndex + 1);
        startAutoplay();
      });
    }

    // Sincroniza o índice quando o usuário rola manualmente
    viewport.addEventListener('scroll', function () {
      clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(function () {
        var centerX = viewport.getBoundingClientRect().left + viewport.clientWidth / 2;
        var closestIndex = 0;
        var closestDist  = Infinity;
        items.forEach(function (item, i) {
          var dist = Math.abs(item.getBoundingClientRect().left + item.clientWidth / 2 - centerX);
          if (dist < closestDist) { closestDist = dist; closestIndex = i; }
        });
        updateState(closestIndex);
      }, 80);
    });

    // Pausa em hover e foco para não atrapalhar a interação
    viewport.addEventListener('mouseenter', stopAutoplay);
    viewport.addEventListener('mouseleave', startAutoplay);
    viewport.addEventListener('focusin',    stopAutoplay);
    viewport.addEventListener('focusout',   startAutoplay);

    // IntersectionObserver como método principal de detecção de visibilidade
    if ('IntersectionObserver' in window && root) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          isVisible = entry.isIntersecting;
          isVisible ? startAutoplay() : stopAutoplay();
        });
      }, { threshold: 0.4 });
      observer.observe(root);
    } else {
      // Fallback: assume visível e inicia imediatamente
      isVisible = true;
      startAutoplay();
    }

    // Fallback adicional por scroll/resize
    window.addEventListener('scroll', scheduleVisibilityCheck, { passive: true });
    window.addEventListener('resize', scheduleVisibilityCheck);

    checkVisibility();

    return { goTo: goTo, startAutoplay: startAutoplay };
  }

  // ============================================
  // INICIALIZA CARROSSÉIS
  // ============================================
  setupCarousel({
    rootSelector:     '.galeria',
    viewportSelector: '[data-galeria-viewport]',
    itemSelector:     '.galeria-item',
    prevSelector:     '[data-galeria-prev]',
    nextSelector:     '[data-galeria-next]',
    counterSelector:  '[data-galeria-counter]',
    dotsSelector:     '[data-galeria-dots]',
    dotClass:         'carousel-dot',
    intervalMs:       4200
  });

  setupCarousel({
    rootSelector:     '.antesdepois',
    viewportSelector: '[data-antesdepois-viewport]',
    itemSelector:     '.antesdepois-item',
    prevSelector:     '[data-antesdepois-prev]',
    nextSelector:     '[data-antesdepois-next]',
    counterSelector:  '[data-antesdepois-counter]',
    dotsSelector:     '[data-antesdepois-dots]',
    dotClass:         'carousel-dot',
    intervalMs:       5000
  });

  // ============================================
  // ANIMAÇÃO DE ENTRADA — SEÇÃO EXPERIÊNCIA
  // ============================================
  if (experienciaSection) {
    if ('IntersectionObserver' in window) {
      var expObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            experienciaSection.classList.add('is-visible');
            expObserver.unobserve(experienciaSection);
          }
        });
      }, { threshold: 0.35 });
      expObserver.observe(experienciaSection);
    } else {
      experienciaSection.classList.add('is-visible');
    }
  }

  // ============================================
  // LINKS DO WHATSAPP → REDIRECIONA PARA CTA FINAL
  // Comportamento intencional: qualquer botão de WhatsApp
  // fora do CTA final rola até ele e dispara a animação.
  // ============================================
  whatsappLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (!finalCta) return;
      event.preventDefault();
      // Remove e readiciona para reiniciar a animação CSS
      finalCta.classList.remove('is-triggered');
      void finalCta.offsetWidth; // força reflow
      finalCta.classList.add('is-triggered');
      finalCta.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

});
