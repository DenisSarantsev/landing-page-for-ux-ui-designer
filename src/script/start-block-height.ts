function setRealVh() {
  document.documentElement.style.setProperty('--real-vh', `${window.innerHeight}px`);
}
window.addEventListener('resize', setRealVh);
window.addEventListener('orientationchange', setRealVh);
setRealVh();
