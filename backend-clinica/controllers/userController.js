import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../model/User.js";

const secret = process.env.SECRET_JWT;

const formatarTexto = (texto) => {
    if (!texto) return "";
    return texto.toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase());
};

const validarNome = (nome) => {
    const regex = /^[a-zA-ZÀ-ÿ\s]+$/;
    return regex.test(nome);
};

const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export const newUser = async (req, res) => {
    try {
        let { name, email, password } = req.body;
        
        if (!name || !email || !password) return res.status(400).json({ message: "Preencha todos os campos." });

        if (!validarNome(name)) {
            return res.status(400).json({ message: "O nome não pode conter números ou símbolos especiais." });
        }
        if (!validarEmail(email)) {
            return res.status(400).json({ message: "Formato de e-mail inválido." });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "A senha deve ter no mínimo 8 caracteres." });
        }

        name = formatarTexto(name);

        const userExists = await User.findOne({ where: { email } });
        if (userExists) return res.status(409).json({ message: "E-mail já cadastrado." });

        const totalUsuarios = await User.count();
        if (totalUsuarios > 0 && !req.user) {
            return res.status(403).json({ message: "Acesso Negado! O sistema já possui um Admin." });
        }

        let seraAdmin = totalUsuarios === 0;

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        await User.create({
            name, email, password: hashedPassword, isAdmin: seraAdmin
        });

        res.status(201).json({ message: "Usuário criado com sucesso!" });

    } catch (erro) {
        res.status(500).json({ message: `Erro: ${erro.message}` });
    }
}

export const listUsers = async (req, res) =>{
    try{
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'isAdmin'], 
            order: [['isAdmin', 'DESC'], ['name', 'ASC']]
        });
        res.status(200).json(users);
    } catch(erro){
        res.status(500).json({ message: `Erro interno: ${erro.message}` });
    }
}

export const validateUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ message: "Usuário não cadastrado." });

        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: "Senha inválida." });
        }

        const token = jwt.sign(
            { userId: user.id, name: user.name, isAdmin: user.isAdmin },
            secret,
            { expiresIn: "2h" }
        );

        res.status(200).json({ 
            message: "Login realizado.", 
            token, isAdmin: user.isAdmin, name: user.name 
        });

    } catch (erro) {
        res.status(500).json({ message: `Erro no login: ${erro.message}` });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user.userId == id) return res.status(400).json({ message: "Você não pode excluir a si mesmo." });
        const linhas = await User.destroy({ where: { id } });
        if (linhas === 0) return res.status(404).json({ message: "Usuário não encontrado." });
        res.status(200).json({ message: "Usuário excluído com sucesso." });
    } catch (erro) {
        res.status(500).json({ message: `Erro: ${erro.message}` });
    }
}

export const checkSystemStatus = async (req, res) => {
    try {
        const count = await User.count();
        res.status(200).json({ initialized: count > 0 });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

        // Objeto de atualização
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;

        // Se mandou senha nova, criptografa. Se mandou vazio, ignora.
        if (password && password.trim() !== "") {
            if (password.length < 8) return res.status(400).json({ message: "Senha deve ter min 8 caracteres." });
            const salt = bcrypt.genSaltSync(10);
            updateData.password = bcrypt.hashSync(password, salt);
        }

        await user.update(updateData);
        
        res.status(200).json({ message: "Dados atualizados com sucesso." });
    } catch (erro) {
        res.status(500).json({ message: `Erro: ${erro.message}` });
    }
};

export const elevateUser = async (req, res) => { res.status(200).send("OK"); }