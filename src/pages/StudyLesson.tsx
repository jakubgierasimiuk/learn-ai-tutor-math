import { useParams } from "react-router-dom";
import { PhaseBasedLesson } from "@/components/PhaseBasedLesson";

const StudyLesson = () => {
  const { skillId } = useParams<{ skillId: string }>();

  if (!skillId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Błąd</h1>
          <p className="text-muted-foreground">Nie znaleziono ID umiejętności</p>
        </div>
      </div>
    );
  }

  return <PhaseBasedLesson skillId={skillId} />;
};

export default StudyLesson;