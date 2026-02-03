let setorCount = 0;
let dataSelecionada = new Date();

/* ---------------- SETORES COMUNS ---------------- */
const setoresComuns = [
    "RM HOSPITAL",
    "TC HOSPITAL",
    "USG HOSPITAL",
    "RM ANEXO 1 DE",
    "RM ANEXO 2 DE",
    "RM ANEXO 3 DE",
    "TC ANEXO DE",
    "USG ANEXO DE"
];

if (!localStorage.getItem("setoresSalvos")) {
    localStorage.setItem("setoresSalvos", JSON.stringify(setoresComuns));
}

/* ---------------- INIT ---------------- */
document.addEventListener("DOMContentLoaded", () => {
    atualizarDataTitulo();
    carregarNomesSalvos();
    carregarSetoresSalvos();
    carregarHorariosSalvos();
    adicionarSetor();
});

/* ---------------- DATA ---------------- */
function atualizarDataTitulo() {
    const dataFormatada = dataSelecionada.toLocaleDateString("pt-BR");
    document.getElementById("dataHoje").innerText = `📅 Data: ${dataFormatada}`;
}

function alternarData() {
    document.getElementById("inputData").style.display = "inline-block";
    document.getElementById("btnConfirmarData").style.display = "inline-block";
    document.getElementById("btnAlterarData").style.display = "none";
}

function confirmarData() {
    const valor = document.getElementById("inputData").value;
    if (!valor) return;
    dataSelecionada = new Date(valor + "T00:00:00");
    atualizarDataTitulo();

    document.getElementById("inputData").style.display = "none";
    document.getElementById("btnConfirmarData").style.display = "none";
    document.getElementById("btnAlterarData").style.display = "inline-block";
}

function adicionarSetor() {
    setorCount++;
    const container = document.getElementById("setoresContainer");

    const setorDiv = document.createElement("div");
    setorDiv.className = "setor";
    setorDiv.id = `setor-${setorCount}`;

    setorDiv.innerHTML = `
        <label><strong>Setor:</strong></label>
        <div class="setor-info">
            <input type="text" class="input-setor" placeholder="Nome do setor"
                list="setoresList" onchange="salvarSetor(this.value)">
            <label>Entrada:
                <input type="time" class="input-horario-inicio"
                    list="horariosInicioList"
                    onchange="salvarHorario(this.value,'inicio')">
            </label>
            <label>Saída:
                <input type="time" class="input-horario-fim"
                    list="horariosFimList"
                    onchange="salvarHorario(this.value,'fim')">
            </label>
        </div>

        <div class="nomesContainer" id="nomes-${setorCount}"></div>
        <button onclick="adicionarNome(${setorCount})">+ Adicionar Nome</button>
        ${setorCount > 1 ? `<button class="repetir" onclick="repetirNomes(${setorCount})">↻ Repetir Nomes</button>` : ""}
    `;

    container.appendChild(setorDiv);
    adicionarNome(setorCount);
}

/* ---------------- NOMES ---------------- */
function adicionarNome(setorId, valor = "") {
    const container = document.getElementById(`nomes-${setorId}`);
    const div = document.createElement("div");
    div.className = "nome-proc";

    div.innerHTML = `
        <input type="text" class="input-nome" placeholder="Nome"
            list="nomesSalvosList" value="${valor}"
            onchange="salvarNome(this.value)">
        <input type="number" class="input-proc" placeholder="Qtd" min="0">
    `;

    container.appendChild(div);
}

function repetirNomes(setorId) {
    const primeiro = document.querySelector("#setor-1 .nomesContainer");
    const nomes = primeiro.querySelectorAll(".nome-proc");
    const container = document.getElementById(`nomes-${setorId}`);
    container.innerHTML = "";

    nomes.forEach(n => {
        const nome = n.querySelector(".input-nome").value.trim();
        if (nome) adicionarNome(setorId, nome);
    });
}

