import { Router } from "express";
import * as userController from "./controllers/userController.js";
import * as accountController from "./controllers/accountController.js";
import * as budgetController from "./controllers/budgetController.js";
import * as detailBudgetController from "./controllers/detailBudgetController.js"
import * as detailAccountController from "./controllers/detailAccountController.js"
import * as authController from "./controllers/authController.js";



export const router = Router();

//route vérification si email et pseudo déjà utilisé
router.get("/user/check", userController.checkUser );
// route des users
router.get("/user", userController.getAllUser);
router.get("/user/:id", userController.getOneUser);
router.post("/user", userController.createUser);
router.put("/user/:id", userController.updateUser);
router.delete("/user/:id", userController.deleteUser);

// Route d'authentification
router.post("/auth/login", authController.login);
// Optionnel : route de logout
router.post("/auth/logout", authController.logout);
// Optionnel : route pour vérifier si l'utilisateur est connecté
router.get("/auth/me", authController.getCurrentUser);




// route des comptes
router.get("/account", accountController.getAllAccount);
router.get("/account/:id", accountController.getOneAccount);
router.post("/account", accountController.createAccount);
router.put("/account/:id", accountController.updateAccount);
router.delete("/account/:id", accountController.deleteAccount);

router.get("/user/:userId/account", accountController.getAllAccountOfUser)

// route détail des comptes
router.get("/detailaccount", detailAccountController.getAllDetailAccount);
router.get("/detailaccount/:id", detailAccountController.getOneDetailAccount);
router.post("/detailaccount", detailAccountController.createDetailAccount);
router.put("/detailaccount/:id", detailAccountController.updateDetailAccount);
router.delete("/detailaccount/:id", detailAccountController.deleteDetailAccount);

router.get("/user/:userId/account/:accountId/detailaccount", detailAccountController.getAllDetailAccountOfMember)


// route des budgets

router.get("/budget", budgetController.getAllBudget);
router.get("/budget/:id", budgetController.getOneBudget);
router.post("/budget", budgetController.createBudget);
router.put("/budget/:id", budgetController.updateBudget);
router.delete("/budget/:id", budgetController.deleteBudget);
router.get("/user/:userId/budget", budgetController.getAllBudgetOfUser)
router.get("/account/:accountId/budget", budgetController.getAllBudgetOfAccount)

// route détail des budget
router.get("/detailbudget", detailBudgetController.getAllDetailBudget);
router.get("/detailbudget/:id", detailBudgetController.getOneDetailBudget);
router.post("/detailbudget", detailBudgetController.createDetailBudget);
router.put("/detailbudget/:id", detailBudgetController.updateDetailBudget);
router.delete("/detailbudget/:id", detailBudgetController.deleteDetailBudget);

router.get("/user/:userId/budget/:budgetId/detailbudget", detailBudgetController.getAllDetailBudgetOfMember)


// Middleware 404
router.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});



