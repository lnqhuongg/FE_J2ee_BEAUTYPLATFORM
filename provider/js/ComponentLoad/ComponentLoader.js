const COMPONENT_BASE = './components/';

async function loadComponent(id, file) {
  const path = COMPONENT_BASE + file;
  const res = await fetch(path);
  const html = await res.text();
  const el = document.getElementById(id);
  el.innerHTML = html;
}
