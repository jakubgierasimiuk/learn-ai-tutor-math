-- Create trigger to automatically create learner intelligence profile for new users
CREATE OR REPLACE FUNCTION create_learner_intelligence_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default learner intelligence profile
  INSERT INTO learner_intelligence (
    user_id,
    cognitive_load_capacity,
    processing_speed_percentile,
    working_memory_span,
    attention_span_minutes,
    learning_velocity,
    mastery_acquisition_rate,
    retention_half_life,
    emotional_state,
    motivation_drivers,
    frustration_patterns,
    metacognitive_skills,
    learning_strategies,
    self_regulation_score,
    plateau_risk_score,
    dropout_risk_score,
    breakthrough_probability
  ) VALUES (
    NEW.user_id,
    7.0,
    50,
    4,
    25.0,
    '{"math": 1.0, "reading": 1.0, "reasoning": 1.0}',
    0.8,
    '{"long_term": 168, "short_term": 24}',
    '{"flow_triggers": [], "baseline_arousal": 0.5, "stress_threshold": 0.7}',
    '{"mastery": 0.5, "purpose": 0.5, "autonomy": 0.5}',
    '{"triggers": [], "threshold": 3, "recovery_time": 5}',
    '{"planning": 3, "evaluating": 3, "monitoring": 3}',
    '{"avoided": [], "effective": [], "preferred": []}',
    0.5,
    0.0,
    0.0,
    0.3
  ) ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires when a profile is created
CREATE OR REPLACE TRIGGER create_learner_intelligence_on_profile_insert
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_learner_intelligence_profile();

-- Also create profile for existing users without learner intelligence
INSERT INTO learner_intelligence (
  user_id,
  cognitive_load_capacity,
  processing_speed_percentile,
  working_memory_span,
  attention_span_minutes,
  learning_velocity,
  mastery_acquisition_rate,
  retention_half_life,
  emotional_state,
  motivation_drivers,
  frustration_patterns,
  metacognitive_skills,
  learning_strategies,
  self_regulation_score,
  plateau_risk_score,
  dropout_risk_score,
  breakthrough_probability
)
SELECT 
  p.user_id,
  7.0,
  50,
  4,
  25.0,
  '{"math": 1.0, "reading": 1.0, "reasoning": 1.0}',
  0.8,
  '{"long_term": 168, "short_term": 24}',
  '{"flow_triggers": [], "baseline_arousal": 0.5, "stress_threshold": 0.7}',
  '{"mastery": 0.5, "purpose": 0.5, "autonomy": 0.5}',
  '{"triggers": [], "threshold": 3, "recovery_time": 5}',
  '{"planning": 3, "evaluating": 3, "monitoring": 3}',
  '{"avoided": [], "effective": [], "preferred": []}',
  0.5,
  0.0,
  0.0,
  0.3
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM learner_intelligence li WHERE li.user_id = p.user_id
);