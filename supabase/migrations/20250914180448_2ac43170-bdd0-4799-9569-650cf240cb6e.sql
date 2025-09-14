-- Create user surveys management tables
CREATE TABLE public.user_surveys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  survey_type text NOT NULL,
  template_id uuid,
  status text NOT NULL DEFAULT 'pending',
  scheduled_for timestamp with time zone,
  displayed_at timestamp with time zone,
  completed_at timestamp with time zone,
  dismissed_at timestamp with time zone,
  context jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.survey_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  survey_type text NOT NULL,
  title text NOT NULL,
  description text,
  questions jsonb NOT NULL DEFAULT '[]',
  display_rules jsonb DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  priority integer DEFAULT 1,
  max_frequency_days integer DEFAULT 30,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.survey_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  survey_id uuid NOT NULL REFERENCES public.user_surveys(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.survey_templates(id),
  question_id text NOT NULL,
  question_text text,
  response_value jsonb,
  response_text text,
  sentiment_score numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_user_surveys_user_id_status ON public.user_surveys(user_id, status);
CREATE INDEX idx_user_surveys_scheduled_for ON public.user_surveys(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_survey_responses_user_id ON public.survey_responses(user_id);
CREATE INDEX idx_survey_responses_survey_id ON public.survey_responses(survey_id);
CREATE INDEX idx_survey_templates_type_active ON public.survey_templates(survey_type, is_active);

-- Enable RLS
ALTER TABLE public.user_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_surveys
CREATE POLICY "Users can manage their own surveys" ON public.user_surveys
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all surveys" ON public.user_surveys
  FOR SELECT USING (is_admin());

-- RLS Policies for survey_templates
CREATE POLICY "Anyone can view active survey templates" ON public.survey_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage survey templates" ON public.survey_templates
  FOR ALL USING (is_admin());

-- RLS Policies for survey_responses
CREATE POLICY "Users can manage their own survey responses" ON public.survey_responses
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all survey responses" ON public.survey_responses
  FOR SELECT USING (is_admin());

-- Update timestamps trigger
CREATE TRIGGER update_user_surveys_updated_at
  BEFORE UPDATE ON public.user_surveys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_survey_templates_updated_at
  BEFORE UPDATE ON public.survey_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default survey templates
INSERT INTO public.survey_templates (name, survey_type, title, description, questions, display_rules, priority, max_frequency_days) VALUES
('NPS Survey', 'nps', 'Pomóż nam się rozwijać', 'Na ile prawdopodobne jest, że polecisz Mentavo AI znajomemu?', 
 '[
   {
     "id": "nps_score",
     "type": "scale",
     "question": "Na ile prawdopodobne jest, że polecisz Mentavo AI znajomemu?",
     "scale": {"min": 0, "max": 10, "labels": {"0": "Wcale", "10": "Bardzo prawdopodobne"}},
     "required": true
   },
   {
     "id": "nps_reason",
     "type": "textarea",
     "question": "Co możemy poprawić?",
     "placeholder": "Opcjonalnie - podziel się swoimi uwagami...",
     "required": false
   }
 ]'::jsonb,
 '{"trigger": "usage_days_7", "conditions": {"min_lessons": 3}}'::jsonb,
 1, 90),

('Lesson Feedback', 'lesson_feedback', 'Jak oceniasz tę lekcję?', 'Pomóż nam dostosować treści do Twoich potrzeb', 
 '[
   {
     "id": "lesson_rating",
     "type": "emoji",
     "question": "Jak oceniasz tę lekcję?",
     "options": [
       {"value": 1, "emoji": "😫", "label": "Za trudna"},
       {"value": 2, "emoji": "😕", "label": "Trudna"},
       {"value": 3, "emoji": "😐", "label": "W sam raz"},
       {"value": 4, "emoji": "😊", "label": "Dobra"},
       {"value": 5, "emoji": "😍", "label": "Świetna"}
     ],
     "required": true
   },
   {
     "id": "lesson_comment",
     "type": "textarea",
     "question": "Co możemy poprawić w tej lekcji?",
     "placeholder": "Twoje uwagi (opcjonalnie)...",
     "required": false
   }
 ]'::jsonb,
 '{"trigger": "lesson_complete", "probability": 0.3}'::jsonb,
 2, 7),

('Exit Intent Survey', 'exit_intent', 'Zanim odejdziesz...', 'Co możemy zrobić lepiej?', 
 '[
   {
     "id": "leaving_reason",
     "type": "multiple_choice",
     "question": "Dlaczego opuszczasz aplikację?",
     "options": [
       {"value": "too_difficult", "label": "Za trudne zadania"},
       {"value": "too_easy", "label": "Za łatwe zadania"},
       {"value": "technical_issues", "label": "Problemy techniczne"},
       {"value": "lack_of_time", "label": "Brak czasu"},
       {"value": "not_engaging", "label": "Nie jest angażujące"},
       {"value": "other", "label": "Inne"}
     ],
     "required": true
   },
   {
     "id": "improvement_suggestion",
     "type": "textarea",
     "question": "Co moglibyśmy dodać lub zmienić?",
     "placeholder": "Twoje sugestie...",
     "required": false
   }
 ]'::jsonb,
 '{"trigger": "exit_intent", "conditions": {"min_session_time": 120}}'::jsonb,
 3, 30);

-- Function to check for due surveys
CREATE OR REPLACE FUNCTION public.get_due_surveys_for_user(target_user_id uuid)
RETURNS TABLE(
  survey_id uuid,
  survey_type text,
  title text,
  description text,
  questions jsonb,
  context jsonb
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    us.id,
    us.survey_type,
    st.title,
    st.description,
    st.questions,
    us.context
  FROM user_surveys us
  JOIN survey_templates st ON us.template_id = st.id
  WHERE us.user_id = target_user_id 
    AND us.status = 'pending'
    AND (us.scheduled_for IS NULL OR us.scheduled_for <= NOW())
    AND st.is_active = true
  ORDER BY st.priority DESC, us.created_at ASC
  LIMIT 1;
$$;