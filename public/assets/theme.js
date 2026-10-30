/* Applies the saved theme before first paint (external file: the CSP forbids inline scripts). */
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  try {
    var t = window.localStorage.getItem("homelab-site:theme");
    if (t === "light" || t === "dark") root.setAttribute("data-theme", t);
  } catch (e) { /* storage unavailable: follow the system theme */ }
})();
