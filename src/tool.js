const RESPOND_TOOL = {
  name: "responder",
  description:
    "Envia a decisão do SGC: ou perguntas de esclarecimento (múltipla escolha) ou o script final completo.",
  input_schema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["precisa_info", "pronto"],
        description:
          "'precisa_info' se faltar informação essencial; 'pronto' se já é possível gerar o script final.",
      },
      perguntas: {
        type: "array",
        description: "Perguntas de múltipla escolha (só quando status=precisa_info). Máximo 4.",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "identificador curto, ex: 'sistema_operacional'" },
            pergunta: { type: "string", description: "pergunta em linguagem simples" },
            opcoes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  rotulo: { type: "string", description: "texto curto mostrado ao usuário" },
                  valor: { type: "string", description: "valor técnico correspondente" },
                },
                required: ["rotulo", "valor"],
              },
            },
          },
          required: ["id", "pergunta", "opcoes"],
        },
      },
      script: {
        type: "object",
        description: "Só quando status=pronto.",
        properties: {
          titulo: { type: "string" },
          linguagem: { type: "string", description: "ex: bash, python, powershell" },
          nome_arquivo: { type: "string" },
          conteudo: { type: "string", description: "o código-fonte completo do script" },
          como_usar: {
            type: "string",
            description: "instruções curtas e diretas de uso (poucas linhas)",
          },
        },
        required: ["titulo", "linguagem", "nome_arquivo", "conteudo", "como_usar"],
      },
    },
    required: ["status"],
  },
};

module.exports = { RESPOND_TOOL };
