import { DataTypes } from 'sequelize';
import sequelize from '../db2.js';
const userModel = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true },
    firstName: { type: DataTypes.STRING },
    lastName: { type: DataTypes.STRING },
    image: { type: DataTypes.STRING },
    pdf: { type: DataTypes.STRING },
});
export default userModel;
