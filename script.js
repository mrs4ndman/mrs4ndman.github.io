// ----------------- helpers -----------------
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const picker = document.getElementById("bgPicker");

// utility: calcula luminancia simple (0..1)
function luminanceFromHex(hex) {
  if (!hex || hex[0] !== "#") return 0;
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// Aplica las variables según tema o color personalizado
function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  const customBg = localStorage.getItem("customBgColor");
  if (customBg) {
    // aplico color guardado y recalculo contraste
    root.style.setProperty("--bg-color", customBg);
    const lum = luminanceFromHex(customBg);
    if (lum > 0.5) {
      // fondo claro: texto oscuro
      root.style.setProperty("--text-color", "#000000");
      root.style.setProperty("--btn-bg", "#dddddd");
      root.style.setProperty("--btn-hover-bg", "#cccccc");
      root.style.setProperty("--btn-text", "#000000");
      root.style.setProperty("--sub-bg", "rgba(255,255,255,0.85)");
      root.style.setProperty("--code-bg", "#f7f7f7");
      root.style.setProperty("--code-color", "#003300");
    } else {
      // fondo oscuro: texto claro
      root.style.setProperty("--text-color", "#ffffff");
      root.style.setProperty("--btn-bg", "#222222");
      root.style.setProperty("--btn-hover-bg", "#444444");
      root.style.setProperty("--btn-text", "#ffffff");
      root.style.setProperty("--sub-bg", "rgba(0,0,0,0.7)");
      root.style.setProperty("--code-bg", "#1e1e1e");
      root.style.setProperty("--code-color", "#00ff88");
    }
  } else {
    // no hay color personalizado: quito overrides para que los variables CSS del tema hagan efecto
    root.style.removeProperty("--bg-color");
    root.style.removeProperty("--text-color");
    root.style.removeProperty("--btn-bg");
    root.style.removeProperty("--btn-hover-bg");
    root.style.removeProperty("--btn-text");
    root.style.removeProperty("--sub-bg");
    root.style.removeProperty("--code-bg");
    root.style.removeProperty("--code-color");
  }
}

// ----------------- inicialización tema/color -----------------
const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

// si hay color guardado, lo aplico y ponemos el picker
const savedBgColor = localStorage.getItem("customBgColor");
if (picker && savedBgColor) {
  picker.value = savedBgColor;
}

// toggle de tema
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const customBg = localStorage.getItem("customBgColor");

    if (customBg) {
      // Si el usuario había elegido color con el selector,
      // al pulsar el botón volvemos a oscuro y elimino el override.
      localStorage.removeItem("customBgColor");

      // Quito overrides inline para que las variables del tema hagan efecto
      root.style.removeProperty("--bg-color");
      root.style.removeProperty("--text-color");
      root.style.removeProperty("--btn-bg");
      root.style.removeProperty("--btn-hover-bg");
      root.style.removeProperty("--btn-text");
      root.style.removeProperty("--sub-bg");
      root.style.removeProperty("--code-bg");
      root.style.removeProperty("--code-color");

      applyTheme("dark");
      return;
    }

    // comportamiento normal: alterna entre dark / light
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
  });
}

// ----------------- picker con contraste -----------------
if (picker) {
  picker.addEventListener("input", (e) => {
    const bgColor = e.target.value;
    // guardo y recalculo contrastes
    localStorage.setItem("customBgColor", bgColor);

    // aplico variables en función del color
    root.style.setProperty("--bg-color", bgColor);
    const lum = luminanceFromHex(bgColor);
    if (lum > 0.5) {
      root.style.setProperty("--text-color", "#000000");
      root.style.setProperty("--btn-bg", "#dddddd");
      root.style.setProperty("--btn-hover-bg", "#cccccc");
      root.style.setProperty("--btn-text", "#000000");
      root.style.setProperty("--sub-bg", "rgba(255,255,255,0.85)");
      root.style.setProperty("--code-bg", "#f7f7f7");
      root.style.setProperty("--code-color", "#003300");
    } else {
      root.style.setProperty("--text-color", "#ffffff");
      root.style.setProperty("--btn-bg", "#222222");
      root.style.setProperty("--btn-hover-bg", "#444444");
      root.style.setProperty("--btn-text", "#ffffff");
      root.style.setProperty("--sub-bg", "rgba(0,0,0,0.7)");
      root.style.setProperty("--code-bg", "#1e1e1e");
      root.style.setProperty("--code-color", "#00ff88");
    }
  });

  // si había color guardado, forzo el evento para aplicar estilos al cargar
  if (savedBgColor) {
    picker.dispatchEvent(new Event("input"));
  }
}

