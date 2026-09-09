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

const premiumBtn = document.getElementById("premiumBtn");
const pixModal = document.getElementById("pixModal");
const pixClose = document.getElementById("pixClose");
const pixCopy = document.getElementById("pixCopy");
const pixKey = document.getElementById("pixKey");

if (premiumBtn) {
  premiumBtn.addEventListener("click", () => { pixModal.hidden = false; });
  pixClose.addEventListener("click", () => { pixModal.hidden = true; });
  pixModal.addEventListener("click", (e) => { if (e.target === pixModal) pixModal.hidden = true; });
  pixCopy.addEventListener("click", async () => {
    await navigator.clipboard.writeText(pixKey.textContent.trim());
    const original = pixCopy.textContent;
    pixCopy.textContent = "Copiado!";
    setTimeout(() => pixCopy.textContent = original, 1400);
  });
}

const openRedeem = document.getElementById("openRedeem");
const redeemModal = document.getElementById("redeemModal");
const redeemClose = document.getElementById("redeemClose");
const redeemForm = document.getElementById("redeemForm");
const redeemInput = document.getElementById("redeemInput");
const redeemMsg = document.getElementById("redeemMsg");
const usageStatus = document.getElementById("usageStatus");

const FREE_DAILY_LIMIT = 3;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getPremiumUntil() {
  const value = Number(localStorage.getItem("premiumUntil") || 0);
  return value > Date.now() ? value : 0;
}

function getFreeUsage() {
  try {
    const saved = JSON.parse(localStorage.getItem("freeUsage") || "{}");
    return saved.date === todayKey() ? saved.count : 0;
  } catch {
    return 0;
  }
}

function incrementFreeUsage() {
  localStorage.setItem("freeUsage", JSON.stringify({ date: todayKey(), count: getFreeUsage() + 1 }));
}

function refreshUsageStatus() {
  const premiumUntil = getPremiumUntil();
  if (premiumUntil) {
    const date = new Date(premiumUntil).toLocaleDateString("pt-BR");
    usageStatus.textContent = `✓ Premium ativo até ${date}`;
    usageStatus.className = "usage-status premium";
    return { blocked: false };
  }
  const used = getFreeUsage();
  const remaining = FREE_DAILY_LIMIT - used;
  if (remaining <= 0) {
    usageStatus.textContent = "Você usou suas 3 gerações grátis de hoje. Volte amanhã ou assine o Premium.";
    usageStatus.className = "usage-status limit";
    return { blocked: true };
  }
  usageStatus.textContent = `Plano grátis: ${remaining} de ${FREE_DAILY_LIMIT} gerações restantes hoje`;
  usageStatus.className = "usage-status";
  return { blocked: false };
}

if (openRedeem) {
  openRedeem.addEventListener("click", () => { redeemModal.hidden = false; });
  redeemClose.addEventListener("click", () => { redeemModal.hidden = true; });
  redeemModal.addEventListener("click", (e) => { if (e.target === redeemModal) redeemModal.hidden = true; });

  redeemForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    redeemMsg.textContent = "Verificando...";
    redeemMsg.className = "redeem-msg";
    try {
      const response = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: redeemInput.value })
      });
      const data = await response.json();
      if (!data.valid) throw new Error(data.error || "Código inválido.");
      localStorage.setItem("premiumUntil", String(data.expiry));
      redeemMsg.textContent = "✓ Premium ativado com sucesso!";
      redeemMsg.className = "redeem-msg ok";
      refreshUsageStatus();
      setTimeout(() => { redeemModal.hidden = true; }, 1500);
    } catch (error) {
      redeemMsg.textContent = error.message;
      redeemMsg.className = "redeem-msg err";
    }
  });
}

refreshUsageStatus();

const form = document.getElementById("generatorForm");
const result = document.getElementById("result");
const copyBtn = document.getElementById("copyBtn");
const generateBtn = document.getElementById("generateBtn");

let lastText = "";

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const status = refreshUsageStatus();
  if (status.blocked) {
    result.innerHTML = '<div class="result-placeholder"><strong>Limite grátis atingido</strong><p>Você já usou suas 3 gerações de hoje. Assine o Premium para gerações ilimitadas.</p></div>';
    return;
  }

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
    if (!getPremiumUntil()) incrementFreeUsage();
    refreshUsageStatus();
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
