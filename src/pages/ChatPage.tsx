import { AIChat } from '@/components/AIChat';
import { Seo } from '@/components/Seo';
const ChatPage = () => {
  return <>
      <Seo title="mentavo.ai - Chat z AI" description="Rozmawiaj z mentavo.ai. Zadawaj pytania, uzyskuj wyjaśnienia i rozwiązuj zadania krok po kroku." />
      <div className="min-h-screen bg-background p-0 md:p-4">
        <div className="w-full md:container md:mx-auto py-2 md:py-8">
          <AIChat />
        </div>
      </div>
    </>;
};
export default ChatPage;