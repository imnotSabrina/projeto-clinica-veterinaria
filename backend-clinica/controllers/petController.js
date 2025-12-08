import Pet from "../model/Pet.js";

const validarTextoPuro = (texto) => /^[a-zA-ZÀ-ÿ\s]+$/.test(texto);

const validarDatas = (nascimento, agendamentos) => {
    const hoje = new Date();
    hoje.setHours(0,0,0,0);

    if (nascimento) {
        const nascDate = new Date(nascimento);
        if (nascDate > hoje) return "Data de nascimento não pode ser no futuro.";
    }

    if (agendamentos) {
        try {
            const lista = JSON.parse(agendamentos);
            for (let item of lista) {
                const dataAgendada = new Date(item.data);
                if (dataAgendada < hoje) return `O agendamento da vacina ${item.vacina} não pode ser no passado.`;
            }
        } catch (e) { return "Erro no formato dos agendamentos."; }
    }
    return null;
};

export const newPet = async (req, res) => {
    try {
        let { 
            nome, raca, dataNascimento, idadeEstimada, especie, sexo, 
            tutor, tutorTelefone, tutorEmail,          
            vacinasTomadas, agendamentos, observacoes 
        } = req.body;

        if (!nome || !raca || !tutor || !especie || !sexo) {
            return res.status(400).json({ message: "Preencha os campos obrigatórios (*)" });
        }

        if (!validarTextoPuro(nome)) return res.status(400).json({ message: "Nome do Pet inválido (sem números)." });
        if (!validarTextoPuro(tutor)) return res.status(400).json({ message: "Nome do Tutor inválido (sem números)." });

        // Validação de Datas
        const erroData = validarDatas(dataNascimento, agendamentos);
        if (erroData) return res.status(400).json({ message: erroData });

        const petExistente = await Pet.findOne({ where: { nome, tutor } });
        if (petExistente) return res.status(409).json({ message: "Pet já cadastrado para este tutor!" });

        const novoPet = await Pet.create({ 
            nome, raca, dataNascimento, idadeEstimada, especie, sexo,
            tutor, tutorTelefone, tutorEmail,
            vacinasTomadas, agendamentos, observacoes 
        });
        
        res.status(201).json({ message: "Pet cadastrado!", pet: novoPet });

    } catch (erro) {
        res.status(500).json({ message: `Erro: ${erro.message}` });
    }
};

export const updatePet = async (req, res) => {
    try {
        const { id } = req.params;
        const dados = req.body;

        if (dados.nome && !validarTextoPuro(dados.nome)) return res.status(400).json({ message: "Nome inválido." });
        
        const erroData = validarDatas(dados.dataNascimento, dados.agendamentos);
        if (erroData) return res.status(400).json({ message: erroData });

        const [linhas] = await Pet.update(dados, { where: { id } });
        if (linhas === 0) return res.status(404).json({ message: "Pet não encontrado." });
        
        res.status(200).json({ message: "Atualizado." });
    } catch (erro) { 
        res.status(500).json({ message: erro.message }); 
    }
};

export const listPets = async (req, res) => {
    try {
        const pets = await Pet.findAll({ order: [['nome', 'ASC']] });
        res.status(200).json(pets);
    } catch (erro) { res.status(500).json({ message: erro.message }); }
};

export const deletePet = async (req, res) => {
    try {
        const { id } = req.params;
        const linhas = await Pet.destroy({ where: { id } });
        if (linhas === 0) return res.status(404).json({ message: "Pet não encontrado." });
        res.status(200).json({ message: "Excluído." });
    } catch (erro) { res.status(500).json({ message: erro.message }); }
};