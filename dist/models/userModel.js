import { DataTypes } from 'sequelize';
import sequelize from '../db2.js';
const userModel = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true },
    firstName: { type: DataTypes.STRING },
    lastName: { type: DataTypes.STRING },
    image: { type: DataTypes.BLOB },
    pdf: { type: DataTypes.BLOB },
});
export default userModel;
