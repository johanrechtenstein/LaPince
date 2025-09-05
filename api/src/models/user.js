import { DataTypes, Model } from "sequelize";
import { sequelize } from "./dbClientSequelize.js";

export class User extends Model {}

User.init({
  pseudo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
 
}, {
  sequelize,
  tableName: "user"
});