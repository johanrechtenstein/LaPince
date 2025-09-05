import { DataTypes, Model } from "sequelize";
import { sequelize } from "./dbClientSequelize.js";

export class Detail_account extends Model {}

Detail_account.init({
  date: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.NUMBER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
}, {
  sequelize,
  tableName: "detail_account"
});