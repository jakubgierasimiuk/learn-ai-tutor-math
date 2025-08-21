import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const StudyLesson = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to study dashboard - lessons are handled by Study Tutor system
    navigate("/study");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Przekierowanie...</h1>
        <p className="text-muted-foreground">Sesje nauki zostały zastąpione przez Real Learning Engine.</p>
      </div>
    </div>
  );
};

export default StudyLesson;