import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";

const Login = () => {
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-white to-secondary relative">
      <Button 
        variant="ghost" 
        className="absolute top-4 left-4 flex items-center text-primary hover:text-primary/80 text-lg font-semibold" 
        onClick={handleGoBack}
      >
        <ChevronLeft className="mr-2 h-5 w-5" />
        compta-cours.fr
      </Button>
      <LoginForm />
    </div>
  );
};

export default Login;