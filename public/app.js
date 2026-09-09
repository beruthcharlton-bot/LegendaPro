document.querySelectorAll(".chip-group").forEach((group) => {
  const targetInput = document.getElementById(group.dataset.target);
  group.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      group.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      targetInput.value = chip.dataset.value;
    });
  });
});

const form = document.getElementById("generatorForm");
const result = document.getElementById("result");
const copyBtn = document.getElementById("copyBtn");
const generateBtn = document.getElementById("generateBtn");

let lastText = "";

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  generateBtn.disabled = true;
  generateBtn.innerHTML = "<span>⏳</span> Criando sua legenda...";
  copyBtn.disabled = true;
  result.innerHTML = '<div class="loading"><div><div class="spinner"></div><div>Escrevendo sua legenda...</div></div></div>';

  const payload = {
    tema: document.getElementById("tema").value,
    objetivo: document.getElementById("objetivo").value,
    publico: document.getElementById("publico").value,
    estilo: document.getElementById("estilo").value
  };

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Erro ao gerar.");

    lastText = data.result || "";
    result.innerHTML = `<div class="result-content">${formatCaption(lastText)}</div>`;
    copyBtn.disabled = !lastText;
  } catch (error) {
    result.innerHTML = `<div class="result-placeholder"><strong>Não foi possível gerar</strong><p>${escapeHtml(error.message)}</p></div>`;
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = "<span>✨</span> Gerar minha legenda";
  }
});

copyBtn.addEventListener("click", async () => {
  if (!lastText) return;
  await navigator.clipboard.writeText(lastText);
  const original = copyBtn.textContent;
  copyBtn.textContent = "✓ Copiado!";
  setTimeout(() => copyBtn.textContent = original, 1400);
});

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));
}

function formatCaption(text) {
  return escapeHtml(text)
    .split(/\n{2,}/)
    .map((block) => {
      const heading = block.match(/^#{1,3}\s*(.+)$/m);
      if (heading) {
        const rest = block.replace(heading[0], "").trim();
        return `<h4 class="caption-heading">${heading[1].trim()}</h4>${rest ? `<p>${rest.replace(/\n/g,"<br>")}</p>` : ""}`;
      }
      return `<p>${block.replace(/\n/g,"<br>")}</p>`;
    })
    .join("")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}
