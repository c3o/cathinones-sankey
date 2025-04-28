// © 2025 Christopher Clay
// für das Drogeninformationszentrum (DIZ) der Stadt Zürich 

const CathsElId = "caths";

const CathsLoad = {
  script: (src, callback) => {
    document.getElementById(CathsElId).innerHTML += '.'; // Loading.....
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('type', 'text/javascript');
    if (window.location.search) src += window.location.search;
    scriptTag.src = src;
    scriptTag.onload = callback;
    document.body.appendChild(scriptTag);
  },
  css: (href) => {
    const ls = document.createElement('link');
    ls.rel = 'stylesheet';
    ls.setAttribute('type', 'text/css');
    if (window.location.search) href += window.location.search;
    ls.href = href;
    document.getElementsByTagName('head')[0].appendChild(ls);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById(CathsElId)) {
    const path = window.CathsPath || 'cathinones-sankey-files/';
    CathsLoad.css(path+'cathinones-sankey.css');
    CathsLoad.script(path+'lib/d3.min.js', function() {
      CathsLoad.script(path+'lib/plotly-sankeyonly.min.js', function() {
        CathsLoad.script(path+'cathinones2024.csv.js', function() {
          CathsLoad.script(path+'cathinones-sankey.js', function() {
            Caths.setup();
          });
        });
      });
    });
  } else {
    console.error('Fehler: Element #'+CathsElId+' nicht gefunden!');
  }
});