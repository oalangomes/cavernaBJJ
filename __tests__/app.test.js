const { gerarTreino, calcularSequenciaDias, __setDadosTreinos, sugerirGrupo, expandirEquipamentosSelecionados, abrirModalExercicio } = require('../app');

describe('calcularSequenciaDias', () => {
  test('calcula maior sequencia', () => {
    const datas = ['2023-01-01', '2023-01-02', '2023-01-04', '2023-01-05', '2023-01-06'];
    expect(calcularSequenciaDias(datas)).toBe(3);
  });
});

describe('gerarTreino', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <input id="tempo" value="30" />
      <select id="intensidade"><option value="media" selected>media</option></select>
      <input id="academiaOnlyToggle" type="checkbox" />
      <select id="grupoSelect" multiple>
        <option value="core" selected>core</option>
        <option value="cardio" selected>cardio</option>
      </select>
      <div id="treino"></div>
    `;
    localStorage.setItem('perfil_usuario', JSON.stringify({equipamento: [], locais:['Casa']}));
    __setDadosTreinos({
      core: [
        {nome:'ex1', equipamentos:[], objetivo:['forca'], exclusivoAcademia:false},
        {nome:'ex2', equipamentos:[], objetivo:['forca'], exclusivoAcademia:false}
      ],
      cardio: [
        {nome:'ex2', equipamentos:[], objetivo:['resistencia'], exclusivoAcademia:false}
      ]
    });
    global.grupoSugerido = 'core';
  });

    test('cria entrada no localStorage para o treino', () => {
      gerarTreino();
      const dia = new Date().toISOString().slice(0,10);
      const chave = `treino_${dia}`;
      const stored = JSON.parse(localStorage.getItem(chave));
      expect(stored).toBeTruthy();
      expect(stored.grupos.length).toBe(2);
      expect(stored.grupos).toEqual(expect.arrayContaining(['core','cardio']));
      const nomes = stored.lista.map(e => e.nome);
      expect(new Set(nomes).size).toBe(nomes.length);
      expect(stored.tempo).toBe(30);
      expect(document.getElementById('treino').innerHTML).not.toBe('');
    });

    test('limita grupos conforme tempo disponível', () => {
      document.getElementById('tempo').value = '15';
      const sel = document.getElementById('grupoSelect');
      sel.options[0].selected = true;
      sel.options[1].selected = true;
      gerarTreino();
      const dia = new Date().toISOString().slice(0,10);
      const stored = JSON.parse(localStorage.getItem(`treino_${dia}`));
      expect(stored.grupos.length).toBe(1);
      expect(stored.grupos[0]).toBe('core');
  });

    test('considera alternativas de equipamento ao filtrar exercícios', () => {
      const select = document.getElementById('grupoSelect');
      Array.from(select.options).forEach((opt, idx) => opt.selected = idx === 0);
      localStorage.setItem('perfil_usuario', JSON.stringify({ equipamento: ['mochila'], locais: ['Casa'] }));
      __setDadosTreinos({
        core: [
          { nome: 'halter substituido', equipamentos: ['halteres'], objetivo: ['forca'], exclusivoAcademia: false, peso: 2 }
        ]
      });

      gerarTreino();
      const dia = new Date().toISOString().slice(0,10);
      const stored = JSON.parse(localStorage.getItem(`treino_${dia}`));
      expect(stored.lista).toHaveLength(1);
      expect(stored.lista[0].equipamentosDetalhes[0]).toMatchObject({ principal: 'halteres', utilizado: 'mochila' });
      expect(stored.lista[0].substituicoesTexto).toMatch(/Mochila com peso/);
    });

    test('expande equipamento de academia para equivalentes base', () => {
      const select = document.getElementById('grupoSelect');
      Array.from(select.options).forEach((opt, idx) => opt.selected = idx === 0);
      localStorage.setItem('perfil_usuario', JSON.stringify({ equipamento: ['maquina_polia'], locais: ['Academia'] }));
      __setDadosTreinos({
        core: [
          { nome: 'puxada', equipamentos: ['barra'], objetivo: ['forca'], exclusivoAcademia: true, peso: 3 }
        ]
      });

      gerarTreino();
      const dia = new Date().toISOString().slice(0,10);
      const stored = JSON.parse(localStorage.getItem(`treino_${dia}`));
      expect(stored.lista).toHaveLength(1);
      expect(stored.lista[0].nome).toBe('puxada');
    });

    test('gera treino com exercícios exclusivos de academia quando academia only está ativo', () => {
      const select = document.getElementById('grupoSelect');
      Array.from(select.options).forEach((opt, idx) => opt.selected = idx === 0);
      document.getElementById('academiaOnlyToggle').checked = true;
      localStorage.setItem('perfil_usuario', JSON.stringify({ equipamento: [], locais: ['Academia'] }));
      __setDadosTreinos({
        core: [
          { nome: 'agachamento livre', equipamentos: [], objetivo: ['forca'], exclusivoAcademia: false, peso: 2 },
          { nome: 'leg press', equipamentos: [], objetivo: ['forca'], exclusivoAcademia: true, peso: 3 }
        ]
      });

      gerarTreino();
      const dia = new Date().toISOString().slice(0,10);
      const stored = JSON.parse(localStorage.getItem(`treino_${dia}`));
      expect(stored.lista).toHaveLength(1);
      expect(stored.lista[0].nome).toBe('leg press');
      expect(stored.modoLocal).toBe('academia_only');
    });

    test('faz fallback para exercícios gerais quando academia only não encontra exclusivos', () => {
      const select = document.getElementById('grupoSelect');
      Array.from(select.options).forEach((opt, idx) => opt.selected = idx === 0);
      document.getElementById('academiaOnlyToggle').checked = true;
      localStorage.setItem('perfil_usuario', JSON.stringify({ equipamento: [], locais: ['Academia'] }));
      __setDadosTreinos({
        core: [
          { nome: 'prancha', equipamentos: [], objetivo: ['core'], exclusivoAcademia: false, peso: 2 }
        ]
      });

      gerarTreino();
      const dia = new Date().toISOString().slice(0,10);
      const stored = JSON.parse(localStorage.getItem(`treino_${dia}`));
      expect(stored.lista).toHaveLength(1);
      expect(stored.lista[0].nome).toBe('prancha');
      expect(stored.modoLocal).toBe('academia_only');
    });
});

describe('expandirEquipamentosSelecionados', () => {
  test('inclui equivalentes dos equipamentos de academia', () => {
    const result = expandirEquipamentosSelecionados(['maquina_guiada']);
    expect(result).toEqual(expect.arrayContaining(['maquina_guiada', 'barra', 'halteres']));
  });
});

describe('sugerirGrupo', () => {
  test('pede confirmação ao limpar múltiplos grupos selecionados', async () => {
    localStorage.clear();
    document.body.innerHTML = `
      <select id="grupoSelect" multiple>
        <option value="core" selected>core</option>
        <option value="cardio" selected>cardio</option>
      </select>
    `;

    const spy = jest.spyOn(global, 'confirm').mockReturnValue(false);
    await sugerirGrupo();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});


describe('abrirModalExercicio', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="modalExercicio" style="display:none;"></div>
      <h3 id="modalTitulo"></h3>
      <img id="modalImagem" style="display:none;" />
      <p id="modalDescricao"></p>
      <iframe id="modalVideo" style="display:none;"></iframe>
    `;
    localStorage.setItem('perfil_usuario', JSON.stringify({ equipamento: [], locais: ['Casa'] }));
  });

  test('exibe imagem quando o exercício possui campo imagem', () => {
    __setDadosTreinos({
      core: [{ nome: 'prancha', descricao: 'desc', video: 'https://example.com', imagem: 'assets/exercicios/prancha.jpg', equipamentos: [] }]
    });

    abrirModalExercicio('prancha');

    const imagem = document.getElementById('modalImagem');
    expect(imagem.style.display).toBe('block');
    expect(imagem.getAttribute('src')).toBe('assets/exercicios/prancha.jpg');
    expect(imagem.getAttribute('alt')).toContain('prancha');
  });

  test('oculta imagem quando o exercício não possui campo imagem', () => {
    __setDadosTreinos({
      core: [{ nome: 'canivete', descricao: 'desc', video: 'https://example.com', equipamentos: [] }]
    });

    abrirModalExercicio('canivete');

    const imagem = document.getElementById('modalImagem');
    expect(imagem.style.display).toBe('none');
    expect(imagem.getAttribute('src')).toBeNull();
  });
});
