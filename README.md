# SGC — Script Generator Console

Gerador de scripts a partir de pedidos em linguagem natural. Você descreve o que precisa, sem necessariamente ser técnico ou detalhado, e o SGC interpreta o pedido como um linguista e engenheiro sênior fariam: extrai a intenção real, pergunta (em opções simples de múltipla escolha) apenas o que for essencial e faltar, e gera o script mais completo e robusto possível — sempre otimizando para o menor consumo de tokens.

## Como funciona

1. Você escreve o pedido (ex: "preciso de algo que apague arquivos temporários toda semana").
2. A IA interpreta o pedido. Se faltar alguma informação essencial (sistema operacional, linguagem, agendamento, etc.), ela pergunta com opções simples — sem jargão técnico.
3. Assim que houver informação suficiente, ela gera o script final: código completo, tratamento de erros, e instruções de uso — sem enrolação.

## Uso — `index.html` (produto principal, cada pessoa usa a própria chave)

Página única, sem instalação, sem servidor. Cada usuário cola sua própria chave de API da Anthropic — ela fica salva só no navegador dele (`localStorage`) e nunca passa por nenhum servidor intermediário.

1. Abra `index.html` no navegador (duplo clique, ou publique via GitHub Pages para dar um link a qualquer pessoa).
2. Clique em "🔑 Sua chave de API", cole a chave (crie uma em [console.anthropic.com](https://console.anthropic.com/settings/keys) → Settings → API Keys) e clique em Salvar.
3. Escreva o pedido e use normalmente.

### Publicar como página pública (GitHub Pages)

Como o repositório já tem um `index.html` na raiz, basta ativar o GitHub Pages para dar a qualquer pessoa um link direto, sem precisar baixar nada:

1. No GitHub, vá em **Settings → Pages**.
2. Em "Source", selecione o branch `main` (ou o branch atual) e a pasta `/ (root)`.
3. Salve — o GitHub gera uma URL pública (algo como `https://<usuario>.github.io/<repositorio>/`).

Cada visitante ainda precisa colar a própria chave — a página em si não tem custo nem limite de uso, pois quem paga é cada usuário com sua chave.

## Uso — Página 100% offline, sem chave nenhuma (`sgc-offline.html`)

Não precisa de chave de API, conta, nem internet depois do primeiro uso. O modelo de IA roda inteiro dentro do navegador via [WebLLM](https://github.com/mlc-ai/web-llm) (WebGPU). Qualidade bem inferior à versão com API, mas totalmente gratuita.

1. Abra `sgc-offline.html` (Chrome ou Edge recentes, com WebGPU).
2. Escolha um modelo e clique em "Carregar modelo" (baixa uma vez, fica em cache).
3. Escreva seu pedido e use normalmente.

## Uso — Via app Claude (assinatura pessoal, sem chave de API)

Para quem já paga uma assinatura do Claude (app celular/desktop) e não quer lidar com chave de API: crie um **Project** no app com as instruções de `sgc-project-instructions.md` como "Custom instructions" e converse normalmente ali. Funciona em qualquer aparelho logado na mesma conta.

## Uso — Servidor Node (self-hosting / linha de comando)

Para quem prefere rodar um backend próprio (ex: para embutir em outro sistema) ou usar via terminal.

```bash
npm install
cp .env.example .env
# edite .env e defina sua ANTHROPIC_API_KEY
npm start        # interface web em http://localhost:3000
npm run cli       # versão de linha de comando
```

## Estrutura do projeto

```
index.html                    # produto principal: página única, cada pessoa usa a própria chave
sgc-offline.html               # página única, sem chave, modelo de IA rodando no navegador (WebLLM)
sgc-project-instructions.md    # instruções para usar via Project no app Claude (assinatura pessoal)
src/
  systemPrompt.js  # persona e regras que a IA segue (linguista + engenheiro, econômico em tokens)
  tool.js           # schema estruturado da resposta da IA (perguntas ou script final)
  aiClient.js        # chamada à API da Anthropic
  server.js          # servidor web (Express) e endpoint /api/gerar
  cli.js             # interface de linha de comando
public/
  index.html, style.css, app.js   # interface do servidor Node (self-hosting)
```

## Notas de design

- A IA é forçada (via `tool_choice`) a responder sempre em um formato estruturado (`perguntas` ou `script`), o que evita respostas soltas, imprevisíveis ou que gastem tokens com texto solto.
- O prompt do sistema instrui explicitamente a IA a gerar código enxuto (sem comentários óbvios, sem boilerplate) mesmo em pedidos complexos, para minimizar tokens de saída sem perder robustez.
- Nas versões sem servidor (`index.html`, `sgc-offline.html`), nada trafega por infraestrutura própria: a chave de cada usuário vai direto do navegador dele para a API da Anthropic (ou o modelo roda localmente, no caso offline).
