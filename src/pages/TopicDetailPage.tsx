import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TopicDetailPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to study dashboard since topics are now skills
    navigate("/study-dashboard");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Przekierowanie...</h1>
        <p className="text-muted-foreground">Tematy zostały zastąpione nowymi umiejętnościami.</p>
      </div>
    </div>
  );
};

export default TopicDetailPage;