import { DataTypes, Model } from "sequelize";
import { sequelize } from "./dbClientSequelize.js";

export class Budget extends Model {}

Budget.init({
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  }, 
  limit: {
    type: DataTypes.NUMBER,
    allowNull: true
  },
  date:{
    type: DataTypes.STRING(7),
    allowNull: false
  }
}, {
  sequelize,
  tableName: "budget"
});