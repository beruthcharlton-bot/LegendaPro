import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

const client = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

const MASTER_PROMPT = `
Você é um especialista em copywriting, marketing digital, Instagram e criação de conteúdo.

Sua função é criar legendas naturais, envolventes e adequadas ao objetivo informado.

REGRAS:
1. Comece com um gancho forte.
2. Escreva como uma pessoa real, sem linguagem artificial.
3. Adapte a linguagem ao público.
4. Destaque benefícios, não apenas características.
5. Use parágrafos curtos para celular.
6. Use emojis somente quando combinarem com o estilo.
7. Nunca invente preços, resultados, clientes ou fatos.
8. Nunca prometa resultados garantidos.
9. Em vendas, use CTA claro.
10. Em engajamento, termine com pergunta ou convite.
11. Em conteúdo educativo, priorize clareza e valor.
12. Para Reels, complemente o vídeo em vez de repetir tudo.
13. Use de 5 a 10 hashtags realmente relevantes.

FORMATO OBRIGATÓRIO:
### LEGENDA
[legenda pronta para copiar]

### CTA
[chamada para ação]

### HASHTAGS
[5 a 10 hashtags]

### GANCHO ALTERNATIVO
[segunda opção de abertura]

Não explique seu processo. Entregue diretamente o conteúdo.
`;

app.post("/api/generate", async (req, res) => {
  try {
    const {
      tema = "",
      objetivo = "Engajar",
      publico = "",
      estilo = "Profissional",
      informacoes = "",
      cta = "Sim",
      quantidade = "1"
    } = req.body || {};

    if (!tema.trim()) {
      return res.status(400).json({ error: "Informe o tema da publicação." });
    }

    if (!client) {
      return res.status(500).json({
        error: "GEMINI_API_KEY não configurada. Copie .env.example para .env e adicione sua chave."
      });
    }

    const userPrompt = `
Tema da publicação: ${tema}
Objetivo: ${objetivo}
Público-alvo: ${publico || "Não informado"}
Estilo: ${estilo}
Informações sobre produto/serviço: ${informacoes || "Não informado"}
Incluir CTA: ${cta}
Quantidade de opções: ${quantidade}

Crie ${Math.min(Math.max(Number(quantidade) || 1, 1), 5)} opção(ões).
Se houver mais de uma, torne as opções realmente diferentes.
`;

    const response = await client.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
      contents: userPrompt,
      config: {
        systemInstruction: MASTER_PROMPT
      }
    });

    res.json({ result: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Não foi possível gerar a legenda agora.",
      detail: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Gerador de Legendas IA: http://localhost:${port}`);
});
