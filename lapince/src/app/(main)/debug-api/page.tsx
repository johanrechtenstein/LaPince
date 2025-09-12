import { API_BASE_URL } from '@/config/api';

export default function DebugAPI() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f0f0f0' }}>
      <h1>🔍 Debug API Configuration</h1>
      <p><strong>API_BASE_URL:</strong> <code>{API_BASE_URL}</code></p>
      <p><strong>NODE_ENV:</strong> <code>{process.env.NODE_ENV}</code></p>
      <p><strong>NEXT_PUBLIC_API_URL:</strong> <code>{process.env.NEXT_PUBLIC_API_URL || 'NON DÉFINI'}</code></p>
      
      <hr />
      <h2>Test de connectivité</h2>
      <button onClick={() => {
        fetch(`${API_BASE_URL}/api/auth/login`, { method: 'POST' })
          .then(r => console.log('Réponse:', r.status))
          .catch(e => console.error('Erreur:', e))
      }}>
        Tester l'API
      </button>
    </div>
  );
}