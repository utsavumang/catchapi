import { useState } from 'react';
import { registerSchema } from '@catchapi/shared';

function App() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTestValidation = () => {
    const result = registerSchema.safeParse({
      email: email,
      password: 'password123',
      name: 'Test User',
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
    } else {
      setError(null);
      alert('Valid, Shared Link is fine.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6">CatchAPI Client</h1>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="text"
          placeholder="Enter email to test Zod..."
          className="p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handleTestValidation}
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded transition-colors"
        >
          Test Shared Zod Validation
        </button>

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </div>
  );
}

export default App;
