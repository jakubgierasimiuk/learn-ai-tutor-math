import { Seo } from '@/components/Seo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicyPage = () => {
  return (
    <>
      <Seo 
        title="Polityka Prywatności – mentavo.ai" 
        description="Polityka prywatności i plików cookies Mentavo AI. Dowiedz się, jak chronimy Twoje dane osobowe." 
      />
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center mb-4">
                Polityka Prywatności i Plików Cookies Mentavo AI
              </CardTitle>
              <p className="text-muted-foreground text-center">
                Ostatnia aktualizacja: Wrzesień 2024
              </p>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none dark:prose-invert">
              <p className="text-lg">
                Niniejsza Polityka Prywatności wyjaśnia, w jaki sposób Mentavo AI (dalej także: "Aplikacja") przetwarza dane osobowe Użytkowników oraz chroni ich prywatność. Znajdziesz tu informacje o tym, jakie dane zbieramy, w jakim celu to robimy, jak je wykorzystujemy, a także jakie przysługują Ci prawa. Częścią niniejszego dokumentu jest również informacja o wykorzystywaniu przez nas plików cookies i podobnych technologii.
              </p>

              <p>
                Polityka Prywatności została przygotowana w zgodzie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO) oraz z uwzględnieniem zasad privacy by design i privacy by default (prywatność w fazie projektowania i domyślna ochrona danych). Oznacza to, że od początku projektowania naszych usług priorytetem jest bezpieczeństwo i minimalizacja przetwarzanych danych.
              </p>

              <p>
                Korzystając z Mentavo AI, powierzasz nam niektóre swoje dane osobowe – szanujemy to zaufanie i dokładamy wszelkich starań, aby Twoje dane były bezpieczne. Poniżej przedstawiamy szczegóły.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Administrator Danych</h2>
              
              <p>
                Administratorem Twoich danych osobowych jest Jakub Gierasimiuk, prowadzący działalność gospodarczą pod własnym nazwiskiem (adres siedziby: ul. Jana Nowaka-Jeziorańskiego 9/87, 03-984 Warszawa, Polska; NIP: 5422866210; REGON: 200113212). Możesz skontaktować się z Administratorem w sprawach ochrony danych osobowych:
              </p>

              <ul>
                <li>pod adresem e-mail: kontakt@mentavo.ai,</li>
                <li>pisemnie na wyżej wskazany adres siedziby.</li>
              </ul>

              <p>
                Obecnie Administrator nie powołał odrębnego Inspektora Ochrony Danych (IOD). Wszelkie obowiązki związane z ochroną danych realizowane są bezpośrednio przez Administratora.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Zakres gromadzonych danych osobowych</h2>

              <p>
                W zależności od tego, w jaki sposób korzystasz z Aplikacji, możemy przetwarzać następujące kategorie Twoich danych osobowych:
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Dane podawane przy rejestracji</h3>
              <p>
                Adres e-mail oraz (opcjonalnie) imię. Są one niezbędne do założenia konta Użytkownika i umożliwienia Ci logowania się do Mentavo AI. Adres e-mail służy także do komunikacji z Tobą (np. reset hasła, powiadomienia o subskrypcji, odpowiedzi na zgłoszenia).
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Dane uwierzytelniające</h3>
              <p>
                Hasło (przechowywane w naszej bazie w postaci zaszyfrowanej – tzw. hasz, co oznacza, że nie znamy Twojego hasła w postaci jawnej) lub identyfikatory zewnętrznych dostawców logowania (jeśli logujesz się np. przez Google/Facebook, otrzymujemy od tych dostawców podstawowe dane potrzebne do weryfikacji Twojej tożsamości, takie jak adres e-mail powiązany z tamtym kontem).
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Dane związane z profilem i korzystaniem z Aplikacji</h3>
              
              <h4 className="text-lg font-medium mt-4 mb-2">Materiały edukacyjne i aktywność:</h4>
              <p>
                Pytania, które zadajesz AI, treść rozmów z wirtualnym tutorem, rozwiązania zadań, wyniki quizów, postępy w nauce (np. które tematy zostały opanowane, ile czasu spędziłeś/aś na nauce w danym tygodniu, itp.). Te dane powstają podczas korzystania z Mentavo AI i pozwalają nam świadczyć Ci usługę (np. kontynuować rozmowę od poprzedniego miejsca, wygenerować raport postępów, personalizować kolejne zadania).
              </p>

              <h4 className="text-lg font-medium mt-4 mb-2">Logi techniczne:</h4>
              <p>
                Dane systemowe automatycznie zbierane przez Aplikację, gdy z niej korzystasz – m.in. informacje o urządzeniu i przeglądarce (typ urządzenia, wersja systemu operacyjnego, rozdzielczość ekranu, wersja przeglądarki lub aplikacji mobilnej), adres IP, identyfikatory plików cookie, daty i godziny korzystania z poszczególnych funkcji, komunikaty o błędach. Logi te są wykorzystywane do celów technicznych, diagnostycznych oraz analitycznych (np. do badania wydajności i bezpieczeństwa, wykrywania ewentualnych problemów).
              </p>

              <h4 className="text-lg font-medium mt-4 mb-2">Statystyki korzystania z AI:</h4>
              <p>
                Np. liczba zapytań do AI, liczba wykorzystanych „tokenów" (jednostek rozliczeniowych użycia modelu AI) w danym okresie. Te informacje mogą być przetwarzane w celu monitorowania wykorzystania usługi (np. egzekwowania ewentualnych limitów w planie darmowym) oraz optymalizacji kosztów i wydajności po stronie Usługodawcy.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Cele i podstawy prawne przetwarzania</h2>

              <p>
                Twoje dane osobowe przetwarzamy wyłącznie w zgodzie z obowiązującymi przepisami prawa, w szczególności RODO. Poniżej przedstawiamy cele przetwarzania wraz z podstawami prawnymi:
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Świadczenie usług edukacyjnych</h3>
              <p>
                <strong>Podstawa prawna:</strong> Art. 6 ust. 1 lit. b) RODO (wykonanie umowy) – przetwarzanie jest niezbędne do wykonania umowy o świadczenie usług edukacyjnych, której stroną jesteś, lub do podjęcia działań na Twoje żądanie przed zawarciem umowy.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Twoje prawa</h2>

              <p>
                Zgodnie z RODO, jako osoba, której dane dotyczą, przysługują Ci następujące prawa:
              </p>

              <ul>
                <li><strong>Prawo dostępu</strong> do swoich danych osobowych (art. 15 RODO)</li>
                <li><strong>Prawo sprostowania</strong> nieprawidłowych danych (art. 16 RODO)</li>
                <li><strong>Prawo do usunięcia</strong> danych („prawo do bycia zapomnianym") (art. 17 RODO)</li>
                <li><strong>Prawo do ograniczenia przetwarzania</strong> (art. 18 RODO)</li>
                <li><strong>Prawo do przenoszenia danych</strong> (art. 20 RODO)</li>
                <li><strong>Prawo sprzeciwu</strong> wobec przetwarzania (art. 21 RODO)</li>
                <li><strong>Prawo do cofnięcia zgody</strong> w dowolnym momencie (jeśli przetwarzanie opiera się na zgodzie)</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Pliki Cookies</h2>

              <p>
                Mentavo AI wykorzystuje pliki cookies i podobne technologie w celu zapewnienia prawidłowego funkcjonowania Aplikacji oraz poprawy komfortu korzystania z naszych usług.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Czym są pliki cookies?</h3>
              <p>
                Pliki cookies to małe pliki tekstowe zapisywane na Twoim urządzeniu (komputerze, tablecie, smartfonie) przez przeglądarkę internetową podczas odwiedzania stron internetowych.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Bezpieczeństwo danych</h2>

              <p>
                Bezpieczeństwo Twoich danych osobowych jest dla nas priorytetem. Wdrożyliśmy odpowiednie środki techniczne i organizacyjne mające na celu ochronę Twoich danych przed nieuprawnionym dostępem, utratą, zniszczeniem, modyfikacją lub ujawnieniem.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Kontakt</h2>

              <p>
                Jeśli masz pytania dotyczące niniejszej Polityki Prywatności lub chcesz skorzystać ze swoich praw, skontaktuj się z nami:
              </p>

              <ul>
                <li><strong>E-mail:</strong> kontakt@mentavo.ai</li>
                <li><strong>Adres pocztowy:</strong> ul. Jana Nowaka-Jeziorańskiego 9/87, 03-984 Warszawa, Polska</li>
              </ul>

              <p className="text-sm text-muted-foreground mt-8">
                Dokument został ostatnio zaktualizowany we wrześniu 2024 roku.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;