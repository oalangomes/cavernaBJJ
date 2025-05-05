// 🔁 Dados dos treinos
let dadosTreinos = {};

async function carregarDados() {
    dadosTreinos = await getDados();
    const hoje = new Date().toISOString().slice(0, 10);

    if (hasTreinoHoje()) {
        const confirmar = confirm("📌 Você já fez um treino hoje. Deseja criar outro treino?");
        if (confirmar) {
            sugerirGrupo();
        } else {
            exibirCard('historicoCard')
        }
    } else {
        sugerirGrupo();
    }
}

function hasTreinoHoje() {
    const hoje = new Date().toISOString().slice(0, 10);
    return Object.keys(localStorage)
        .filter(k => k.startsWith("treino_" + hoje))
        .some(k => {
            try {
                const t = JSON.parse(localStorage.getItem(k));
                return t?.feitos && t.feitos.length > 0;
            } catch (e) {
                console.warn(`Erro ao processar treino ${k}`, e);
                return false;
            }
        });
}



// 🔐 Perfil
function getPerfil() {
    return JSON.parse(localStorage.getItem("perfil_usuario") || "{}");
}

function salvarPerfil() {
    function getMarcados(id) {
        return Array.from(document.querySelectorAll(`#${id} input:checked`)).map(el => el.value);
    }

    const nome = document.getElementById("nomePerfil").value.trim();
    if (!nome) return alert("Por favor, preencha o campo de nome.");

    const locais = getMarcados("locais");
    const equipamentos = getMarcados("equipamentos");
    const objetivos = getMarcados("objetivos");

    if (!locais.length || !equipamentos.length || !objetivos.length)
        return alert("Selecione ao menos uma opção em todos os campos.");

    const perfil = { nome, locais, equipamento: equipamentos, objetivos };
    localStorage.setItem("perfil_usuario", JSON.stringify(perfil));
    alert("Perfil salvo com sucesso!");

    exibirCard("mainCard");
}

function editarPerfil() {
    const perfil = getPerfil();
    document.getElementById("nomePerfil").value = perfil.nome || "";

    ["locais", "equipamentos", "objetivos"].forEach(grupo => {
        document.querySelectorAll(`#${grupo} input[type=checkbox]`).forEach(input => {
            input.checked = (perfil[grupo] || perfil.equipamento || []).includes(input.value);
        });
    });

    exibirCard("perfilCard");
}

// 📌 Sugerir Grupo
function getUltimosTreinos() {
    const hoje = new Date().toISOString().slice(0, 10);
    console.log("hoje", hoje);
    return Object.keys(localStorage)
        .filter(k => k.startsWith("treino_"))
        .map(k => ({
            data: k.replace("treino_", ""),
            feitos: JSON.parse(localStorage[k]).feitos,
            grupo: JSON.parse(localStorage[k]).grupo
        }))
        .filter(t => t.data !== hoje && t.feitos && t.feitos.length > 0)
        .sort((a, b) => b.data.localeCompare(a.data))
        .map(t => t.grupo);
}

async function sugerirGrupo() {
    const cooldown = getUltimosTreinos();
    const score = {};

    for (const grupo in dadosTreinos) score[grupo] = 0;

    Object.keys(localStorage)
        .filter(k => k.startsWith("treino_"))
        .forEach(k => {
            try {

                const t = JSON.parse(localStorage.getItem(k));
                // ✅ Remove se não houver exercícios marcados como feitos
                if (!t.feitos || t.feitos.length === 0) {
                    console.log("treino removido", t);
                    localStorage.removeItem(k);
                    return;
                }

                // ✅ Processa score normalmente
                if (t?.grupo && Array.isArray(t.lista)) {
                    const fatorI = { leve: 1, media: 2, intensa: 3 }[t.intensidade] || 1;
                    const fatorT = t.tempo / 15 || 1;
                    score[t.grupo] += t.lista.reduce((s, ex) => s + (ex.peso || 2), 0) * fatorI * fatorT;
                }
            } catch (e) {
                console.warn(`Erro ao processar treino ${k}`, e);
            }
        });

    const gruposValidos = Object.keys(dadosTreinos).filter(g => !cooldown.includes(g));
    if (gruposValidos.length === 0) {
        document.getElementById("sugestao").innerHTML = `<p style="color:#c00"><strong>⚠️ Nenhum grupo disponível fora do cooldown.</strong></p>`;

        // Desabilitar botões e selects
        document.getElementById("tempo").disabled = true;
        document.getElementById("intensidade").disabled = true;
        document.querySelector("button[onclick*='gerarTreino']").disabled = true;
        document.querySelector("button[onclick*='sugerirGrupo']").disabled = true;

        return;
    }

    const candidatos = gruposValidos.map(g => ({ grupo: g, score: score[g] }));
    candidatos.sort((a, b) => a.score - b.score);
    const menorScore = candidatos[0].score;
    const empatados = candidatos.filter(c => c.score === menorScore);
    const escolhido = empatados[Math.floor(Math.random() * empatados.length)].grupo;

    window.grupoSugerido = escolhido;

    let saida = `<h3>📌 Grupo Sugerido: ${escolhido.toUpperCase()}</h3>`;
    saida += `<p>📅 <strong> Treinos Recentes:</strong> ${cooldown.join(", ") || "nenhum"}</p>`;
    //  saida += `<p><strong>Grupos com menor score:</strong> ${empatados.map(e => e.grupo.toUpperCase()).join(", ")}</p>`;

    document.getElementById("sugestao").innerHTML = saida;
    limparTreino();
    gerarTreino();
}

