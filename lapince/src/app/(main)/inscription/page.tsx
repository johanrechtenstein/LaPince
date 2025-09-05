"use client";
// pages/inscription.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios,{isAxiosError} from 'axios';
import { API_BASE_URL } from '@/config/api';

export default function Inscription() {
const [formData, setFormData] = useState({
 pseudo: '',
 email: '',
 confirmEmail: '',
 password: '',
 confirmPassword: '',
 });
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [fieldErrors, setFieldErrors] = useState({
  email: '',
  pseudo: ''
});
const [checkingAvailability, setCheckingAvailability] = useState({
  email: false,
  pseudo: false
});
const router = useRouter();

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
const { name, value } = e.target;
 setFormData({
 ...formData,
 [name]: value,
 });

 // Effacer les erreurs de champ quand l'utilisateur tape
 if (fieldErrors[name as keyof typeof fieldErrors]) {
   setFieldErrors({
     ...fieldErrors,
     [name]: ''
   });
 }
 };

// Fonction pour vérifier la disponibilité d'un champ
const checkFieldAvailability = async (field: 'email' | 'pseudo', value: string) => {
  if (!value.trim()) return;

  setCheckingAvailability(prev => ({ ...prev, [field]: true }));
  setFieldErrors(prev => ({ ...prev, [field]: '' }));

  try {
    const response = await axios.get(`${API_BASE_URL}/api/user/check?${field}=${encodeURIComponent(value)}`);
    
    if (response.data.exists) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: field === 'email' ? 'Cette adresse email est déjà utilisée' : 'Ce pseudo est déjà utilisé'
      }));
    }
  } catch (error) {
    console.error(`Erreur lors de la vérification du ${field}:`, error);
    // Optionnel : afficher une erreur de vérification
    // setFieldErrors(prev => ({ ...prev, [field]: 'Impossible de vérifier la disponibilité' }));
  } finally {
    setCheckingAvailability(prev => ({ ...prev, [field]: false }));
  }
};

// Gestionnaire pour la vérification quand l'utilisateur quitte le champ
const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  
  if (name === 'email' || name === 'pseudo') {
    checkFieldAvailability(name, value);
  }
};

const validateForm = () => {
  // Vérifier qu'il n'y a pas d'erreurs de champ
  if (fieldErrors.email || fieldErrors.pseudo) {
    setError('Veuillez corriger les erreurs avant de continuer');
    return false;
  }

  // Vérifier que les emails correspondent
  if (formData.email !== formData.confirmEmail) {
    setError('Les adresses email ne correspondent pas');
    return false;
  }
  
  // Vérifier que les mots de passe correspondent
  if (formData.password !== formData.confirmPassword) {
    setError('Les mots de passe ne correspondent pas');
    return false;
  }
  
  return true;
};

const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');

 // Valider le formulaire avant d'envoyer
 if (!validateForm()) {
   setLoading(false);
   return;
 }

const apiData = {
 pseudo: formData.pseudo,
 email: formData.email,
 password: formData.password,
 role: 'user'
};

try {
// Requête POST avec axios
const response = await axios.post(`${API_BASE_URL}/api/user`, apiData, {
 headers: {
'Content-Type': 'application/json',
 },
 timeout: 10000 // 10 secondes de timeout
 });
 console.log('Réponse du serveur :', response.data);
 alert("inscription réussi")
// Rediriger vers une page de confirmation si la requête réussit
 router.push('/');
 } catch (error) {
 console.error('Erreur lors de l\'inscription :', error);
if (isAxiosError(error)) {
// Le serveur a répondu avec un code d'erreur
if (error.response) {
 setError(error.response.data.message || error.response.data.error || 'Erreur lors de l\'inscription');
 } else if (error.request) {
// La requête a été faite, mais aucune réponse n'a été reçue
 setError('Impossible de contacter le serveur. Vérifiez que votre serveur backend est démarré sur le port 3001.');
 }
 } else {
// Une erreur non-Axios s'est produite
 setError('Une erreur est survenue');
 }
 } finally {
 setLoading(false);
 }
 };

return (
<div className='flex justify-center py-9'>
<div className='outline-solid outline-blue-700 rounded-lg '>
<h1 className='text-blue-700 text-2xl text-center m-3'>Inscription</h1>
{error && (
<div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 mb-4'>
{error}
</div>
)}
<form onSubmit={handleSubmit}>
<div className='flex flex-col px-4 md:px-10'>
<label className='p-2 self-center' htmlFor="pseudo">Pseudo :</label>
<div className="relative">
<input className={`border-none bg-gray-300 w-full p-2 rounded ${
  fieldErrors.pseudo ? 'border-2 border-red-500' : ''
}`}
type="text"
id="pseudo"
name="pseudo"
value={formData.pseudo}
onChange={handleChange}
onBlur={handleBlur}
required
disabled={loading}
/>
{checkingAvailability.pseudo && (
  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
  </div>
)}
</div>
{fieldErrors.pseudo && (
  <div className="text-red-500 text-sm mt-1 px-2">{fieldErrors.pseudo}</div>
)}
</div>
<div className='md:flex'>
<div className='flex flex-col px-4'>
<label className='p-2' htmlFor="email">Email :</label>
<div className="relative">
<input className={`border-none bg-gray-300 w-full p-2 rounded ${
  fieldErrors.email ? 'border-2 border-red-500' : ''
}`}
type="email"
id="email"
name="email"
value={formData.email}
onChange={handleChange}
onBlur={handleBlur}
required
disabled={loading}
/>
{checkingAvailability.email && (
  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
  </div>
)}
</div>
{fieldErrors.email && (
  <div className="text-red-500 text-sm mt-1 px-2">{fieldErrors.email}</div>
)}
</div>
<div className='flex flex-col px-4'>
<label className='p-2' htmlFor="confirmEmail">Confirmer l'email :</label>
<input className='border-none bg-gray-300 p-2 rounded'
type="email"
id="confirmEmail"
name="confirmEmail"
value={formData.confirmEmail}
onChange={handleChange}
required
disabled={loading}
/>
</div>
</div>
<div className='md:flex'>
<div className='flex flex-col px-4'>
<label className='p-2' htmlFor="password">Mot de passe :</label>
<input className='border-none bg-gray-300 p-2 rounded'
type="password"
id="password"
name="password"
value={formData.password}
onChange={handleChange}
required
disabled={loading}
/>
</div>
<div className='flex flex-col px-4'>
<label className='p-2' htmlFor="confirmPassword">Confirmer le mot de passe :</label>
<input className='border-none bg-gray-300 p-2 rounded'
type="password"
id="confirmPassword"
name="confirmPassword"
value={formData.confirmPassword}
onChange={handleChange}
required
disabled={loading}
/>
</div>
</div>
<div className='flex justify-center py-9'>
<button type="submit" disabled={loading}>
<div className={`p-4 rounded-full text-white transition delay-150 duration-300 ease-in-out text-center cursor-none md:cursor-auto ${
 loading
 ? 'bg-gray-400 cursor-not-allowed'
 : 'bg-blue-700 -translate-y-1 hover:scale-110 hover:bg-red-500'
}`}>
{loading ? 'Inscription...' : 'S\'inscrire'}
</div>
</button>
</div>
</form>
</div>
</div>
 );
}