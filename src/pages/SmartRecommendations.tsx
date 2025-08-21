import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SmartRecommendations = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to study dashboard since recommendations are now integrated with Study Tutor
    navigate("/study");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Przekierowanie...</h1>
        <p className="text-muted-foreground">Rekomendacje zostały zintegrowane z systemem Study Tutor na panelu nauki.</p>
      </div>
    </div>
  );
};

export default SmartRecommendations;