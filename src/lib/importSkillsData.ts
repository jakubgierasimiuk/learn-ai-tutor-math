import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export async function importSkillsData() {
  try {
    console.log('🚀 Starting skills import...');
    
    // Clean up incomplete records first
    await supabase
      .from('unified_skill_content')
      .delete()
      .eq('is_complete', false);
    
    const skillsToImport = [
      {
        skillId: uuidv4(),
        skillName: "Nierówności kwadratowe",
        class_level: 1,
        department: "algebra",
        content: {
          theory: {
            introduction: "Nierówność kwadratowa dotyczy wyrażenia ax²+bx+c i polega na wyznaczeniu zbioru x, dla których wartości wielomianu są <,≤,>,≥ od zera.",
            keyConceptsLaTex: ["Δ=b²-4ac", "x=(-b±√Δ)/(2a)", "a>0", "a<0", "(x-x₁)(x-x₂)"],
            timeEstimate: 180
          },
          examples: [
            {
              title: "Klasyczna nierówność bez równości",
              problem: "Rozwiąż x²-9<0.",
              solution: "Miejsca zerowe x=±3. Dla a>0 wartości ujemne między zerami: (-3,3).",
              explanation: "Parabola w górę: ujemna w dołku między pierwiastkami.",
              timeEstimate: 300
            }
          ],
          practiceExercises: [
            {
              type: "basic",
              problem: "Rozwiąż x²-1≤0.",
              expectedAnswer: "[-1,1]",
              hints: ["Różnica kwadratów", "Parabola a>0 – wartości ≤0 między zerami"],
              timeEstimate: 240
            }
          ]
        }
      },
      {
        skillId: uuidv4(),
        skillName: "Planimetria – wielokąty i okręgi",
        class_level: 2,
        department: "geometria",
        content: {
          theory: {
            introduction: "Planimetria bada własności figur płaskich: wielokątów i okręgów. Suma kątów wewnętrznych n-kąta wynosi (n-2)·180°.",
            keyConceptsLaTex: ["∑∠=(n-2)·180°", "S=½ab sin γ", "S=π r²", "l=2π r", "PT²=PA·PB"],
            timeEstimate: 180
          },
          examples: [
            {
              title: "Suma kątów i kąt w foremnym",
              problem: "Oblicz miarę kąta wewnętrznego w siedmiokącie foremnym.",
              solution: "Suma kątów (7-2)·180°=900°. Jeden kąt: 900°/7≈128.57°.",
              explanation: "Dzielimy sumę kątów przez liczbę kątów w wielokącie foremnym.",
              timeEstimate: 300
            }
          ],
          practiceExercises: [
            {
              type: "basic",
              problem: "Podaj sumę kątów wewnętrznych pięciokąta.",
              expectedAnswer: "540°",
              hints: ["Użyj (n-2)·180°", "Dla n=5"],
              timeEstimate: 240
            }
          ]
        }
      },
      {
        skillId: uuidv4(),
        skillName: "Pochodna funkcji",
        class_level: 3,
        department: "analiza_matematyczna",
        content: {
          theory: {
            introduction: "Pochodna f'(x) mierzy chwilową szybkość zmian funkcji i geometrycznie jest nachyleniem stycznej do wykresu.",
            keyConceptsLaTex: ["f'(x)=lim[h→0](f(x+h)-f(x))/h", "(fg)'=f'g+fg'", "(f/g)'=(f'g-fg')/g²", "(f∘g)'=f'(g)·g'", "d/dx(xⁿ)=nxⁿ⁻¹"],
            timeEstimate: 180
          },
          examples: [
            {
              title: "Pochodna wielomianu",
              problem: "Oblicz f'(x) dla f(x)=3x²-2x+1.",
              solution: "Z reguły potęgowej: f'(x)=6x-2.",
              explanation: "Różniczkujemy składnikowo, stała znika.",
              timeEstimate: 300
            }
          ],
          practiceExercises: [
            {
              type: "basic",
              problem: "Policz d/dx(x³).",
              expectedAnswer: "3x²",
              hints: ["Reguła potęgowa", "Mnożnik równy wykładnikowi"],
              timeEstimate: 240
            }
          ]
        }
      },
      {
        skillId: uuidv4(),
        skillName: "Prawdopodobieństwo warunkowe",
        class_level: 1,
        department: "mathematics",
        content: {
          theory: {
            introduction: "Prawdopodobieństwo warunkowe P(A|B) opisuje szansę zdarzenia A przy założeniu, że zaszło B.",
            keyConceptsLaTex: ["P(A|B)=P(A∩B)/P(B)", "P(A∩B)=P(A|B)P(B)", "∑P=1", "P(Bⱼ|A)", "A⊥B"],
            timeEstimate: 180
          },
          examples: [
            {
              title: "Urna z kulami",
              problem: "W urnie są 3 białe i 2 czarne kule. Losujemy bez zwrotu dwie. Oblicz P(druga biała|pierwsza biała).",
              solution: "Po białej zostaje 2/4 białych: P=2/4=1/2.",
              explanation: "Warunek redukuje przestrzeń po pierwszym losowaniu.",
              timeEstimate: 300
            }
          ],
          practiceExercises: [
            {
              type: "basic",
              problem: "Rzut monetą, potem kostką. Oblicz P(parzysta|orzeł).",
              expectedAnswer: "1/2",
              hints: ["Niezależność", "Warunek nie zmienia szans parzystej"],
              timeEstimate: 240
            }
          ]
        }
      },
      {
        skillId: uuidv4(),
        skillName: "Równania i nierówności wielomianowe",
        class_level: 2,
        department: "algebra",
        content: {
          theory: {
            introduction: "Wielomiany rozwiązujemy przez rozkład na czynniki (wyłączanie, wzory skróconego mnożenia, schemat Hornera, pierwiastki wymierne).",
            keyConceptsLaTex: ["P(x)=(x-a)ᵏQ(x)", "Horner", "x⁴→t=x²", "sgn P", "k parz./nieparz."],
            timeEstimate: 180
          },
          examples: [
            {
              title: "Krotności i tabela znaków",
              problem: "Rozwiąż (x-2)(x+1)²≥0.",
              solution: "Zera: x=-1 (krotność 2), x=2. Znak dodatni na (-∞,-1]∪[2,∞).",
              explanation: "Na zerze podwójnym znak się nie zmienia, na prostym zmienia.",
              timeEstimate: 300
            }
          ],
          practiceExercises: [
            {
              type: "basic",
              problem: "Rozwiąż (x-3)(x+3)≤0.",
              expectedAnswer: "[-3,3]",
              hints: ["Zera ±3", "Dla iloczynu ≤0 wybierz wnętrze"],
              timeEstimate: 240
            }
          ]
        }
      },
      {
        skillId: uuidv4(),
        skillName: "Równania i nierówności z wartością bezwzględną",
        class_level: 2,
        department: "algebra",
        content: {
          theory: {
            introduction: "Wartość bezwzględna |u| to odległość od zera, z definicją przypadkową: |u|=u dla u≥0 oraz |u|=-u dla u<0.",
            keyConceptsLaTex: ["|u|=u (u≥0)", "|u|=-u (u<0)", "|x-a|<r", "|x-a|≥r", "|u|=k⇒u=±k"],
            timeEstimate: 180
          },
          examples: [
            {
              title: "Klasyczne równanie z modułem",
              problem: "Rozwiąż |x-3|=5.",
              solution: "Przypadki: x-3=5⇒x=8 lub x-3=-5⇒x=-2.",
              explanation: "Dwa punkty w odległości 5 od 3 na osi liczbowej.",
              timeEstimate: 300
            }
          ],
          practiceExercises: [
            {
              type: "basic",
              problem: "Rozwiąż |x|=7.",
              expectedAnswer: "x=±7",
              hints: ["Dwa przypadki", "Symetria względem zera"],
              timeEstimate: 240
            }
          ]
        }
      },
      {
        skillId: uuidv4(),
        skillName: "Równania kwadratowe",
        class_level: 2,
        department: "algebra",
        content: {
          theory: {
            introduction: "Równanie kwadratowe ax²+bx+c=0 (a≠0) rozwiążesz metodą delty, faktoryzacji lub poprzez rozpoznanie pełnego kwadratu.",
            keyConceptsLaTex: ["Δ=b²-4ac", "x=(-b±√Δ)/(2a)", "a(x-x₁)(x-x₂)", "y=a(x-p)²+q", "x₀=-b/(2a)"],
            timeEstimate: 180
          },
          examples: [
            {
              title: "Delta – dwa pierwiastki",
              problem: "Rozwiąż x²-5x+6=0.",
              solution: "Δ=25-24=1. x=(5±1)/2⇒x=2,3.",
              explanation: "Stosujemy wzór kwadratowy po obliczeniu delty.",
              timeEstimate: 300
            }
          ],
          practiceExercises: [
            {
              type: "basic",
              problem: "Rozwiąż x²-1=0.",
              expectedAnswer: "x=±1",
              hints: ["Różnica kwadratów", "(x-1)(x+1)=0"],
              timeEstimate: 240
            }
          ]
        }
      }
    ];

    const results = [];
    
    for (const skill of skillsToImport) {
      try {
        // Generate new UUID
        const newSkillId = uuidv4();
        
        // Prepare content_data
        const content_data = {
          skillName: skill.skillName,
          theory: skill.content.theory,
          examples: skill.content.examples,
          practiceExercises: skill.content.practiceExercises
        };

        // Insert skill content
        const { data, error } = await supabase
          .from('unified_skill_content')
          .insert({
            skill_id: newSkillId,
            content_data,
            metadata: {
              skill_name: skill.skillName,
              class_level: skill.class_level,
              department: skill.department,
              source: 'json_import',
              import_timestamp: new Date().toISOString()
            },
            is_complete: true,
            version: 1
          })
          .select()
          .single();

        if (error) {
          console.error(`❌ Error importing ${skill.skillName}:`, error);
          results.push({
            skill: skill.skillName,
            status: 'failed',
            error: error.message
          });
        } else {
          console.log(`✅ Successfully imported: ${skill.skillName}`);
          results.push({
            skill: skill.skillName,
            status: 'success',
            id: data.id
          });
        }
      } catch (err) {
        console.error(`❌ Exception importing ${skill.skillName}:`, err);
        results.push({
          skill: skill.skillName,
          status: 'failed',
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    console.log('📊 Import Summary:', results);
    return {
      success: true,
      imported: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      details: results
    };

  } catch (error) {
    console.error('❌ Import failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}