// ✅ Limpar treino
function limparTreino() {
    const dia = new Date().toISOString().slice(0, 10);
    localStorage.removeItem("treino_" + dia);
    document.getElementById("treino").innerHTML = "";
}

// ✅ Gerar treino
function gerarTreino() {
    const tempo = parseInt(document.getElementById("tempo").value);
    const intensidade = document.getElementById("intensidade").value;
    const grupo = window.grupoSugerido || "core";
    const dia = new Date().toISOString().slice(0, 10);
    const chave = "treino_" + dia + grupo;
    const perfil = getPerfil();
    const fatorI = { leve: 1, media: 2, intensa: 3 }[intensidade];

    const base = dadosTreinos[grupo].filter(ex => {
        return !perfil.equipamento?.length || ex.equipamentos.every(eq => perfil.equipamento.includes(eq));
    });

    const qtd = Math.min(Math.ceil((tempo / 15) + fatorI), base.length);
    const lista = embaralharArray(base).slice(0, qtd);

    localStorage.setItem(chave, JSON.stringify({ tempo, intensidade, grupo, feitos: [], lista }));
    mostrarTreino(dia, chave);
}

function embaralharArray(arr) {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}



// ✅ Exibir treino
function mostrarTreino(dia, chave = null) {
    const grupo = window.grupoSugerido || "core";
    const chaveFinal = chave || ("treino_" + dia + grupo);
    const t = JSON.parse(localStorage.getItem(chaveFinal));
    if (!t || !t.lista?.length) {
        document.getElementById("treino").innerHTML = `<h3>${dia} - ${t?.grupo?.toUpperCase() || ""}</h3><p>Nenhum treino encontrado</p>`;
        return;
    }
    const lista = t.lista.map((ex, i) => {
        const c = t.feitos.includes(i) ? "checked" : "";
        return `<li><label><input type="checkbox" onchange="check(${i}, '${chaveFinal}')" ${c}/> ${ex.nome}</label></li>`;
    }).join("");
    document.getElementById("treino").innerHTML = `<h3>${dia} - ${t.grupo.toUpperCase()}</h3><p>${t.tempo}min | ${t.intensidade}</p><ul class="checklist">${lista}</ul>`;
}


function check(i, chave) {
    const t = JSON.parse(localStorage.getItem(chave));
    t.feitos = t.feitos.includes(i) ? t.feitos.filter(x => x !== i) : [...t.feitos, i];
    localStorage.setItem(chave, JSON.stringify(t));
    mostrarTreino(new Date().toISOString().slice(0, 10), chave);
}


// ⬇️ Exportar treino
function exportarTreino() {
    let txt = "";
    Object.keys(localStorage).filter(k => k.startsWith("treino_")).sort().forEach(k => {
        const dia = k.replace("treino_", "");
        const t = JSON.parse(localStorage.getItem(k));
        txt += `=== ${dia} ===\nGrupo: ${t.grupo}\nTempo: ${t.tempo}min | Intensidade: ${t.intensidade}\n`;
        t.lista.forEach((ex, i) => {
            const mark = t.feitos.includes(i) ? "✓" : "☐";
            txt += `${mark} ${ex.nome}\n`;
        });
        txt += `\n`;
    });
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "historico_caverna_bjj.txt";
    a.click();
    URL.revokeObjectURL(url);
}

