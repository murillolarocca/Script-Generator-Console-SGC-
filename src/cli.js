#!/usr/bin/env node
require("dotenv").config();
const readline = require("readline");
const { askSGC } = require("./aiClient");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

function printScript(script) {
  console.log("\n=== " + script.titulo + " (" + script.linguagem + ") ===");
  console.log("Arquivo sugerido: " + script.nome_arquivo + "\n");
  console.log(script.conteudo);
  console.log("\n--- Como usar ---");
  console.log(script.como_usar);
  console.log("=====================================\n");
}

async function main() {
  console.log("SGC - Script Generator Console");
  console.log("Descreva o script que você precisa (em linguagem simples).\n");

  const pedido = await ask("> ");
  let messages = [{ role: "user", content: pedido }];

  while (true) {
    let result;
    try {
      result = await askSGC(messages);
    } catch (err) {
      console.error("\nErro: " + err.message);
      rl.close();
      return;
    }

    const { assistantMessage, toolUse } = result;
    messages.push(assistantMessage);
    const input = toolUse.input;

    if (input.status === "precisa_info") {
      console.log("\nPreciso confirmar alguns detalhes:\n");
      const respostas = {};
      for (const p of input.perguntas || []) {
        console.log(p.pergunta);
        p.opcoes.forEach((o, i) => console.log(`  ${i + 1}) ${o.rotulo}`));
        let escolha = await ask("Escolha o número: ");
        let idx = parseInt(escolha, 10) - 1;
        const opcao = p.opcoes[idx] || { valor: escolha };
        respostas[p.id] = opcao.valor;
        console.log("");
      }
      messages.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: JSON.stringify(respostas),
          },
        ],
      });
      continue;
    }

    if (input.status === "pronto" && input.script) {
      printScript(input.script);
      rl.close();
      return;
    }

    console.log("Resposta inesperada da IA.");
    rl.close();
    return;
  }
}

main();
