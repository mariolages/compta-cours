import { Button } from "@/components/ui/button";

interface RegisterFormFooterProps {
  isLoading: boolean;
}

export const RegisterFormFooter = ({ isLoading }: RegisterFormFooterProps) => {
  return (
    <>
      <Button 
        type="submit" 
        className="w-full btn-primary"
        disabled={isLoading}
      >
        {isLoading ? "Inscription..." : "S'inscrire"}
      </Button>

      <p className="text-sm text-gray-500 text-center">
        Déjà inscrit ?{" "}
        <a href="/login" className="text-primary hover:text-primary-hover">
          Se connecter
        </a>
      </p>
    </>
  );
};