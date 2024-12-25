import { Input } from "@/components/ui/input";

interface RegisterFormFieldsProps {
  name: string;
  email: string;
  password: string;
  adminCode: string;
  isLoading: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onAdminCodeChange: (value: string) => void;
}

export const RegisterFormFields = ({
  name,
  email,
  password,
  adminCode,
  isLoading,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onAdminCodeChange,
}: RegisterFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Input
          type="text"
          placeholder="Nom complet"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="input-field"
          required
          disabled={isLoading}
        />
      </div>
      
      <div>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="input-field"
          required
          disabled={isLoading}
        />
      </div>
      
      <div>
        <Input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className="input-field"
          required
          disabled={isLoading}
        />
      </div>
      
      <div>
        <Input
          type="text"
          placeholder="Code administrateur (optionnel)"
          value={adminCode}
          onChange={(e) => onAdminCodeChange(e.target.value)}
          className="input-field"
          disabled={isLoading}
        />
      </div>
    </div>
  );
};