/* ---------------- LOCALSTORAGE ---------------- */
function salvarNome(nome) {
    if (!nome) return;
    let lista = JSON.parse(localStorage.getItem("nomesSalvos")) || [];
    if (!lista.includes(nome)) {
        lista.push(nome);
        localStorage.setItem("nomesSalvos", JSON.stringify(lista));
        atualizarDatalist("nomesSalvos", "nomesSalvosList");
    }
}

function salvarSetor(nome) {
    if (!nome) return;
    let lista = JSON.parse(localStorage.getItem("setoresSalvos")) || [];
    if (!lista.includes(nome)) {
        lista.push(nome);
        localStorage.setItem("setoresSalvos", JSON.stringify(lista));
        atualizarDatalist("setoresSalvos", "setoresList");
    }
}

function salvarHorario(valor, tipo) {
    if (!valor) return;
    const key = tipo === "inicio" ? "horariosInicio" : "horariosFim";
    let lista = JSON.parse(localStorage.getItem(key)) || [];
    if (!lista.includes(valor)) {
        lista.push(valor);
        localStorage.setItem(key, JSON.stringify(lista));
        atualizarDatalistHorarios();
    }
}

function carregarNomesSalvos() {
    atualizarDatalist("nomesSalvos", "nomesSalvosList");
}

function carregarSetoresSalvos() {
    atualizarDatalist("setoresSalvos", "setoresList");
}

function carregarHorariosSalvos() {
    atualizarDatalistHorarios();
}

function atualizarDatalist(key, id) {
    const lista = JSON.parse(localStorage.getItem(key)) || [];
    const dl = document.getElementById(id);
    dl.innerHTML = "";
    lista.forEach(v => {
        const o = document.createElement("option");
        o.value = v;
        dl.appendChild(o);
    });
}

function atualizarDatalistHorarios() {
    atualizarDatalist("horariosInicio", "horariosInicioList");
    atualizarDatalist("horariosFim", "horariosFimList");
}

/* ---------------- RELATÓRIO ---------------- */
function gerarRelatorio() {
    const setores = document.querySelectorAll(".setor");
    let texto = `📅 Data: ${dataSelecionada.toLocaleDateString("pt-BR")}\n\n`;

    setores.forEach(setor => {
        const nomeSetor = setor.querySelector(".input-setor").value.trim();
        if (!nomeSetor) return;

        const ini = setor.querySelector(".input-horario-inicio").value;
        const fim = setor.querySelector(".input-horario-fim").value;
        const nomes = setor.querySelectorAll(".nome-proc");

        let total = 0;
        let bloco = `*Setor: ${nomeSetor}${ini && fim ? ` ${ini} ÀS ${fim}` : ""}*\n`;

        nomes.forEach(n => {
            const nome = n.querySelector(".input-nome").value.trim();
            const qtd = parseInt(n.querySelector(".input-proc").value);
            if (nome && qtd > 0) {
                bloco += `- ${nome}: ${qtd} Exames\n`;
                total += qtd;
            }
        });

        if (total > 0) {
            bloco += `*Total: ${total} Exames*\n\n`;
            texto += bloco;
        }
    });

        const obs = document.getElementById("observacoes").value.trim();
        if (obs) {
        texto += `*📝 Observações:*\n*${obs}*\n\n`;
    }

    if (texto.trim().length < 15) {
        alert("Preencha pelo menos um setor.");
        return;
    }

    document.getElementById("relatorio").innerText = texto.trim();
    document.getElementById("relatorio").style.display = "block";
    document.getElementById("btnEnviar").style.display = "inline-block";
}

/* ---------------- ENVIAR WHATSAPP ---------------- */
function enviarParaWhatsApp() {
    const relatorio = encodeURIComponent(document.getElementById("relatorio").innerText);
    const url = `https://wa.me/?text=${relatorio}`;
    window.open(url, "_blank");
}
