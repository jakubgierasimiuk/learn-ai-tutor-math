-- Create table for skill-specific math symbols mapping
CREATE TABLE public.skill_math_symbols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id UUID NOT NULL,
  quick_symbols JSONB NOT NULL DEFAULT '[]'::jsonb,
  panel_symbols JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for pattern matching in AI chat
CREATE TABLE public.math_symbol_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keywords TEXT[] NOT NULL,
  confidence INTEGER NOT NULL DEFAULT 5,
  symbols JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.skill_math_symbols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_symbol_patterns ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view skill math symbols" 
ON public.skill_math_symbols 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view math symbol patterns" 
ON public.math_symbol_patterns 
FOR SELECT 
USING (true);

-- Insert some initial data for common math symbol patterns
INSERT INTO public.math_symbol_patterns (keywords, confidence, symbols) VALUES
  ('{"równanie", "kwadratowe", "parabola", "x²", "delta"}', 9, '["x²", "√", "±", "Δ"]'),
  ('{"pierwiastek", "√", "radical"}', 8, '["√", "∛", "ⁿ√"]'),
  ('{"trygonometria", "sin", "cos", "tan", "kąt"}', 9, '["sin", "cos", "tan", "π", "α", "β", "°"]'),
  ('{"pochodna", "całka", "granica", "analiza"}', 8, '["∫", "d/dx", "lim", "∞", "→"]'),
  ('{"potęga", "wykładnik", "^"}', 7, '["x²", "x³", "xⁿ", "^"]'),
  ('{"geometria", "pole", "obwód", "π"}', 7, '["π", "°", "∠", "⊥", "∥"]'),
  ('{"logarytm", "ln", "log"}', 8, '["log", "ln", "e", "^"]'),
  ('{"funkcja", "wartość", "bezwzględna"}', 6, '["|x|", "f(x)", "→"]'),
  ('{"nierówność", "większe", "mniejsze"}', 7, '["≤", "≥", "≠", "≈"]'),
  ('{"zbiory", "należy", "podzbiór"}', 6, '["∈", "∉", "⊂", "⊃", "∪", "∩", "∅"]');

-- Add trigger for updated_at
CREATE TRIGGER update_skill_math_symbols_updated_at
BEFORE UPDATE ON public.skill_math_symbols
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();