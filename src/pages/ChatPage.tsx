import { AIChat } from '@/components/AIChat';
import { Seo } from '@/components/Seo';
const ChatPage = () => {
  return <>
      <Seo title="mentavo.ai - Chat z AI" description="Rozmawiaj z mentavo.ai. Zadawaj pytania, uzyskuj wyjaśnienia i rozwiązuj zadania krok po kroku." />
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto py-8">
          
          
          <AIChat />
        </div>
      </div>
    </>;
};
export default ChatPage;