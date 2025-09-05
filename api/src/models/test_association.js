import { User, Account, Budget, Detail_account, Detail_budget, Tag } from "./associations.js";
import { sequelize } from "./dbClientSequelize.js";
import "dotenv/config";

// == User ==
const user = await User.findOne({ include: "account" });
console.log(user.toJSON());

// == Account ==
const account = await Account.findOne({ include: ["detail_account", "budget" ]});
console.log(account.toJSON());

// == Budget ==
const budget = await Budget.findOne({ include: "detail_budget"});
console.log(budget.toJSON());

// == Detail_account ==
const detail_account = await Detail_account.findOne({ include: "tag"});
console.log(detail_account.toJSON());

// == Detail_budget ==
const detail_budget = await Detail_budget.findOne({ include: "tag"});
console.log(detail_budget.toJSON());


// == Tag ==
const tag = await Tag.findOne({ include: ["detail_account","detail_budget"] });
console.log(tag.toJSON());

// == Fermer le tunnel de connexion Sequelize pour que le script nous rende automatiquement la main
await sequelize.close();
