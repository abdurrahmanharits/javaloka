(function () {
  var body = document.body;
  var toggle = document.querySelector('[data-lang-toggle]');
  var stored = localStorage.getItem('lang');
  var lang = stored === 'en' ? 'en' : 'id';

  function setLang(next) {
    body.setAttribute('data-lang', next);
    document.documentElement.setAttribute('lang', next);
    if (toggle) {
      toggle.textContent = next === 'id' ? 'ID / EN' : 'EN / ID';
      toggle.setAttribute('aria-pressed', next === 'en');
    }
    localStorage.setItem('lang', next);
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = body.getAttribute('data-lang') || lang;
      var next = current === 'id' ? 'en' : 'id';
      setLang(next);
    });
  }

  setLang(lang);
})();
