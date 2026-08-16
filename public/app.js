(() => {
  const telaInicial = document.getElementById("tela-inicial");
  const telaPerguntas = document.getElementById("tela-perguntas");
  const telaCarregando = document.getElementById("tela-carregando");
  const telaResultado = document.getElementById("tela-resultado");

  const pedidoInput = document.getElementById("pedido");
  const btnGerar = document.getElementById("btn-gerar");
  const erroInicial = document.getElementById("erro-inicial");

  const listaPerguntas = document.getElementById("lista-perguntas");
  const btnEnviarRespostas = document.getElementById("btn-enviar-respostas");
  const erroPerguntas = document.getElementById("erro-perguntas");

  let estado = { messages: [], toolUseId: null, perguntas: [], respostas: {} };

  function mostrar(tela) {
    [telaInicial, telaPerguntas, telaCarregando, telaResultado].forEach((t) =>
      t.classList.add("escondido")
    );
    tela.classList.remove("escondido");
  }

  async function chamarApi(messages) {
    const resp = await fetch("/api/gerar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    const dados = await resp.json();
    if (!resp.ok) throw new Error(dados.erro || "Erro desconhecido.");
    return dados;
  }

  function tratarResultado(dados) {
    estado.messages = dados.messages;
    const r = dados.resultado;

    if (r.status === "precisa_info") {
      estado.toolUseId = dados.toolUseId;
      estado.perguntas = r.perguntas || [];
      estado.respostas = {};
      renderizarPerguntas();
      mostrar(telaPerguntas);
      return;
    }

    if (r.status === "pronto" && r.script) {
      renderizarScript(r.script);
      mostrar(telaResultado);
      return;
    }

    throw new Error("Resposta inesperada do servidor.");
  }

  function renderizarPerguntas() {
    listaPerguntas.innerHTML = "";
    estado.perguntas.forEach((p) => {
      const bloco = document.createElement("div");
      bloco.className = "pergunta-bloco";

      const texto = document.createElement("p");
      texto.textContent = p.pergunta;
      bloco.appendChild(texto);

      const opcoesDiv = document.createElement("div");
      opcoesDiv.className = "opcoes";

      p.opcoes.forEach((o) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "opcao-botao";
        btn.textContent = o.rotulo;
        btn.addEventListener("click", () => {
          opcoesDiv.querySelectorAll(".opcao-botao").forEach((b) => b.classList.remove("selecionada"));
          btn.classList.add("selecionada");
          estado.respostas[p.id] = o.valor;
        });
        opcoesDiv.appendChild(btn);
      });

      bloco.appendChild(opcoesDiv);
      listaPerguntas.appendChild(bloco);
    });
  }

  function renderizarScript(script) {
    document.getElementById("script-titulo").textContent = script.titulo;
    document.getElementById("script-linguagem").textContent = script.linguagem;
    document.getElementById("script-arquivo").textContent = script.nome_arquivo;
    document.getElementById("script-conteudo").textContent = script.conteudo;
    document.getElementById("script-como-usar").textContent = script.como_usar;
    estado.scriptAtual = script;
  }

  btnGerar.addEventListener("click", async () => {
    const pedido = pedidoInput.value.trim();
    erroInicial.classList.add("escondido");
    if (!pedido) {
      erroInicial.textContent = "Escreva o que você precisa antes de continuar.";
      erroInicial.classList.remove("escondido");
      return;
    }
    estado.messages = [{ role: "user", content: pedido }];
    mostrar(telaCarregando);
    try {
      const dados = await chamarApi(estado.messages);
      tratarResultado(dados);
    } catch (err) {
      mostrar(telaInicial);
      erroInicial.textContent = err.message;
      erroInicial.classList.remove("escondido");
    }
  });

  btnEnviarRespostas.addEventListener("click", async () => {
    erroPerguntas.classList.add("escondido");
    const faltando = estado.perguntas.some((p) => !(p.id in estado.respostas));
    if (faltando) {
      erroPerguntas.textContent = "Escolha uma opção para cada pergunta.";
      erroPerguntas.classList.remove("escondido");
      return;
    }
    const novasMensagens = [
      ...estado.messages,
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: estado.toolUseId,
            content: JSON.stringify(estado.respostas),
          },
        ],
      },
    ];
    mostrar(telaCarregando);
    try {
      const dados = await chamarApi(novasMensagens);
      tratarResultado(dados);
    } catch (err) {
      mostrar(telaPerguntas);
      erroPerguntas.textContent = err.message;
      erroPerguntas.classList.remove("escondido");
    }
  });

  document.getElementById("btn-copiar").addEventListener("click", async () => {
    await navigator.clipboard.writeText(estado.scriptAtual.conteudo);
    const btn = document.getElementById("btn-copiar");
    const original = btn.textContent;
    btn.textContent = "Copiado!";
    setTimeout(() => (btn.textContent = original), 1500);
  });

  document.getElementById("btn-baixar").addEventListener("click", () => {
    const script = estado.scriptAtual;
    const blob = new Blob([script.conteudo], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = script.nome_arquivo || "script.txt";
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("btn-novo").addEventListener("click", () => {
    pedidoInput.value = "";
    estado = { messages: [], toolUseId: null, perguntas: [], respostas: {} };
    mostrar(telaInicial);
  });
})();
