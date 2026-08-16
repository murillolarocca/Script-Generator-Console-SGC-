# SGC — Script Generator Console

Gerador de scripts a partir de pedidos em linguagem natural. Você descreve o que precisa, sem necessariamente ser técnico ou detalhado, e o SGC interpreta o pedido como um linguista e engenheiro sênior fariam: extrai a intenção real, pergunta (em opções simples de múltipla escolha) apenas o que for essencial e faltar, e gera o script mais completo e robusto possível — sempre otimizando para o menor consumo de tokens.

## Como funciona

1. Você escreve o pedido (ex: "preciso de algo que apague arquivos temporários toda semana").
2. A IA interpreta o pedido. Se faltar alguma informação essencial (sistema operacional, linguagem, agendamento, etc.), ela pergunta com opções simples — sem jargão técnico.
3. Assim que houver informação suficiente, ela gera o script final: código completo, tratamento de erros, e instruções de uso — sem enrolação.

## Uso — Página HTML 100% offline, sem chave (`sgc-offline.html`)

Não precisa de chave de API, conta, nem internet depois do primeiro uso. O modelo de IA roda inteiro dentro do seu navegador via [WebLLM](https://github.com/mlc-ai/web-llm) (WebGPU).

1. Abra `sgc-offline.html` direto no navegador (duplo clique). Precisa de Chrome ou Edge recentes (WebGPU).
2. Escolha um modelo (o "Equilibrado" é o recomendado) e clique em "Carregar modelo" — na primeira vez ele baixa (1 a 2,5 GB) e fica em cache no navegador; nas próximas vezes carrega direto do cache.
3. Escreva seu pedido e use normalmente.

**Importante:** modelos pequenos rodando localmente são bem menos capazes que um modelo em nuvem como o Claude. Scripts para pedidos simples saem bem; pedidos complexos ou ambíguos podem exigir tentar de novo ou editar o resultado manualmente. Se o modelo não responder no formato esperado, a página mostra o texto bruto para você copiar.

## Uso — Página HTML local com API em nuvem (`sgc-local.html`)

Mesma ideia de arquivo único, mas usando a API da Anthropic (mais capaz, requer chave paga).

1. Abra `sgc-local.html` direto no navegador (duplo clique, ou "Abrir arquivo").
2. Clique em "Configuração da API", cole sua chave da Anthropic e clique em "Salvar" — a chave fica salva só no seu navegador (`localStorage`), nunca sai daí exceto para a API da Anthropic.
3. Escreva seu pedido e use normalmente.

Não precisa de Node, `npm install` nem servidor rodando.

## Requisitos (versão com servidor Node)

- Node.js 18 ou superior
- Uma chave de API da Anthropic (`ANTHROPIC_API_KEY`)

## Configuração

```bash
npm install
cp .env.example .env
# edite .env e defina sua ANTHROPIC_API_KEY
```

## Uso — Interface Web

```bash
npm start
```

Abra `http://localhost:3000` no navegador.

## Uso — Console (CLI)

```bash
npm run cli
```

Responda as perguntas diretamente no terminal.

## Estrutura do projeto

```
sgc-offline.html    # página única, sem chave, modelo de IA rodando no navegador (WebLLM)
sgc-local.html      # página única, usa a API da Anthropic direto do navegador (precisa de chave)
src/
  systemPrompt.js  # persona e regras que a IA segue (linguista + engenheiro, econômico em tokens)
  tool.js           # schema estruturado da resposta da IA (perguntas ou script final)
  aiClient.js        # chamada à API da Anthropic
  server.js          # servidor web (Express) e endpoint /api/gerar
  cli.js             # interface de linha de comando
public/
  index.html, style.css, app.js   # interface web simples e amigável
```

## Notas de design

- O servidor é stateless: o histórico da conversa (`messages`) trafega entre cliente e servidor a cada chamada, no formato nativo da API da Anthropic (incluindo `tool_use`/`tool_result`), sem necessidade de banco de dados.
- A IA é forçada (via `tool_choice`) a responder sempre em um formato estruturado (`perguntas` ou `script`), o que evita respostas soltas, imprevisíveis ou que gastem tokens com texto solto.
- O prompt do sistema instrui explicitamente a IA a gerar código enxuto (sem comentários óbvios, sem boilerplate) mesmo em pedidos complexos, para minimizar tokens de saída sem perder robustez.
