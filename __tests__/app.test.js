const { gerarTreino, calcularSequenciaDias, __setDadosTreinos } = require('../app');

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
      <div id="treino"></div>
    `;
    localStorage.setItem('perfil_usuario', JSON.stringify({equipamento: [], locais:['Casa']}));
    __setDadosTreinos({
      core: [
        {nome:'ex1', equipamentos:[], objetivo:['forca'], exclusivoAcademia:false},
        {nome:'ex2', equipamentos:[], objetivo:['forca'], exclusivoAcademia:false},
        {nome:'ex3', equipamentos:[], objetivo:['forca'], exclusivoAcademia:false}
      ]
    });
    global.grupoSugerido = 'core';
    global.mostrarTreino = jest.fn();
  });

  test('cria entrada no localStorage para o treino', () => {
    gerarTreino();
    const dia = new Date().toISOString().slice(0,10);
    const chave = `treino_${dia}core`;
    const stored = JSON.parse(localStorage.getItem(chave));
    expect(stored).toBeTruthy();
    expect(stored.grupo).toBe('core');
    expect(stored.tempo).toBe(30);
    expect(mostrarTreino).toHaveBeenCalled();
  });
});
