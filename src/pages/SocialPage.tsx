import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SocialPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard since social features are deprecated for now
    navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Przekierowanie...</h1>
        <p className="text-muted-foreground">Funkcje społecznościowe zostały tymczasowo wyłączone.</p>
      </div>
    </div>
  );
};

export default SocialPage;