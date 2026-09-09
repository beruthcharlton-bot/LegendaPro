// Gera um código de ativação Premium.
// Uso: node gerar-codigo.js [dias]
// Exemplo: node gerar-codigo.js 30

import "dotenv/config";
import crypto from "node:crypto";

const dias = Number(process.argv[2] || 30);
const PREMIUM_SECRET = process.env.PREMIUM_SECRET || "troque-este-segredo";

const expiryTs = Math.floor(Date.now() / 1000) + dias * 24 * 60 * 60;
const sig = crypto
  .createHmac("sha256", PREMIUM_SECRET)
  .update(String(expiryTs))
  .digest("hex")
  .slice(0, 8)
  .toUpperCase();

const codigo = `${expiryTs.toString(36).toUpperCase()}-${sig}`;

console.log("");
console.log("Código de ativação:", codigo);
console.log("Válido por:", dias, "dias");
console.log("Expira em:", new Date(expiryTs * 1000).toLocaleString("pt-BR"));
console.log("");
