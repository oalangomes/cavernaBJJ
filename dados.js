async function getDados() {
    const resp = await fetch('exercicios.json');
    if (!resp.ok) throw new Error('Falha ao carregar exercicios');
    return await resp.json();
}
