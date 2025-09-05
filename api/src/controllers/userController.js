import sanitizeHtml from "sanitize-html"
import { User} from "../models/index.js"
import bcrypt from 'bcrypt';
import { userSchema, updateUserSchema } from "../schemas/user.js";


export async function getAllUser(req,res){
  try {
    const user = await User.findAll();
    res.json(user);
} catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
}
}


export async function getOneUser(req, res) {
    const userId = userSchema.parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(404).json({ error: "User not found. Please verify the provided ID." });
    }
    const user = await User.findByPk(userId);
    if (! user) {
      return res.status(404).json({ error: "User not found. Please verify the provided ID." });
    }
    res.json(user);
  
  }


  export async function createUser(req, res) {
    let { pseudo, email,password, role } = userSchema.parse(req.body);
      pseudo = sanitizeHtml(pseudo);
      email= sanitizeHtml(email);
      password = sanitizeHtml(password);
      role = sanitizeHtml(role); 
    if (! pseudo || typeof pseudo !== "string") {
      res.status(400).json({ error: "Property 'pseudo' should be a non empty string." });
      return; 
    }
    if (! email || typeof email !== "string") {
      res.status(400).json({ error: "Property 'email' should be a non empty string." });
      return;
      }
    if (! password || typeof password !== "string") {
      res.status(400).json({ error: "Property 'password' should be a non empty string." });
      return; 
      }
    if (! role || typeof role !== "string") {
        res.status(400).json({ error: "Property 'role' should be a non empty string." });
        return; 
      }
     try {
    // Hachage du mot de passe
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = await User.create({
      pseudo: pseudo,
      email: email,
      password: hashedPassword, // On enregistre le mot de passe haché
      role: role
    });

    // Ne pas renvoyer le mot de passe dans la réponse
    const { password: _, ...userWithoutPassword } = createdUser.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}



export async function updateUser(req, res) {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID provided." });
  }

  try {
    // 1. Validation du corps de la requête avec Zod
    const validationResult = updateUserSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: validationResult.error.issues 
      });
    }

    const { pseudo, email, password } = validationResult.data;

    // 2. Recherche et mise à jour de l'utilisateur
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found. Please verify the provided ID." });
    }

    if (pseudo) {
      user.pseudo = pseudo;
    }

    if (email) {
      user.email = email;
    }

    if (password) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // 3. Ne pas renvoyer le mot de passe dans la réponse
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
    
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}

  export async function deleteUser(req, res) {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(404).json({ error: "List not found. Please verify the provided ID." });
    }
    const user = await User.findByPk(userId);
    if (! user) {
      return res.status(404).json({ error: "List not found. Please verify the provided ID." });
    }
    await user.destroy();
    res.status(204).end();
  }


  export async function checkUser(req, res) {
    try {
      let { email, pseudo } = req.query;
      
      // Sanitization comme dans les autres fonctions
      if (email) {
        email = sanitizeHtml(email);
      }
      if (pseudo) {
        pseudo = sanitizeHtml(pseudo);
      }
      
      // Vérification qu'au moins un paramètre est fourni
      if (!email && !pseudo) {
        return res.status(400).json({ error: 'Email ou pseudo requis' });
      }
      
      // Construction de la clause WHERE
      let whereClause = {};
      if (email) {
        whereClause.email = email;
      } else if (pseudo) {
        whereClause.pseudo = pseudo;
      }
      
      // Recherche avec la syntaxe Sequelize explicite
      const existingUser = await User.findOne({ where: whereClause });
      
      res.json({ exists: !!existingUser });
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }