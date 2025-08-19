import { LearningVelocityEngine } from './LearningVelocityEngine';
import { NeuroplasticityEngine } from './NeuroplasticityEngine';
import { PredictiveLearningAssistant } from './PredictiveLearningAssistant';
import { TaskDefinition } from './UniversalInterfaces';

interface LearningContext {
  userId: string;
  currentSkill?: string;
  department?: string;
  sessionType: 'ai_chat' | 'study_learn' | 'diagnostic';
  userResponse?: string;
  isCorrect?: boolean;
  responseTime?: number;
  hintsUsed?: number;
  confidence?: number;
}

interface AdaptationDecision {
  newDifficulty: number;
  recommendedAction: string;
  nextTask: TaskDefinition | null;
  feedbackMessage: string;
  explanationStyle: string;
  adaptationReason: string;
}

export class AdaptiveIntelligentTutor {
  private velocityEngine: LearningVelocityEngine;
  private neuroplasticityEngine: NeuroplasticityEngine;
  private predictiveLearning: PredictiveLearningAssistant;

  constructor() {
    this.velocityEngine = LearningVelocityEngine.getInstance();
    this.neuroplasticityEngine = NeuroplasticityEngine.getInstance();
    this.predictiveLearning = PredictiveLearningAssistant.getInstance();
  }

  async orchestrateLearning(context: LearningContext): Promise<AdaptationDecision> {
    try {
      // Get comprehensive learning state
      const cognitiveState = await this.velocityEngine.optimizeCognitiveLoad(context.userId, context);
      const neuroplasticityState = await this.neuroplasticityEngine.optimizeNeuroplasticity(context.userId, context);
      const predictions = await this.predictiveLearning.predictNextStruggle(context.userId);

      // Generate adaptive response
      const adaptation = await this.generateAdaptation(context, cognitiveState, neuroplasticityState, predictions);

      return adaptation;
    } catch (error) {
      console.error('Error orchestrating learning:', error);
      return this.getFallbackAdaptation();
    }
  }

  async generateAdaptiveTask(context: LearningContext): Promise<TaskDefinition> {
    const predictions = await this.predictiveLearning.predictNextStruggle(context.userId);
    const cognitiveState = await this.velocityEngine.optimizeCognitiveLoad(context.userId, context);
    
    // Generate task based on predictions and cognitive state
    const taskParams = {
      department: context.department || 'mathematics',
      difficulty: cognitiveState.optimalDifficulty,
      microSkill: predictions.strugglingSkills[0],
      targetMisconception: predictions.likelyMisconceptions[0]
    };

    return this.generateTaskWithAI(taskParams);
  }

  private async generateAdaptation(
    context: LearningContext,
    cognitiveState: any,
    neuroplasticityState: any,
    predictions: any
  ): Promise<AdaptationDecision> {
    const newDifficulty = cognitiveState.optimalDifficulty;
    const recommendedAction = this.determineAction(cognitiveState, neuroplasticityState, predictions);
    const explanationStyle = this.selectExplanationStyle(cognitiveState, context);
    const feedbackMessage = await this.generateFeedback(context, cognitiveState, recommendedAction);
    const adaptationReason = this.getAdaptationReason(cognitiveState, neuroplasticityState);

    // Generate next task if needed
    let nextTask = null;
    if (recommendedAction === 'present_new_task' || recommendedAction === 'adjust_difficulty') {
      nextTask = await this.generateAdaptiveTask(context);
    }

    return {
      newDifficulty,
      recommendedAction,
      nextTask,
      feedbackMessage,
      explanationStyle,
      adaptationReason
    };
  }

  private determineAction(cognitiveState: any, neuroplasticityState: any, predictions: any): string {
    // Priority 1: Flow state optimization
    if (cognitiveState.flowStateProbability > 0.8) {
      return 'maintain_flow';
    }

    // Priority 2: Cognitive overload prevention
    if (cognitiveState.currentLoad > 0.9) {
      return 'reduce_cognitive_load';
    }

    // Priority 3: Neuroplasticity optimization
    if (neuroplasticityState.synapticStrength < 0.3) {
      return 'strengthen_connections';
    }

    // Priority 4: Predictive intervention
    if (predictions.strugglingSkills && predictions.strugglingSkills.length > 0) {
      return 'address_predicted_struggles';
    }

    // Default: Continue with adaptive learning
    return 'present_new_task';
  }

  private selectExplanationStyle(cognitiveState: any, context: LearningContext): string {
    if (cognitiveState.currentLoad > 0.8) {
      return 'simplified';
    } else if (cognitiveState.flowStateProbability > 0.7) {
      return 'challenging';
    } else {
      return 'balanced';
    }
  }

  private async generateFeedback(context: LearningContext, cognitiveState: any, action: string): Promise<string> {
    const baseMessages = {
      maintain_flow: "Świetnie! Jesteś w stanie przepływu. Kontynuujmy w tym tempie.",
      reduce_cognitive_load: "Zauważam, że może być to za trudne. Spróbujmy łatwiejszego podejścia.",
      strengthen_connections: "Doskonale! Powtórzmy to jeszcze raz, aby wzmocnić zrozumienie.",
      address_predicted_struggles: "Pracujmy nad tym obszarem, zanim stanie się trudniejszy.",
      present_new_task: "Świetna robota! Przejdźmy do następnego wyzwania."
    };

    return baseMessages[action as keyof typeof baseMessages] || "Kontynuujmy naukę!";
  }

  private getAdaptationReason(cognitiveState: any, neuroplasticityState: any): string {
    if (cognitiveState.adaptationStrategy === 'maintain_flow') {
      return 'Optymalizacja stanu przepływu';
    } else if (cognitiveState.adaptationStrategy === 'reduce_load') {
      return 'Redukcja obciążenia poznawczego';
    } else if (neuroplasticityState.recommendedAction === 'strengthen') {
      return 'Wzmocnienie połączeń neuronowych';
    } else {
      return 'Adaptacja personalizowana';
    }
  }

  private async generateTaskWithAI(params: any): Promise<TaskDefinition> {
    // Fallback task generation
    return {
      id: `task_${Date.now()}`,
      department: params.department,
      skillName: params.microSkill || 'Basic Math',
      microSkill: params.microSkill || 'basic_operations',
      difficulty: params.difficulty,
      latex: '2 + 3 = ?',
      expectedAnswer: '5',
      misconceptionMap: {
        '4': {
          type: 'calculation_error',
          feedback: 'Sprawdź swoje obliczenia ponownie.'
        }
      }
    };
  }

  private getFallbackAdaptation(): AdaptationDecision {
    return {
      newDifficulty: 5,
      recommendedAction: 'present_new_task',
      nextTask: null,
      feedbackMessage: 'Kontynuujmy naukę!',
      explanationStyle: 'balanced',
      adaptationReason: 'Standard adaptation'
    };
  }
}