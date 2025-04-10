// © 2025 Christopher Clay
// für das Drogeninformationszentrum (DIZ) der Stadt Zürich 

const CathsLoad = {
  script: (src, callback) => {
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('type', 'text/javascript');
    scriptTag.src = src;
    scriptTag.onload = callback;
    document.body.appendChild(scriptTag);
  },
  css: (href) => {
    var ls = document.createElement('link');
    ls.rel = 'stylesheet';
    ls.setAttribute('type', 'text/css');
    ls.href = href;
    document.getElementsByTagName('head')[0].appendChild(ls);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  var path = window.CathsPath || 'cathinones-sankey-files/';
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
});