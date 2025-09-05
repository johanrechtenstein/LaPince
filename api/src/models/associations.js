import { User } from "./user.js";
import { Account } from "./account.js";
import { Budget } from "./budget.js";
import { Detail_account } from "./detail_account.js";
import { Detail_budget } from "./detail_budget.js"
import { Tag } from "./tag.js";


// user <-> account (One-to-Many)
User.hasMany(Account, {
  foreignKey: "user_id",
  as: "account"
});
Account.belongsTo(User,{
  foreignKey: "user_id",
  as: "user"
});

// account <-> detail_account (One-to-Many)
Account.hasMany(Detail_account, {
    foreignKey: "account_id",
    as: "detail_account"
  });
Detail_account.belongsTo(Account,{
    foreignKey: "account_id",
    as: "account"
  });

// detail_account <-> tag (One-to-Many)
Detail_account.hasMany(Tag, {
  foreignKey: "detail_account_id",
  as: "tag"
});
Tag.belongsTo(Detail_account,{
  foreignKey: "detail_account_id",
  as: "detail_account"
});


// user <-> budget (One-to-Many)
User.hasMany(Budget, {
    foreignKey: "user_id",
    as: "budget"
  });
  Budget.belongsTo(User,{
    foreignKey: "user_id",
    as: "user"
  });

// budget <-> detail_budget (One-to-Many)
Budget.hasMany(Detail_budget, {
  foreignKey: "budget_id",
  as: "detail_budget"
});
Detail_budget.belongsTo(Budget,{
  foreignKey: "budget_id",
  as: "budget"
});

// detail_budget <-> tag (One-to-Many)
Detail_budget.hasMany(Tag, {
foreignKey: "detail_budget_id",
as: "tag"
});
Tag.belongsTo(Detail_budget,{
foreignKey: "detail_budget_id",
as: "detail_budget"
});

// account <-> budget (One-to-Many)
Account.hasMany(Budget, {
  foreignKey: "account_id",
  as: "budget"
});
Budget.belongsTo(Account,{
  foreignKey: "account_id",
  as: "account"
});

export { User, Account, Detail_account, Budget, Detail_budget, Tag };