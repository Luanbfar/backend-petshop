const tempoPorTamanho = (tipo, totalMinutos, quantidadeServico, tempoPM, tempoG) => {

    try{

        if( tipo==='P' || tipo === 'M'){
            totalMinutos +=  quantidadeServico * tempoPM;
        }else if(tipo === 'G'){
            totalMinutos += quantidadeServico * tempoG;
        }else {
            totalMinutos = null;
        }
        return totalMinutos;

    }catch(error){
        console.error('Erro em calcular tempo por tamanho:', error);
        throw error;
    }
};

const transformandoHora = (totalMinutos) => {

    try{

        const horasTermino = Math.floor(totalMinutos / 60);
        const minutosTermino = totalMinutos % 60;
        const hora_termino = `${horasTermino.toString().padStart(2, '0')}:${minutosTermino.toString().padStart(2, '0')}`;

        return hora_termino;
    }catch(error){
        console.error('Erro ao transformar Hora:', error);
        throw error;
    }
}

module.exports = { tempoPorTamanho, transformandoHora };