(function(){
  // Anti-screenshot development flag. Set to true to disable the anti-screenshot feature during development.
  const DEV_MODE_ALLOW_SCREENSHOTS = true;

  if (DEV_MODE_ALLOW_SCREENSHOTS) {
    console.log('Anti-screenshot is disabled in development mode.');
    return;
  }

  // Create the overlay with the logo
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = '#0b1325';
  overlay.style.color = '#fff';
  overlay.style.display = 'none';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '999999';
  overlay.style.fontFamily = 'Inter, system-ui, sans-serif';
  
  overlay.innerHTML = '<h2>TRYPHEN EMURUGAT</h2><p>Confidential Information</p>';
  document.body.appendChild(overlay);

  // Mask on print screen key press
  window.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen') {
      navigator.clipboard.writeText('Screenshots are disabled for confidential information.');
      overlay.style.display = 'flex';
      setTimeout(() => { overlay.style.display = 'none'; }, 2000);
    }
  });

  // Mask when window loses focus (often happens when using snipping tools)
  window.addEventListener('blur', () => {
    overlay.style.display = 'flex';
  });

  window.addEventListener('focus', () => {
    overlay.style.display = 'none';
  });

  // Also mask if page is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      overlay.style.display = 'flex';
    } else {
      overlay.style.display = 'none';
    }
  });

})();
