import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProgressPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard since analytics is removed
    navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Przekierowanie...</h1>
        <p className="text-muted-foreground">Ta strona została przeniesiona do nowego systemu analityki.</p>
      </div>
    </div>
  );
};

export default ProgressPage;