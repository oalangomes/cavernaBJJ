// 🔁 Dados dos treinos
let dadosTreinos = {};

async function carregarDados() {
    dadosTreinos = await getDados();
    const hoje = new Date().toISOString().slice(0, 10);

    if (hasTreinoHoje() ) {
        const confirmar = confirm("📌 Você já fez um treino hoje. Deseja criar outro treino?");
        if (confirmar) {
            sugerirGrupo();
        } else {
            mostrarTreino(hoje);
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
    return Object.keys(localStorage)
        .filter(k => k.startsWith("treino_"))
        .map(k => ({ data: k.replace("treino_", ""), grupo: JSON.parse(localStorage[k]).grupo }))
        .filter(t => t.data !== hoje)
        .sort((a, b) => b.data.localeCompare(a.data))
        .slice(0, 2)
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
        document.getElementById("sugestao").innerHTML = `<p>Nenhum grupo disponível fora do cooldown.</p>`;
        return;
    }

    const candidatos = gruposValidos.map(g => ({ grupo: g, score: score[g] }));
    candidatos.sort((a, b) => a.score - b.score);
    const menorScore = candidatos[0].score;
    const empatados = candidatos.filter(c => c.score === menorScore);
    const escolhido = empatados[Math.floor(Math.random() * empatados.length)].grupo;

    window.grupoSugerido = escolhido;

    let saida = `<h3>📌 Grupo Sugerido: ${escolhido.toUpperCase()}</h3>`;
    saida += `<p><strong>Treinos Recentes:</strong> ${cooldown.join(", ") || "nenhum"}</p>`;
    saida += `<p><strong>Grupos com menor score:</strong> ${empatados.map(e => e.grupo.toUpperCase()).join(", ")}</p>`;

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
    const perfil = getPerfil();
    const fatorI = { leve: 1, media: 2, intensa: 3 }[intensidade];

    const base = dadosTreinos[grupo].filter(ex => {
        return !perfil.equipamento?.length || ex.equipamentos.every(eq => perfil.equipamento.includes(eq));
    });

    const qtd = Math.min(Math.ceil((tempo / 15) + fatorI), base.length);
    const lista = base.slice(0, qtd);
    localStorage.setItem("treino_" + dia + grupo, JSON.stringify({ tempo, intensidade, grupo, feitos: [], lista }));
    mostrarTreino(dia);
}

// ✅ Exibir treino
function mostrarTreino(dia) {
    const t = JSON.parse(localStorage.getItem("treino_" + dia + window.grupoSugerido));
    if (!t || !t.lista?.length) {
        document.getElementById("treino").innerHTML = `<h3>${dia} - ${t?.grupo?.toUpperCase() || ""}</h3><p>Nenhum treino encontrado</p>`;
        return;
    }
    const lista = t.lista.map((ex, i) => {
        const c = t.feitos.includes(i) ? "checked" : "";
        return `<li><label><input type="checkbox" onchange="check(${i})" ${c}/> ${ex.nome}</label></li>`;
    }).join("");
    document.getElementById("treino").innerHTML = `<h3>${dia} - ${t.grupo.toUpperCase()}</h3><p>${t.tempo}min | ${t.intensidade}</p><ul class="checklist">${lista}</ul>`;
}

function check(i) {
    const dia = new Date().toISOString().slice(0, 10);
    const t = JSON.parse(localStorage.getItem("treino_" + dia + window.grupoSugerido));
    t.feitos = t.feitos.includes(i) ? t.feitos.filter(x => x !== i) : [...t.feitos, i];
    localStorage.setItem("treino_" + dia + window.grupoSugerido, JSON.stringify(t));
    mostrarTreino(dia);
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
    const dataFiltro = document.getElementById("filtroData").value;
    const membroFiltro = document.getElementById("filtroMembro").value;
    const objetivoFiltro = document.getElementById("filtroObjetivo").value;

    const historico = Object.keys(localStorage)
        .filter(k => k.startsWith("treino_"))
        .map(k => {
            const data = k.replace("treino_", "");
            const treino = JSON.parse(localStorage.getItem(k));
            return { data, ...treino };
        })
        .filter(t => {
            if (dataFiltro && t.data !== dataFiltro) return false;
            if (membroFiltro && t.grupo !== membroFiltro) return false;
            if (objetivoFiltro && !t.lista.some(e => e.objetivo.includes(objetivoFiltro))) return false;
            return true;
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
    const diasTreinados = new Set(historico.map(t => t.data)).size;
    const sequenciaDias = calcularSequenciaDias(historico.map(t => t.data));
    const resumo = `
    <strong>Tempo Total:</strong> ${totalTempo} minutos<br>
    <strong>Dias Treinados:</strong> ${diasTreinados} dias<br>
    <strong>Maior Sequência:</strong> ${sequenciaDias} dias consecutivos
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
        await carregarDados();
    }
};

// 🔄 Carregar dados ao iniciar  
