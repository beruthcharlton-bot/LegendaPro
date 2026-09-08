# Gerador de Legendas IA — V1

Site completo em Node.js + Express + API do Gemini (Google).

## 1. Requisitos
- Node.js 20+
- Uma chave da API do Gemini (grátis em https://aistudio.google.com/apikey)

## 2. Instalação

```bash
npm install
```

Copie `.env.example` para `.env` e coloque sua chave:

```bash
GEMINI_API_KEY=sua_chave
GEMINI_MODEL=gemini-3.5-flash-lite
```

Depois:

```bash
npm start
```

Abra:

http://localhost:3000

## 3. Estrutura

- `public/index.html` — interface
- `public/styles.css` — visual responsivo
- `public/app.js` — interação do formulário
- `server.js` — backend e chamada da IA
- `.env.example` — variáveis de ambiente

## 4. Próximos passos para produção

1. Colocar o backend em um servidor/cloud.
2. Nunca colocar a chave do Gemini no JavaScript do navegador.
3. Adicionar limite de gerações por usuário/IP.
4. Adicionar autenticação se houver planos pagos.
5. Adicionar banco de dados para histórico.
6. Integrar pagamento.
7. Adicionar analytics e página de preços.
