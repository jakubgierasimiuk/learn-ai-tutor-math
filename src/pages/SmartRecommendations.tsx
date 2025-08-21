import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SmartRecommendations = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to real learning page since recommendations are now integrated there
    navigate("/real-learning");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Przekierowanie...</h1>
        <p className="text-muted-foreground">Rekomendacje zostały zintegrowane z nowym systemem Real Learning Engine.</p>
      </div>
    </div>
  );
};

export default SmartRecommendations;