// tilt-card.js — скрипт для наклона карточек по ориентации телефона
(function(){
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const round = (v, d=0) => Math.round(v * 10**d) / 10**d;
  
    let sensitivity = 1;
    let baseline = { beta: 0, gamma: 0 };
    let cards = [];
  
    function initTilt(selector = ".tilt-card", options={}) {
      if (options.sensitivity) sensitivity = options.sensitivity;
      cards = Array.from(document.querySelectorAll(selector));
  
      if (!('DeviceOrientationEvent' in window)) {
        console.warn("DeviceOrientationEvent не поддерживается браузером.");
        return;
      }
  
      const needIOSPermission = typeof DeviceOrientationEvent.requestPermission === 'function';
      if (needIOSPermission) {
        // iOS 13+: нужно запрашивать разрешение
        document.addEventListener('click', async function askPerm(){
          try {
            const res = await DeviceOrientationEvent.requestPermission();
            if (res === 'granted') {
              startOrientation();
            } else {
              console.warn("Доступ к датчикам отклонён пользователем.");
            }
          } catch(e){ console.error(e); }
          document.removeEventListener('click', askPerm);
        });
      } else {
        startOrientation();
      }
  
      // Фолбек для десктопа — мышь
      setupMouseFallback();
    }
  
    function startOrientation(){
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  
    function handleOrientation(e){
      let { beta, gamma } = e;
      if (beta == null || gamma == null) return;
  
      beta -= baseline.beta;
      gamma -= baseline.gamma;
  
      const maxTilt = 25;
      const rx = clamp(-(beta) * 0.4 * sensitivity, -maxTilt, maxTilt);
      const ry = clamp((gamma) * 0.6 * sensitivity, -maxTilt, maxTilt);
  
      cards.forEach(card => {
        card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
    }
  
    function calibrate(){
      baseline = { beta: 0, gamma: 0 }; // можно расширить логикой «запомнить текущее»
    }
  
    function setupMouseFallback(){
      let dragging = false, sx = 0, sy = 0, rx0 = 0, ry0 = 0;
      document.addEventListener('pointerdown', (e) => {
        if (!e.target.closest('.tilt-card')) return;
        dragging = true; sx = e.clientX; sy = e.clientY;
        rx0 = 0; ry0 = 0;
      });
      document.addEventListener('pointerup',   () => { dragging = false; });
      document.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - sx; const dy = e.clientY - sy;
        const rx = clamp(rx0 - dy * 0.1, -25, 25);
        const ry = clamp(ry0 + dx * 0.1, -25, 25);
        cards.forEach(card => {
          card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
      });
    }
  
    // Экспорт в глобал
    window.TiltCard = { init: initTilt, calibrate };
  })();
  