// 📊 Histórico
function carregarHistorico() {
    const dataInicio = document.getElementById("filtroDataInicio").value;
    const dataFim = document.getElementById("filtroDataFim").value;
    const membroFiltro = document.getElementById("filtroMembro").value.toLowerCase();
    const objetivoFiltro = document.getElementById("filtroObjetivo").value.toLowerCase();
    const intensidadeFiltro = document.getElementById("filtroIntensidade").value.toLowerCase();

    const historico = Object.keys(localStorage)
        .filter(k => k.startsWith("treino_"))
        .map(k => {
            const t = JSON.parse(localStorage.getItem(k));
            const raw = k.replace("treino_", "");
            const data = raw.slice(0, 10); // ISO date
            const grupo = t.grupo || raw.slice(10);
            return { data, grupo, ...t };
        })
        .filter(t => {
            const { data, grupo, lista, intensidade } = t;

            const dataValida = (!dataInicio || data >= dataInicio) &&
                (!dataFim || data <= dataFim);

            const membroValido = !membroFiltro || grupo.toLowerCase() === membroFiltro;

            const objetivoValido = !objetivoFiltro || lista.some(e =>
                e.objetivo.map(o => o.toLowerCase()).includes(objetivoFiltro)
            );

            const intensidadeValida = !intensidadeFiltro || intensidade.toLowerCase() === intensidadeFiltro;

            return dataValida && membroValido && objetivoValido && intensidadeValida;
        });

    const tabela = document.getElementById("tabelaHistorico");
    tabela.innerHTML = historico.length
        ? historico.map(t => `
            <tr>
                <td>${t.data}</td>
                <td>${t.grupo.toUpperCase()}</td>
                <td>${t.lista.map(e => e.objetivo.join(", ")).join("; ")}</td>
                <td>${t.tempo} min</td>
                <td>${t.intensidade}</td>
            </tr>
        `).join("")
        : "<tr><td colspan='5'>Nenhum treino encontrado</td></tr>";

    avaliarHistorico(historico);
}


function avaliarHistorico(historico) {
    const totalTempo = historico.reduce((sum, t) => sum + t.tempo, 0);
    const dias = historico.map(t => t.data);
    const diasTreinados = new Set(dias).size;
    const sequenciaDias = calcularSequenciaDias(dias);

    // Pluralização
    const treinoTxt = diasTreinados === 1 ? "treino" : "treinos";
    const diaTxt = sequenciaDias === 1 ? "dia" : "dias";

    const resumo = `
      <ul class="resumoHistorico">
        <li>⏱️ <strong>Tempo Total:</strong> ${totalTempo} minutos</li>
        <li>📋 <strong>Total de Treinos:</strong> ${diasTreinados} ${treinoTxt}</li>
        <li>📈 <strong>Maior Sequência:</strong> ${sequenciaDias} ${diaTxt} consecutivo${sequenciaDias > 1 ? "s" : ""}</li>
      </ul>
    `;

    document.getElementById("avaliacaoResumo").innerHTML = resumo;
}


function calcularSequenciaDias(datas) {
    const ordenadas = [...new Set(datas)].sort();
    let maior = 0, atual = 1;
    for (let i = 1; i < ordenadas.length; i++) {
        const diff = new Date(ordenadas[i]) - new Date(ordenadas[i - 1]);
        if (diff === 86400000) atual++;
        else { maior = Math.max(maior, atual); atual = 1; }
    }
    return Math.max(maior, atual);
}

function exportarHistorico() {
    let txt = "Data,Membro,Objetivo,Tempo,Intensidade\n";
    Object.keys(localStorage).filter(k => k.startsWith("treino_")).forEach(k => {
        const t = JSON.parse(localStorage.getItem(k));
        const data = k.replace("treino_", "");
        const objetivo = t.lista.map(e => e.objetivo.join(", ")).join("; ");
        txt += `${data},${t.grupo},${objetivo},${t.tempo},${t.intensidade}\n`;
    });
    const blob = new Blob([txt], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "historico_treinos.csv";
    a.click();
    URL.revokeObjectURL(url);
}

// 🧭 Navegação entre cards
function exibirCard(id) {
    document.querySelectorAll(".card").forEach(c => c.style.display = "none");
    document.getElementById(id).style.display = "block";
    if (id === "historicoCard") carregarHistorico();
}





// 🟢 Início
window.onload = async () => {
    const perfil = getPerfil();

    if (!perfil.nome || !perfil.locais || !perfil.equipamento || !perfil.objetivos) {
        exibirCard("perfilCard");
    } else {
        document.getElementById("nomePerfil").value = perfil.nome;
        exibirCard("mainCard");
        document.getElementById("tempo").disabled = false;
        document.getElementById("intensidade").disabled = false;
        document.querySelector("button[onclick*='gerarTreino']").disabled = false;
        document.querySelector("button[onclick*='sugerirGrupo']").disabled = false;

        await carregarDados();
    }

    const hoje = new Date();
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(hoje.getDate() - 6); // Inclui hoje no intervalo

    document.getElementById("filtroDataInicio").value = seteDiasAtras.toISOString().slice(0, 10);
    document.getElementById("filtroDataFim").value = hoje.toISOString().slice(0, 10);


};

// 🔄 Carregar dados ao iniciar  
