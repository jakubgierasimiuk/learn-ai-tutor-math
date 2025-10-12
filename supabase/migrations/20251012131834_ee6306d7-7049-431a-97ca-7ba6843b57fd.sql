-- Aktualizacja limitów tokenów dla planu płatnego (paid)
-- Paid ma mieć 10M tokenów miesięcznie
-- Super (dla wybranych użytkowników przez admina) zostaje z bardzo wysokim limitem
UPDATE subscription_plans 
SET 
  token_limit_soft = 10000000,
  token_limit_hard = 10000000,
  features = '["10M tokenów miesięcznie", "Priorytetowe wsparcie", "Zaawansowane funkcje AI", "Dostęp do beta funkcji"]'::jsonb,
  updated_at = now()
WHERE plan_type = 'paid';

-- Aktualizacja opisów dla lepszej przejrzystości
UPDATE subscription_plans 
SET 
  features = '["Nieograniczone tokeny (dla wybranych użytkowników)", "VIP wsparcie", "Wszystkie funkcje premium", "Dostęp API", "Dedykowane sesje"]'::jsonb,
  updated_at = now()
WHERE plan_type = 'super';

-- Dodanie nowego planu "test" dla użytkowników testowych (jeśli jeszcze nie istnieje)
INSERT INTO subscription_plans (plan_type, token_limit_soft, token_limit_hard, monthly_price_cents, features, is_active)
VALUES (
  'test',
  999999999,
  999999999,
  0,
  '["Nieograniczone tokeny (testowy)", "Wszystkie funkcje", "Dostęp dla developerów"]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

-- Dodanie komentarzy dla przejrzystości
COMMENT ON COLUMN subscription_plans.token_limit_soft IS 'Soft limit tokenów - dla paid: 10M/miesiąc, dla super/test: bardzo wysoki';
COMMENT ON COLUMN subscription_plans.token_limit_hard IS 'Hard limit tokenów - dla paid: 10M/miesiąc, dla super/test: bardzo wysoki';