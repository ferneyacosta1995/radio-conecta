(function(){
  // Si ya existe el reproductor, no volver a crearlo
  if (window.RadioPlayer && window.RadioPlayer.audio) {
    console.log('🎵 RadioPlayer ya está inicializado, reutilizando instancia');
    return;
  }

  console.log('🎵 Creando nuevo RadioPlayer global');
  const STREAM_URL = 'http://186.29.40.51:8000/stream';

  // Crear reproductor global único
  const audio = new Audio(STREAM_URL);
  audio.preload = 'none';
  audio.crossOrigin = 'anonymous';
  audio.playsInline = true;
  audio.loop = false; // es un stream

  // Restaurar volumen guardado
  try {
    const savedVol = localStorage.getItem('rc_volume');
    if (savedVol !== null) audio.volume = Math.min(1, Math.max(0, parseFloat(savedVol)));
  } catch(_){}

  audio.addEventListener('volumechange', ()=>{
    try { localStorage.setItem('rc_volume', String(audio.volume)); } catch(_){}
    const slider = document.querySelector('#sticky-player input[type="range"]');
    if (slider) slider.value = String(Math.round(audio.volume * 100));
  });

  // UI mínima fija (sticky)
  function ensureStickyPlayer() {
    if (document.getElementById('sticky-player')) return;
    const bar = document.createElement('div');
    bar.id = 'sticky-player';
    bar.className = 'sticky-player';
    bar.innerHTML = `
      <div class="sp-container">
        <div class="sp-left">
          <img src="img/logo/logo.png" alt="Radio Conecta" class="sp-logo" onerror="this.style.display='none'">
          <div class="sp-info">
            <div class="sp-title">Radio Conecta</div>
            <div class="sp-subtitle">En vivo ahora</div>
          </div>
        </div>
        <div class="sp-center">
          <button class="sp-btn sp-toggle" aria-label="Reproducir/Pausar">
            <svg class="sp-icon sp-play" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
            <svg class="sp-icon sp-pause" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
          </button>
        </div>
        <div class="sp-right">
          <div class="sp-volume">
            <svg class="sp-vol-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
            <input class="sp-vol-slider" type="range" min="0" max="100" step="1" value="${Math.round(audio.volume*100)}" aria-label="Volumen" />
          </div>
          <div class="sp-live-badge">
            <span class="sp-live-dot"></span>
            EN VIVO
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(bar);

    const toggle = bar.querySelector('.sp-toggle');
    const vol = bar.querySelector('.sp-vol-slider');
    const playIcon = bar.querySelector('.sp-play');
    const pauseIcon = bar.querySelector('.sp-pause');

    function syncButton(){
      if (audio.paused) {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        bar.classList.remove('playing');
      } else {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        bar.classList.add('playing');
      }
    }

    toggle.addEventListener('click', async ()=>{
      try {
        if (audio.paused) await audio.play(); else audio.pause();
        syncButton();
      } catch(err) { console.warn('Play/Pause error', err); }
    });

    vol.addEventListener('input', ()=>{
      audio.volume = Math.min(1, Math.max(0, parseInt(vol.value,10)/100));
    });

    audio.addEventListener('play', syncButton);
    audio.addEventListener('pause', syncButton);

    // Mostrar la barra al menos como minimizada en móviles
    requestAnimationFrame(syncButton);
  }

  // Media Session (controles del sistema)
  function setupMediaSession(){
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Radio Conecta',
        artist: 'En vivo',
        album: 'Stream',
        artwork: [
          { src: 'img/logo/favicon.png', sizes: '96x96', type: 'image/png' },
          { src: 'img/logo/logo.png', sizes: '256x256', type: 'image/png' }
        ]
      });
      navigator.mediaSession.setActionHandler('play', async ()=>{ try{ await audio.play(); }catch(_){} });
      navigator.mediaSession.setActionHandler('pause', ()=> audio.pause());
      // No hay "seek" en streams
    }
  }

  // API pública
  const API = {
    audio,
    play: async ()=>{ 
      try{ 
        console.log('▶️ Play solicitado');
        await audio.play(); 
        console.log('✅ Reproduciendo');
      }catch(e){ 
        console.warn('⚠️ No se pudo reproducir:', e);
      } 
    },
    pause: ()=> { 
      console.log('⏸️ Pausa solicitada');
      audio.pause(); 
    },
    toggle: async ()=>{ if (audio.paused) return API.play(); else API.pause(); },
    setVolume: (v)=>{ audio.volume = Math.min(1, Math.max(0, v)); },
    isPlaying: ()=> !audio.paused
  };

  // Exponer global
  window.RadioPlayer = API;
  console.log('✅ RadioPlayer disponible globalmente');

  // Iniciar UI y Media Session al cargar DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ()=>{ ensureStickyPlayer(); setupMediaSession(); });
  } else {
    ensureStickyPlayer(); setupMediaSession();
  }
})();

