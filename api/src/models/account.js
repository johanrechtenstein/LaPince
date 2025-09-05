import { DataTypes, Model } from "sequelize";
import { sequelize } from "./dbClientSequelize.js";

export class Account extends Model {}

Account.init({
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
}, {
  sequelize,
  tableName: "account"
});