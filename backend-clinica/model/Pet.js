import { DataTypes } from "sequelize";
import conectDB from "../database/db.js";

const sequelize = await conectDB();

const Pet = sequelize.define("Pets", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    nome: { type: DataTypes.STRING, allowNull: false },
    raca: { type: DataTypes.STRING, allowNull: false },
    especie: { type: DataTypes.STRING, allowNull: false },
    sexo: { type: DataTypes.STRING, allowNull: false },
    
    tutor: { type: DataTypes.STRING, allowNull: false },
    tutorTelefone: { type: DataTypes.STRING, allowNull: true },
    tutorEmail: { type: DataTypes.STRING, allowNull: true },
    
    dataNascimento: { type: DataTypes.DATEONLY, allowNull: true },
    idadeEstimada: { type: DataTypes.BOOLEAN, defaultValue: false }, 
    
    vacinasTomadas: { type: DataTypes.TEXT, allowNull: true },
    
    agendamentos: { type: DataTypes.TEXT, allowNull: true },
    
    observacoes: { type: DataTypes.TEXT, allowNull: true }
});

await Pet.sync();
export default Pet;