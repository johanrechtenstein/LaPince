// src/controllers/authController.js
import { User } from "../models/index.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { loginSchema } from "../schemas/auth.js";
import sanitizeHtml from "sanitize-html";


export const login = async (req, res) => {
  console.log(req.body);
  try {
    const validatedData = loginSchema.parse(req.body);
    let { pseudo, password } = validatedData;
    pseudo = sanitizeHtml(pseudo);
    password = sanitizeHtml(password);
    // Validation des données
    if (!pseudo || !password) {
      return res.status(400).json({ 
        error: "Pseudo et mot de passe requis" 
      });
    }
    // Chercher l'utilisateur par pseudo
    const user = await User.findOne({ 
      where: { pseudo } 
    });
    if (!user) {
      return res.status(401).json({ 
        error: "Identifiants incorrects" 
      });
    }
    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: "Identifiants incorrects" 
      });
    }
    // Réponse de succès (sans renvoyer le mot de passe)
    const token = jwt.sign(
      { pseudo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'strict' });
    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      user: { id: user.id, pseudo: user.pseudo, email: user.email, role: user.role, created_at: user.created_at }
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ 
      error: "Erreur interne du serveur" 
    });
  }
};



export const logout = async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ 
    message: "Déconnexion réussie" 
  });
};




export const getCurrentUser = async (req, res) => {

  const token = req.cookies?.token;
  if (!token) {
    console.log('❌ Pas de token');
    return res.status(401).json({ error: 'Non authentifié' });
  }
  
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_for_development';
    const decoded = jwt.verify(token, jwtSecret);
    console.log('🔓 Token décodé:', decoded);
    
    // Récupérer les informations complètes de l'utilisateur depuis la base de données
    const user = await User.findOne({
      where: { pseudo: decoded.pseudo },
      attributes: ['id', 'pseudo', 'email', 'role','created_at'] // Exclure le password
    });
    
    console.log('👤 Utilisateur trouvé:', user);
    req.user = decoded;
    if (!user) {
      console.log('❌ Utilisateur non trouvé en base');
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    console.log('✅ Réponse envoyée');
    res.json({ user: user });
  } catch (e) {
    console.error('❌ Erreur token:', e);
    res.status(401).json({ error: 'Token invalide' });
  }
};