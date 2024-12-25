import { LoginForm } from '@/components/auth/LoginForm';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-white to-secondary relative">
      <Button 
        variant="ghost" 
        className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-gray-900" 
        onClick={handleGoBack}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        compta-cours.fr
      </Button>
      <LoginForm />
    </div>
  );
};

export default Login;