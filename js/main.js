// Inicializa las características de la página que dependen del DOM actual
function initPageFeatures() {
  // ===== CARRUSEL (solo si existen slides) =====
  const slides = document.querySelectorAll('.slide');
  if (slides.length > 0) {
    let currentSlide = 0;
    const totalSlides = slides.length;

    const nextBtn = document.querySelector('.next');
    const prevBtn = document.querySelector('.prev');

    const carouselContainer = document.querySelector('.carousel-container');

    function changeSlide(direction) {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
      slides[currentSlide].classList.add('active');
      if (carouselContainer) carouselContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    if (nextBtn) nextBtn.addEventListener('click', () => changeSlide(1));
    if (prevBtn) prevBtn.addEventListener('click', () => changeSlide(-1));

    // Auto-rotación del carrusel
    const autoId = setInterval(() => changeSlide(1), 6000);
    // Guardar para limpiar si recargamos contenido
    window.__carouselInterval && clearInterval(window.__carouselInterval);
    window.__carouselInterval = autoId;
  }

  // ===== MENÚ MÓVIL =====
  const headerEl = document.querySelector('header');
  const nav = document.querySelector('nav');
  if (headerEl && nav) {
    // Crear botón solo si no existe (evita duplicados si re-inicializamos)
    let menuToggle = headerEl.querySelector('.menu-toggle');
    if (!menuToggle) {
      menuToggle = document.createElement('button');
      menuToggle.className = 'menu-toggle';
      menuToggle.setAttribute('aria-label', 'Abrir menú');
      menuToggle.innerHTML = '<span></span><span></span><span></span>';
      headerEl.insertBefore(menuToggle, nav);
    }

    const navList = nav.querySelector('ul');

    function openCloseMenu() {
      nav.classList.toggle('active');
      document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';

      if (navList && window.innerWidth <= 768) {
        if (nav.classList.contains('active')) {
          const headerHeight = headerEl.getBoundingClientRect().height;
          const topValue = Math.max(0, Math.round(headerHeight) + 6);
          const halfVh = Math.round(window.innerHeight * 0.5);
          const available = window.innerHeight - topValue;
          const desired = Math.min(halfVh, available);
          navList.style.top = topValue + 'px';
          navList.style.height = desired + 'px';
          navList.style.maxHeight = `calc(100vh - ${topValue}px)`;
          navList.style.overflowY = 'auto';
          navList.style.paddingTop = '6px';
          navList.classList.add('half-open');
        } else {
          navList.style.top = '';
          navList.style.height = '';
          navList.style.maxHeight = '';
          navList.style.overflowY = '';
          navList.style.paddingTop = '';
          navList.classList.remove('half-open');
        }
      }
    }

    // Evitar múltiples listeners
    menuToggle.onclick = openCloseMenu;

    // Cerrar menú al hacer clic en un enlace
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        document.body.style.overflow = '';
        if (navList) {
          navList.style.top = '';
          navList.style.height = '';
          navList.style.maxHeight = '';
          navList.style.overflowY = '';
          navList.style.paddingTop = '';
          navList.classList.remove('half-open');
        }
      });
    });

    // Ajustar posición del nav ul si el header cambia de tamaño o se rota la pantalla
    window.addEventListener('resize', () => {
      if (!navList) return;
      if (window.innerWidth > 768) {
        // limpiar cuando volvemos a escritorio
        nav.classList.remove('active');
        document.body.style.overflow = '';
        navList.style.top = '';
        navList.style.height = '';
        navList.style.maxHeight = '';
        navList.style.overflowY = '';
        navList.style.paddingTop = '';
        navList.classList.remove('half-open');
        return;
      }
      if (nav.classList.contains('active')) {
        const headerHeight = headerEl.getBoundingClientRect().height;
        const topValue = Math.max(0, Math.round(headerHeight) + 6);
        navList.style.top = topValue + 'px';
        navList.style.maxHeight = `calc(100vh - ${topValue}px)`;
      }
    });
  }

  // ===== Asegurar header visible y compensar padding del body =====
  const headerEl2 = document.querySelector('header');
  if (headerEl2) {
    const ensureHeaderVisible = () => {
      headerEl2.style.position = 'fixed';
      headerEl2.style.top = '0';
      headerEl2.style.left = '0';
      headerEl2.style.right = '0';
      headerEl2.style.width = '100%';
      headerEl2.style.zIndex = '1000';
      headerEl2.style.transform = 'translateY(0)';
      headerEl2.style.display = headerEl2.style.display || 'flex';
      headerEl2.style.transition = headerEl2.style.transition || 'transform 120ms ease';

      const headerHeight = Math.ceil(headerEl2.getBoundingClientRect().height);
      if (document.body.style.paddingTop !== `${headerHeight}px`) {
        document.body.style.paddingTop = headerHeight + 'px';
      }
    };

    ensureHeaderVisible();

    window.addEventListener('scroll', () => ensureHeaderVisible(), { passive: true });
    window.addEventListener('resize', () => ensureHeaderVisible());

    if (!window.__headerObserver) {
      window.__headerObserver = new MutationObserver(muts => {
        for (const m of muts) {
          if (m.type === 'attributes' && (m.attributeName === 'style' || m.attributeName === 'class')) {
            ensureHeaderVisible();
          }
        }
      });
      window.__headerObserver.observe(headerEl2, { attributes: true, attributeFilter: ['style', 'class'] });
      window.addEventListener('beforeunload', () => window.__headerObserver && window.__headerObserver.disconnect());
    }
  }

  // ===== Controles de la página de Radio (si existen) =====
  const playBtn = document.getElementById('playBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const volUp = document.getElementById('volUp');
  const volDown = document.getElementById('volDown');

  if (playBtn && window.RadioPlayer) playBtn.onclick = () => window.RadioPlayer.play();
  if (pauseBtn && window.RadioPlayer) pauseBtn.onclick = () => window.RadioPlayer.pause();
  if (volUp && window.RadioPlayer) volUp.onclick = () => window.RadioPlayer.setVolume(Math.min(1, window.RadioPlayer.audio.volume + 0.1));
  if (volDown && window.RadioPlayer) volDown.onclick = () => window.RadioPlayer.setVolume(Math.max(0, window.RadioPlayer.audio.volume - 0.1));

  // Nuevo: Controles UI profesional en radio.html
  const rpContainer = document.querySelector('.radio-player');
  const rpToggle = document.querySelector('.rp-play-toggle');
  const rpVol = document.querySelector('.rp-vol-slider');
  const audio = window.RadioPlayer && window.RadioPlayer.audio;

  if (audio && rpContainer) {
    const syncState = () => {
      rpContainer.classList.toggle('playing', !audio.paused);
      if (rpVol) rpVol.value = Math.round((audio.volume || 0) * 100);
    };
    audio.addEventListener('play', syncState);
    audio.addEventListener('pause', syncState);
    audio.addEventListener('volumechange', () => {
      if (rpVol) rpVol.value = Math.round((audio.volume || 0) * 100);
    });
    syncState();
  }

  if (rpToggle && window.RadioPlayer) {
    rpToggle.onclick = () => window.RadioPlayer.toggle();
  }
  if (rpVol && window.RadioPlayer) {
    rpVol.addEventListener('input', () => window.RadioPlayer.setVolume(Math.min(1, Math.max(0, parseInt(rpVol.value, 10) / 100))));
  }

  // ===== Previews Top 10: pausar stream al reproducir un preview y reanudar al terminar =====
  const previews = document.querySelectorAll('.card-top audio');
  if (previews.length) {
    previews.forEach(aud => {
      aud.addEventListener('play', async () => {
        try {
          // Pausar otros previews para evitar solapes
          previews.forEach(other => { if (other !== aud && !other.paused) other.pause(); });
          // Si el stream estaba reproduciendo, pausar y marcar bandera
          if (window.RadioPlayer && window.RadioPlayer.isPlaying()) {
            window.__wasStreamPlayingBeforePreview = true;
            window.RadioPlayer.pause();
          } else {
            window.__wasStreamPlayingBeforePreview = false;
          }
        } catch(_){/* noop */}
      });
      const maybeResume = async () => {
        // Reanudar sólo si no hay otros previews sonando
        const anyPreviewPlaying = Array.from(previews).some(p => !p.paused);
        if (!anyPreviewPlaying && window.__wasStreamPlayingBeforePreview && window.RadioPlayer) {
          try { await window.RadioPlayer.play(); } catch(_){/* noop */}
          window.__wasStreamPlayingBeforePreview = false;
        }
      };
      aud.addEventListener('pause', maybeResume);
      aud.addEventListener('ended', maybeResume);
    });
  }
}

