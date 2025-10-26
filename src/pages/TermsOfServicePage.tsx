import { Seo } from '@/components/Seo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfServicePage = () => {
  return (
    <>
      <Seo 
        title="Regulamin Serwisu | Warunki Korzystania - Mentavo AI" 
        description="Przeczytaj regulamin Mentavo AI. Zasady korzystania z platformy, subskrypcje, płatności i prawa użytkowników. Aktualna wersja z września 2024." 
        canonical="https://mentavo.pl/terms-of-service"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Regulamin - Mentavo AI",
          "description": "Regulamin aplikacji edukacyjnej Mentavo AI",
          "url": "https://mentavo.pl/terms-of-service",
          "mainEntity": {
            "@type": "Article",
            "headline": "Regulamin Aplikacji Mentavo AI",
            "datePublished": "2024-09-01",
            "dateModified": "2024-09-01",
            "author": {
              "@type": "Organization",
              "name": "Mentavo AI"
            }
          }
        }}
      />
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center mb-4">
                Regulamin Aplikacji Mentavo AI
              </CardTitle>
              <p className="text-muted-foreground text-center">
                Ostatnia aktualizacja: Wrzesień 2024
              </p>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none dark:prose-invert">
              <p className="text-lg">
                Witamy w Mentavo AI! Zanim rozpoczniesz korzystanie z naszej edukacyjnej aplikacji AI Tutor ("Aplikacja"), prosimy o uważne zapoznanie się z poniższym Regulaminem. Korzystając z Aplikacji, potwierdzasz, że rozumiesz i akceptujesz warunki Regulaminu. Jeżeli nie zgadzasz się z którymkolwiek punktem, nie zakładaj konta ani nie korzystaj z Aplikacji.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Definicje</h2>

              <ul>
                <li><strong>Usługodawca / Administrator</strong> – Jakub Gierasimiuk prowadzący działalność gospodarczą pod własnym nazwiskiem, NIP: 5422866210 (adres: ul. Jana Nowaka-Jeziorańskiego 9/87, 03-984 Warszawa). Usługodawca jest właścicielem aplikacji Mentavo AI oraz administratorem danych osobowych użytkowników.</li>
                <li><strong>Aplikacja (Mentavo AI)</strong> – aplikacja edukacyjna typu AI Tutor dostępna online, oferująca inteligentne usługi edukacyjne (m.in. w zakresie matematyki) za pośrednictwem strony internetowej i/lub aplikacji mobilnej.</li>
                <li><strong>Użytkownik</strong> – osoba korzystająca z Aplikacji, która założyła konto lub korzysta z Aplikacji w wersji gościnnej. Użytkownikiem może być osoba fizyczna, która ukończyła 16 lat. Osoby niepełnoletnie poniżej 18 roku życia mogą korzystać z Aplikacji wyłącznie za zgodą swojego opiekuna prawnego.</li>
                <li><strong>Konto</strong> – indywidualny profil Użytkownika utworzony w Aplikacji za pomocą adresu e-mail (i/lub metod logowania zewnętrznego), zabezpieczony hasłem. Konto umożliwia korzystanie z usług Mentavo AI, wgląd w postępy nauki oraz zarządzanie ustawieniami, w tym planem subskrypcji.</li>
                <li><strong>Subskrypcja</strong> – płatny plan dostępu do rozszerzonych funkcji Aplikacji. Subskrypcja może mieć charakter odnawialnej opłaty (np. miesięcznej lub rocznej) zgodnie z cennikiem. W ramach subskrypcji Użytkownik uzyskuje dostęp do pełnych treści i funkcjonalności Mentavo AI ponad darmowy zakres.</li>
                <li><strong>Okres próbny</strong> – darmowy okres testowy (freemium) udostępniany nowym Użytkownikom przez ograniczony czas (np. 7 dni), pozwalający na wypróbowanie pełnych funkcji Aplikacji przed zakupem Subskrypcji.</li>
                <li><strong>Regulamin</strong> – niniejszy dokument określający zasady i warunki korzystania z Aplikacji Mentavo AI oraz świadczenia usług drogą elektroniczną przez Usługodawcę na rzecz Użytkowników.</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Zakres świadczonych usług edukacyjnych</h2>

              <p>
                Mentavo AI jest inteligentnym korepetytorem dostępnym 24/7, który zapewnia interaktywne wsparcie w nauce – głównie z matematyki dla uczniów szkół średnich (ok. 16–19 lat). Aplikacja wykorzystuje sztuczną inteligencję (model językowy AI) do udzielania odpowiedzi na pytania Użytkownika, tłumaczenia zagadnień oraz prowadzenia dialogu edukacyjnego.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Personalizowane lekcje</h3>

              <p>
                Aplikacja dostosowuje materiały i poziom trudności do umiejętności Użytkownika. Dzięki analizie postępów i błędów Użytkownika, Mentavo AI przygotowuje spersonalizowane ćwiczenia i wyjaśnienia, wspierając samodzielne myślenie (metoda sokratejska – AI zadaje pytania pomocnicze zamiast podawać gotowe rozwiązania).
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Zgodność z podstawą programową</h3>

              <p>
                Materiały i zadania proponowane przez Mentavo AI są oparte na aktualnej podstawie programowej z matematyki (rok 2023) i podzielone na setki mikro-umiejętności (np. algebra, geometria, statystyka). Dzięki temu Użytkownik może przerabiać materiał szkolny w uporządkowany sposób.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Śledzenie postępów</h3>

              <p>
                Aplikacja gromadzi statystyki nauki – m.in. czas spędzony nad zadaniami, procent opanowanych umiejętności, wyniki quizów. Użytkownik (oraz w przypadku osób niepełnoletnich – ich opiekun) może przeglądać raporty postępów, co tydzień i co miesiąc, aby monitorować efekty nauki.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Powtórki i przygotowanie do egzaminów</h3>

              <p>
                Wbudowany algorytm powtórkowy (technika spaced repetition) automatycznie proponuje Użytkownikowi zagadnienia do utrwalenia wiedzy. Mentavo AI pomaga również przygotować indywidualny plan nauki przed ważnymi testami, sprawdzianami czy egzaminem maturalnym.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Elementy grywalizacji</h3>

              <p>
                Dla zwiększenia motywacji Aplikacja może oferować punkty, odznaki, rankingi czy wyzwania edukacyjne. Te elementy mają zachęcać Użytkownika do regularnej nauki poprzez zabawę i zdrową rywalizację.
              </p>

              <p>
                <strong>Ważne:</strong> Usługi edukacyjne świadczone przez Mentavo AI mają charakter wspomagający naukę. Aplikacja nie zastępuje formalnej edukacji szkolnej ani nie gwarantuje zaliczenia egzaminów – jest to narzędzie dydaktyczne mające ułatwić zrozumienie materiału i ćwiczenie umiejętności.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Rejestracja i Konto Użytkownika</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Warunki rejestracji</h3>

              <p>
                Aby w pełni korzystać z Mentavo AI, musisz założyć Konto. Rejestracja jest darmowa i wymaga podania prawidłowego adresu e-mail oraz ustalenia hasła. Możliwe jest również logowanie za pomocą kont zewnętrznych (np. Google, Facebook), jeśli ta opcja jest dostępna.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Wiek Użytkowników</h3>

              <p>
                Z Aplikacji mogą korzystać osoby, które ukończyły 16 lat. Osoby niepełnoletnie (16–18 lat) mogą założyć Konto i korzystać z Aplikacji wyłącznie za zgodą swoich opiekunów prawnych. Opiekun prawny ponosi odpowiedzialność za korzystanie z Aplikacji przez osobę niepełnoletnią i może w każdej chwili zażądać usunięcia Konta.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Zasady korzystania</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Dozwolone działania</h3>

              <p>Korzystając z Mentavo AI, możesz:</p>
              <ul>
                <li>Zadawać pytania związane z matematyką i naukami ścisłymi</li>
                <li>Korzystać z materiałów edukacyjnych i ćwiczeń</li>
                <li>Śledzić swoje postępy w nauce</li>
                <li>Personalizować ustawienia swojego profilu</li>
                <li>Korzystać z funkcji społecznościowych (jeśli są dostępne)</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Niedozwolone działania</h3>

              <p>Zabrania się:</p>
              <ul>
                <li>Używania Aplikacji do celów niezwiązanych z edukacją</li>
                <li>Prób obejścia ograniczeń technicznych lub limitów</li>
                <li>Udostępniania nieprawdziwych informacji podczas rejestracji</li>
                <li>Naruszania praw autorskich lub innych praw własności intelektualnej</li>
                <li>Używania Aplikacji w sposób mogący naruszyć jej funkcjonowanie</li>
                <li>Próby nieuprawnionego dostępu do systemów lub danych innych Użytkowników</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Płatności i Subskrypcje</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Model freemium</h3>

              <p>
                Mentavo AI oferuje podstawowe funkcje bezpłatnie (wersja freemium). Zaawansowane funkcje są dostępne w ramach płatnej Subskrypcji. Szczegóły dotyczące zakresu darmowych i płatnych funkcji są dostępne w Aplikacji.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Okres próbny</h3>

              <p>
                Nowi Użytkownicy mogą otrzymać dostęp do pełnych funkcji Aplikacji w ramach bezpłatnego okresu próbnego (zazwyczaj 7 dni). Po zakończeniu okresu próbnego, aby kontynuować korzystanie z zaawansowanych funkcji, należy wykupić Subskrypcję.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Cennik i płatności</h3>

              <p>
                Aktualny cennik Subskrypcji jest dostępny w Aplikacji. Ceny podawane są w złotych polskich (PLN) i zawierają podatek VAT. Płatności obsługiwane są przez zewnętrznych dostawców usług płatniczych (np. Stripe).
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Odpowiedzialność</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Ograniczenie odpowiedzialności</h3>

              <p>
                Mentavo AI jest narzędziem edukacyjnym wspomagającym naukę, ale nie zastępuje formalnej edukacji. Usługodawca nie ponosi odpowiedzialności za:
              </p>

              <ul>
                <li>Wyniki nauki lub egzaminów Użytkownika</li>
                <li>Decyzje edukacyjne podjęte na podstawie korzystania z Aplikacji</li>
                <li>Ewentualne błędy w treściach edukacyjnych (choć dokładamy wszelkich starań, aby były one prawidłowe)</li>
                <li>Szkody wynikające z niewłaściwego korzystania z Aplikacji</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Ochrona danych osobowych</h2>

              <p>
                Zasady przetwarzania danych osobowych określa odrębna Polityka Prywatności, stanowiąca integralną część niniejszego Regulaminu. Korzystając z Aplikacji, wyrażasz zgodę na przetwarzanie swoich danych osobowych zgodnie z Polityką Prywatności.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Zmiany Regulaminu</h2>

              <p>
                Usługodawca zastrzega sobie prawo do wprowadzania zmian w niniejszym Regulaminie. O wszelkich zmianach Użytkownicy zostaną powiadomieni za pośrednictwem Aplikacji lub e-mailem z 7-dniowym wyprzedzeniem. Kontynuowanie korzystania z Aplikacji po wejściu w życie zmian oznacza akceptację nowego Regulaminu.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Prawo właściwe i rozstrzyganie sporów</h2>

              <p>
                Niniejszy Regulamin podlega prawu polskiemu. Wszelkie spory wynikające z korzystania z Aplikacji będą rozstrzygane przez sądy właściwe dla siedziby Usługodawcy, z zastrzeżeniem uprawnień konsumenckich wynikających z przepisów prawa.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Kontakt</h2>

              <p>
                W przypadku pytań dotyczących Regulaminu lub reklamacji, skontaktuj się z nami:
              </p>

              <ul>
                <li><strong>E-mail:</strong> kontakt@mentavo.ai</li>
                <li><strong>Adres pocztowy:</strong> ul. Jana Nowaka-Jeziorańskiego 9/87, 03-984 Warszawa, Polska</li>
              </ul>

              <p className="text-sm text-muted-foreground mt-8">
                Regulamin obowiązuje od września 2024 roku.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default TermsOfServicePage;