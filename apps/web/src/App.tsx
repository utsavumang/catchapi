import { RegisterForm } from './components/auth/RegisterForm';
import { LoginForm } from './components/auth/LoginForm';

function App() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row gap-8 items-start w-full max-w-5xl justify-center">
        <LoginForm />
        <RegisterForm />
      </div>
    </div>
  );
}

export default App;
