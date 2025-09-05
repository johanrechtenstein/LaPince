import { DataTypes, Model } from "sequelize";
import { sequelize } from "./dbClientSequelize.js";

export class Detail_budget extends Model {}

Detail_budget.init({
  amount: {
    type: DataTypes.NUMBER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  date: {
    type: DataTypes.STRING(7),
    allowNull:false
  }
}, {
  sequelize,
  tableName: "detail_budget"
});