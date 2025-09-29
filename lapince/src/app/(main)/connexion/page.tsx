"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios,{isAxiosError} from 'axios';
import { useAuth } from '@/contexts/Authcontext';
import { API_BASE_URL } from '@/config/api';


export default function Login() {
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { fetchUser } = useAuth();
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation basique
    if (!pseudo || !password) {
      setError('Veuillez remplir tous les champs.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`,{
        pseudo: pseudo,
        password: password},
        {withCredentials:true
      });
         
      await fetchUser(); 
      router.push(`/userPage`);


    } catch (err) {
      if (isAxiosError(err)) {
        // Si c'est le cas, nous pouvons accéder en toute sécurité à ses propriétés
        setError(err.response?.data?.message || "Une erreur est survenue");
      } else {
        // Si ce n'est pas une erreur Axios, traitez-la comme une erreur générique
        setError("Une erreur inattendue est survenue");
      }

    } finally {
    setIsLoading(false);
    }
    };

  return (
    <div className='flex justify-center w-full min-h-[calc(100vh-15rem)] '>
    <div className='outline-solid outline-blue-700 rounded-lg m-auto '>
      <h1 className='text-blue-700 text-2xl text-center m-3'>Connexion</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className='flex flex-col px-4' >
          <label className='p-2' htmlFor="pseudo">Pseudo:</label>
          <input className='border-none bg-gray-300'
            type="text"
            id="pseudo"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className='flex flex-col px-4'>

          <label className='p-2' htmlFor="password">Mot de passe:</label>
          <input className='border-none bg-gray-300'
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div  >
        <div className='flex justify-center py-9'>
        <button type="submit" disabled={isLoading}><div className="bg-blue-700 p-4 rounded-full text-white transition delay-150 duration-300 ease-in-out -translate-y-1 hover:scale-110 hover:bg-green-500 text-center cursor-none md:cursor-auto">Se connecter</div></button>
        </div>
      </form>
    </div>
    </div>
  );
}