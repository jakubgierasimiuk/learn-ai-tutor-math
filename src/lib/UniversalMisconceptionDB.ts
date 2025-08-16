// Universal misconceptions applicable across many areas
export const UniversalMisconceptions = {
  sign_error: 'Błędy w znakach podczas obliczeń',
  order_of_operations: 'Nieprawidłowa kolejność wykonywania działań',
  formula_confusion: 'Mylenie podobnych wzorów lub formuł',
  unit_confusion: 'Błędy w jednostkach miary (np. pominięcie jednostki lub złe przeliczenie)'
};

// Algebra-specific misconceptions
export const AlgebraMisconceptions = {
  isolating_variable: 'Błędne izolowanie zmiennej w równaniu',
  distributing_multiplication: 'Nieprawidłowe rozdzielenie mnożenia na nawias',
  forgot_to_divide: 'Brak podzielenia przez współczynnik (ostatni krok równania)'
};

// Functions-specific misconceptions
export const FunctionsMisconceptions = {
  slope_intercept_confusion: 'Pomylenie współczynnika kierunkowego z wyrazem wolnym',
  domain_range_confusion: 'Mylenie dziedziny ze zbiorem wartości funkcji',
  function_notation_misuse: 'Niepoprawne użycie notacji funkcyjnej (np. mylenie f(x) z y)',
  vertex_sign_error: 'Błąd znaku przy współrzędnej wierzchołka',
  composition_confusion: 'Błędne rozumienie kompozycji funkcji'
};

// Geometry-specific misconceptions
export const GeometryMisconceptions = {
  addition_instead_pythagorean: 'Zastosowanie dodawania zamiast twierdzenia Pitagorasa',
  perimeter_instead_area: 'Obliczenie obwodu zamiast pola figury',
  no_half_factor: 'Pominięcie współczynnika 1/2 w odpowiednim wzorze',
  radius_not_squared: 'Nie podniesienie promienia do kwadratu w formule (np. dla pola koła)',
  circumference_instead_area: 'Pomylenie wzoru na pole koła ze wzorem na obwód',
  addition_instead_multiplication: 'Dodanie wymiarów zamiast ich pomnożenia'
};

// Trigonometry-specific misconceptions
export const TrigonometryMisconceptions = {
  sine_cosine_confusion: 'Pomylenie sinusa z cosinusem dla danego kąta',
  trig_ratio_confusion: 'Błędny wybór funkcji trygonometrycznej (np. sin vs cos)',
  sign_quadrant_error: 'Błąd znaku wyniku z powodu nieprawidłowego uwzględnienia ćwiartki',
  angle_unit_error: 'Błąd jednostek kąta (stopnie vs radiany)'
};

// Sequences-specific misconceptions
export const SequencesMisconceptions = {
  off_by_one: 'Błąd o jeden indeks (n zamiast n-1 lub odwrotnie) w formule ciągu',
  arithmetic_instead_geometric: 'Zastosowanie wzoru ciągu arytmetycznego zamiast geometrycznego',
  missed_interval_division: 'Niepodzielenie różnicy wyrazów przez różnicę indeksów'
};

// Statistics-specific misconceptions
export const StatisticsMisconceptions = {
  outcome_count_error: 'Niepoprawne określenie liczby sprzyjających zdarzeń',
  missing_division: 'Brak podzielenia sumy przez liczbę elementów (np. przy średniej)',
  perm_instead_comb: 'Zastosowanie permutacji zamiast kombinacji',
  comb_instead_perm: 'Zastosowanie kombinacji zamiast permutacji'
};

// Calculus-specific misconceptions
export const CalculusMisconceptions = {
  incorrect_power_rule: 'Niepoprawne użycie reguły potęgowej przy różniczkowaniu',
  constant_term_included: 'Błędne uwzględnienie stałej (niezerowa pochodna stałej)',
  no_constant: 'Pominięcie stałej C przy całkowaniu',
  integral_no_division: 'Brak podzielenia przez nowy wykładnik przy całkowaniu',
  value_vs_arg_confusion: 'Pomylenie wartości funkcji z argumentem (np. przy ekstremach)'
};

// Consolidated misconceptions database
export const MisconceptionDatabase = {
  universal: UniversalMisconceptions,
  algebra: AlgebraMisconceptions,
  functions: FunctionsMisconceptions,
  geometry: GeometryMisconceptions,
  trigonometry: TrigonometryMisconceptions,
  sequences: SequencesMisconceptions,
  statistics: StatisticsMisconceptions,
  calculus: CalculusMisconceptions
};

export function getMisconceptionsByDepartment(department: string) {
  const departmentMisconceptions = MisconceptionDatabase[department as keyof typeof MisconceptionDatabase];
  return departmentMisconceptions ? { ...UniversalMisconceptions, ...departmentMisconceptions } : UniversalMisconceptions;
}