// ----------------- SANDBOX -----------------
const runBtn = document.getElementById("sandbox-run");
const resetBtn = document.getElementById("sandbox-reset");
const outputDiv = document.getElementById("sandbox-output");
const sandboxCode = document.getElementById("sandbox-code");
const examples = document.getElementById("examples");

let activeCleanup = () => {}; // función que limpia el ejemplo en curso (se sobrescribe desde eval)

// ejemplos predefinidos (strings evaluados)
const examplesCode = {
  circle: `// Pelota con "drag" que sigue el ratón (inercia)
(function(){
  let ball = document.createElement("div");
  ball.id = "sandbox-ball";
  ball.style.cssText = "position:fixed;width:30px;height:30px;border-radius:50%;background:#00ff88;pointer-events:none;left:50%;top:50%;transform:translate(-50%,-50%);";
  document.body.appendChild(ball);

  let targetX = window.innerWidth/2, targetY = window.innerHeight/2;
  let x = targetX, y = targetY;
  let anim;

  function update(){
    // easing: mueve una fracción hacia el target (0.1 controla "drag")
    x += (targetX - x) * 0.12;
    y += (targetY - y) * 0.12;
    ball.style.left = x + "px";
    ball.style.top = y + "px";
    anim = requestAnimationFrame(update);
  }
  anim = requestAnimationFrame(update);

  function move(e){
    targetX = e.clientX;
    targetY = e.clientY;
  }
  document.addEventListener("mousemove", move);

  // cleanup para este ejemplo
  activeCleanup = function(){
    cancelAnimationFrame(anim);
    try { ball.remove(); } catch(e){}
    document.removeEventListener("mousemove", move);
  };
})();`,

  counter: `// Contador que escribe en la consola
(function(){
  let count = 0;
  const interval = setInterval(() => {
    console.log("Counter:", ++count);
  }, 1000);

  activeCleanup = function(){
    clearInterval(interval);
  };
})();`,

  bouncing: `// Bola rebotando por la pantalla
(function(){
  let ball = document.createElement("div");
  ball.id = "sandbox-bouncing";
  ball.style.cssText = "position:fixed;left:50px;top:50px;width:40px;height:40px;border-radius:50%;background:#ff0066;pointer-events:none;";
  document.body.appendChild(ball);

  let dx = 3, dy = 3;
  let anim;
  function animate(){
    const rect = ball.getBoundingClientRect();
    if (rect.right >= window.innerWidth || rect.left <= 0) dx *= -1;
    if (rect.bottom >= window.innerHeight || rect.top <= 0) dy *= -1;
    ball.style.left = (rect.left + dx) + "px";
    ball.style.top = (rect.top + dy) + "px";
    anim = requestAnimationFrame(animate);
  }
  anim = requestAnimationFrame(animate);

  activeCleanup = function(){
    cancelAnimationFrame(anim);
    try { ball.remove(); } catch(e){}
  };
})();`
};

// al cambiar ejemplo: limpio lo anterior y cargo el código en el textarea
if (examples) {
  examples.addEventListener("change", () => {
    try { activeCleanup(); } catch (e) { /* ignore */ }
    const val = examples.value;
    sandboxCode.value = examplesCode[val] || "// Escribe tu JS aquí";
    outputDiv.textContent = "";
  });
}

// Ejecutar: limpia lo anterior e evalúa el nuevo código
if (runBtn) {
  runBtn.addEventListener("click", () => {
    try { activeCleanup(); } catch (e) { /* ignore */ }
    outputDiv.textContent = "";
    try {
      const code = sandboxCode.value;
      // Evaluar en el contexto global/local del script (intencionado para ejemplos)
      eval(code);
      outputDiv.textContent = "Ejecutado correctamente.";
    } catch (err) {
      outputDiv.textContent = "Error: " + err.message;
      console.error(err);
    }
  });
}

// Reset: limpia la ejecución, vacía el textarea y el selector
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    try { activeCleanup(); } catch (e) { /* ignore */ }
    sandboxCode.value = "";
    if (examples) { examples.value = ""; }
    outputDiv.textContent = "🔄 Sandbox reseteado.";
  });
}

// ----------------- FOOTER: año dinámico -----------------
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
