import { AIChat } from '@/components/AIChat';
import { Seo } from '@/components/Seo';

const ChatPage = () => {
  return (
    <>
      <Seo 
        title="mentavo.ai - Chat z AI"
        description="Rozmawiaj z mentavo.ai. Zadawaj pytania, uzyskuj wyjaśnienia i rozwiązuj zadania krok po kroku."
      />
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">mentavo.ai</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Zadawaj pytania, uzyskuj wyjaśnienia i rozwiązuj zadania krok po kroku 
              z pomocą sztucznej inteligencji.
            </p>
          </div>
          
          <AIChat />
        </div>
      </div>
    </>
  );
};

export default ChatPage;