import { Sequelize } from "sequelize";

const conectDB = async () => {
    try {
        const sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: './database/data.sqlite',
            logging: false
        });

        await sequelize.authenticate();
        console.log("Conexão com SQLite estabelecida com sucesso!");
        
        return sequelize;
    } catch (error) {
        console.error("Erro fatal ao conectar no banco:", error);
        return null;
    }
};

export default conectDB;