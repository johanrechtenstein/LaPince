import { Account, User } from "../models/index.js";
import { accountSchema, updateAccountSchema} from "../schemas/account.js"





export async function getAllAccount(req, res) {
  const account = await Account.findAll({ include: "detail_account" });
  res.json(account);
}


export async function getOneAccount(req, res) {
  const account = await Account.findByPk(req.params.id, { include: "detail_account" });
  if (!account) {
    return res.status(404).json({ error: "account not found." });
  }
  res.json(account);
}



export async function updateAccount(req, res) {
  const accountId = parseInt(req.params.id);
  if (!Number.isInteger(accountId)) {
    return res.status(404).json({ error: `Account not found` });
  }
  const { title, user_id } = (updateAccountSchema.safeParse(req.body)).data;
  const account = await Account.findByPk(accountId);
  if (!account) {
    return res.status(404).json({ error: `Account not found` });
  }
  if (user_id) {
    const user = await User.findByPk(user_id);
    if (! user) {
      return res.status(404).json({ error: `User not found` });
    }
  } 
  const updatedAccount = await account.update({
    title,
    user_id
  });
  res.json(updatedAccount);
}



export async function deleteAccount(req, res) {
  const accountId = parseInt(req.params.id);
  if (! Number.isInteger(accountId)) {
    return res.status(404).json({ error: "Account not found" });
  }
  const account = await Account.findByPk(accountId);
  if (!account) {
    return res.status(404).json({ error: "Account not found" });
  }
  await account.destroy();
  res.status(204).end();
}



export async function getAllAccountOfUser(req, res) {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) { return res.status(404).json({ error: "Invalid userId." }); }
  const user = await User.findByPk(userId);
  if (!user) { return res.status(404).json({ error: "User not found." });}
  const account = await Account.findAll({ where: { user_id: userId }});
  res.json(account);
}
