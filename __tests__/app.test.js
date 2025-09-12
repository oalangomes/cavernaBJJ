const { gerarTreino, calcularSequenciaDias, __setDadosTreinos, sugerirGrupo } = require('../app');

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
