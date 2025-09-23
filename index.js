document.addEventListener("DOMContentLoaded", () => {
    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR');
    document.getElementById("dataHoje").innerText = dataFormatada;

    carregarNomesSalvos(); // carrega nomes salvos no localStorage
    adicionarSetor(); // adiciona o primeiro setor por padrão
});

let setorCount = 0;

// Função para adicionar setor
function adicionarSetor() {
    setorCount++;
    const container = document.getElementById("setoresContainer");

    const setorDiv = document.createElement("div");
    setorDiv.classList.add("setor");
    setorDiv.id = `setor-${setorCount}`;
    setorDiv.innerHTML = `
        <label><strong>Setor:</strong></label>
        <div class="setor-info">
            <input type="text" placeholder="Nome do setor" class="input-setor" list="setoresList" />
            <label>Entrada:
                <input type="time" class="input-horario-inicio" />
            </label>
            <label>Saída:
                <input type="time" class="input-horario-fim" />
            </label>
        </div>

        <div class="nomesContainer" id="nomes-${setorCount}"></div>

        <button onclick="adicionarNome(${setorCount})">+ Adicionar Nome</button>
        ${setorCount > 1 ? `<button class="repetir" onclick="repetirNomes(${setorCount})">↻ Repetir Nomes</button>` : ""}
    `;

    container.appendChild(setorDiv);
    adicionarNome(setorCount); // já adiciona um campo de nome por padrão
}

// Função para adicionar nome ao setor com rolagem automática
function adicionarNome(setorId, valor = "") {
    const nomesContainer = document.getElementById(`nomes-${setorId}`);

    const div = document.createElement("div");
    div.classList.add("nome-proc");
    div.innerHTML = `
        <input type="text" placeholder="Nome" class="input-nome" list="nomesSalvosList" value="${valor}" onchange="salvarNome(this.value)" />
        <input type="number" placeholder="Qtd procedimentos" class="input-proc" min="0" />
    `;

    nomesContainer.appendChild(div);

    // Rolagem automática para o novo campo adicionado
    div.scrollIntoView({ behavior: "smooth", block: "center" });

    // Focar automaticamente no input de nome
    div.querySelector(".input-nome").focus();
}

// Função para salvar nomes no localStorage
function salvarNome(nome) {
    if (!nome) return;
    let nomesSalvos = JSON.parse(localStorage.getItem("nomesSalvos")) || [];
    if (!nomesSalvos.includes(nome)) {
        nomesSalvos.push(nome);
        localStorage.setItem("nomesSalvos", JSON.stringify(nomesSalvos));
        atualizarDatalist();
    }
}

// Carrega nomes salvos no datalist
function carregarNomesSalvos() {
    atualizarDatalist();
}

// Atualiza o datalist de nomes
function atualizarDatalist() {
    const nomesSalvos = JSON.parse(localStorage.getItem("nomesSalvos")) || [];
    const datalist = document.getElementById("nomesSalvosList");
    datalist.innerHTML = "";
    nomesSalvos.forEach(nome => {
        const option = document.createElement("option");
        option.value = nome;
        datalist.appendChild(option);
    });
}

// Função para repetir nomes do primeiro setor
function repetirNomes(setorId) {
    const primeiroSetor = document.querySelector("#setor-1 .nomesContainer");
    const nomesPrimeiroSetor = primeiroSetor.querySelectorAll(".nome-proc");

    if (nomesPrimeiroSetor.length === 0) {
        alert("O primeiro setor não possui nomes para repetir.");
        return;
    }

    const nomesContainer = document.getElementById(`nomes-${setorId}`);
    nomesContainer.innerHTML = "";

    nomesPrimeiroSetor.forEach(n => {
        const nome = n.querySelector(".input-nome").value.trim();
        if (nome !== "") {
            adicionarNome(setorId, nome);
        }
    });
}

// Função para gerar relatório
function gerarRelatorio() {
    const setores = document.querySelectorAll(".setor");
    let relatorioFinal = "";

    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR');

    relatorioFinal += `📅 Data: ${dataFormatada}\n\n`;

    setores.forEach(setorDiv => {
        const setorNome = setorDiv.querySelector(".input-setor").value.trim();
        const horarioInicio = setorDiv.querySelector(".input-horario-inicio").value;
        const horarioFim = setorDiv.querySelector(".input-horario-fim").value;
        let horarioTexto = "";

        if (horarioInicio && horarioFim) {
            horarioTexto = ` ${horarioInicio} ÀS ${horarioFim}`;
        }

        const nomeCompletoSetor = setorNome + horarioTexto;

        const nomes = setorDiv.querySelectorAll(".nome-proc");

        if (setorNome === "" || nomes.length === 0) return;

        let total = 0;
        let textoSetor = `*Setor: ${nomeCompletoSetor}*\n`;

        nomes.forEach(n => {
            const nome = n.querySelector(".input-nome").value.trim();
            const qtd = parseInt(n.querySelector(".input-proc").value);

            if (nome !== "" && !isNaN(qtd) && qtd > 0) {
                textoSetor += `- ${nome}: ${qtd} Exames\n`;
                total += qtd;
            }
        });

        if (total > 0) {
            textoSetor += `*Total: ${total} Exames*\n\n`;
            relatorioFinal += textoSetor;
        }
    });

    if (relatorioFinal.trim() === `📅 Data: ${dataFormatada}`) {
        alert("Preencha pelo menos um setor com nomes e procedimentos.");
        return;
    }

    document.getElementById("relatorio").innerText = relatorioFinal.trim();
    document.getElementById("relatorio").style.display = 'block';
    document.getElementById("btnCopiar").style.display = 'inline-block';
}

// Copiar relatório para a área de transferência
function copiarRelatorio() {
    const relatorio = document.getElementById("relatorio").innerText.trim();

    if (!relatorio) {
        alert("Nenhum relatório para copiar.");
        return;
    }

    if (navigator.clipboard) {
        navigator.clipboard.writeText(relatorio)
            .then(() => {
                alert("📋 Relatório copiado com sucesso! Abrindo WhatsApp Web...");
                abrirWhatsApp(relatorio);
            })
            .catch(err => {
                console.error("Erro ao copiar para a área de transferência:", err);
                fallbackCopiarTexto(relatorio);
                abrirWhatsApp(relatorio);
            });
    } else {
        fallbackCopiarTexto(relatorio);
        abrirWhatsApp(relatorio);
    }
}

function abrirWhatsApp(texto) {
    const textoEncoded = encodeURIComponent(texto);
    window.open(`https://wa.me/?text=${textoEncoded}`, '_blank');
}

function fallbackCopiarTexto(texto) {
    const textarea = document.createElement("textarea");
    textarea.value = texto;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        alert("📋 Relatório copiado com sucesso (modo compatibilidade)!");
    } catch (err) {
        alert("Erro ao copiar o relatório.");
    }
    document.body.removeChild(textarea);
}