// Exponer para re-inicialización tras navegación PJAX
window.initPageFeatures = initPageFeatures;

// ===== Navegación PJAX para mantener el reproductor sonando =====
async function pjaxNavigate(url, pushState = true) {
  try {
    console.log('🔄 PJAX navegando a:', url);
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('No se pudo cargar la página');
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const newContainer = doc.querySelector('#pjax-container');
    const currentContainer = document.querySelector('#pjax-container');
    if (!newContainer || !currentContainer) {
      // Si no existe el contenedor, hacemos una navegación normal
      console.warn('⚠️ No se encontró #pjax-container, recargando página');
      window.location.href = url;
      return;
    }

    console.log('✅ Reemplazando contenido sin recargar página');
    // Reemplazar contenido
    currentContainer.innerHTML = newContainer.innerHTML;

    // Actualizar título y URL
    document.title = doc.title || document.title;
    if (pushState) history.pushState({ url }, '', url);

    // Actualizar nav activo
    const path = new URL(url, window.location.origin).pathname.split('/').pop();
    document.querySelectorAll('header nav a').forEach(a => {
      if (a.getAttribute('href') === path) a.classList.add('active');
      else a.classList.remove('active');
    });

    // Re-inicializar scripts dependientes del DOM actual
    initPageFeatures();

    // Llevar al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    console.error('❌ PJAX error:', e);
    window.location.href = url; // fallback
  }
}

// Init inicial
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando Radio Conecta');
  initPageFeatures();

  // Interceptar clics en enlaces internos .html
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    const target = a.getAttribute('target');
    if (!href || target === '_blank') return;

    // Externos o anclas
    if (/^https?:\/\//i.test(href) && !href.startsWith(window.location.origin)) return;
    if (href.startsWith('#')) return;

    // Solo páginas html del mismo sitio
    if (href.endsWith('.html')) {
      console.log('🔗 Interceptando clic en:', href);
      e.preventDefault();
      // Si es el botón de escuchar en vivo, intentamos iniciar reproducción inmediatamente (gesto del usuario)
      if (a.classList && a.classList.contains('btn-live-header') && window.RadioPlayer) {
        console.log('▶️ Iniciando reproducción');
        window.RadioPlayer.play();
      }
      const url = new URL(href, window.location.href).toString();
      pjaxNavigate(url, true);
    }
  });

  // Manejar navegación del historial
  window.addEventListener('popstate', (e) => {
    const url = (e.state && e.state.url) || window.location.href;
    console.log('⬅️ Navegación atrás/adelante a:', url);
    pjaxNavigate(url, false);
  });
});
