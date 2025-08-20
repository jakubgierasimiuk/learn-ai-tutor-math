import { RealLearningInterface } from "@/components/RealLearningInterface";
import { Seo } from "@/components/Seo";

export const RealLearningPage = () => {
  return (
    <>
      <Seo 
        title="Real Learning Engine - AI Tutor"
        description="Experience true adaptive learning with cognitive science-based AI that personalizes education to your unique learning profile."
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Real Learning Engine</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powered by cognitive science and real learning analytics. 
              Experience truly personalized education that adapts to your unique learning profile.
            </p>
          </div>
          
          <RealLearningInterface />
        </div>
      </div>
    </>
  );
};

export default RealLearningPage;