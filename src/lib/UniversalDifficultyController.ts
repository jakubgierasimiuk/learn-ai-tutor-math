export class UniversalDifficultyController {
  public static getNextDifficulty(
    currentLevel: number,
    isCorrect: boolean = true,
    responseTime: number = 30000,
    confidence: number = 0.8
  ): number {
    let adjustment = 0;
    
    if (isCorrect) {
      // Increase difficulty if answer was correct
      if (responseTime < 15000 && confidence > 0.9) {
        adjustment = 1.5; // Fast and confident - big jump
      } else if (responseTime < 30000 && confidence > 0.7) {
        adjustment = 1.0; // Normal progression
      } else {
        adjustment = 0.5; // Slow but correct - small increase
      }
    } else {
      // Decrease difficulty if answer was wrong
      if (confidence < 0.3) {
        adjustment = -2.0; // Very uncertain - big decrease
      } else if (confidence < 0.6) {
        adjustment = -1.0; // Somewhat uncertain - moderate decrease
      } else {
        adjustment = -0.5; // Wrong but confident - small decrease
      }
    }
    
    const newLevel = currentLevel + adjustment;
    
    // Clamp between 1 and 10
    return Math.max(1, Math.min(10, newLevel));
  }

  public static calculateOptimalDifficulty(
    userHistory: Array<{
      difficulty: number;
      isCorrect: boolean;
      responseTime: number;
      confidence: number;
    }>
  ): number {
    if (userHistory.length === 0) return 3; // Default starting difficulty
    
    const recentHistory = userHistory.slice(-5); // Last 5 attempts
    const correctAnswers = recentHistory.filter(h => h.isCorrect).length;
    const averageResponseTime = recentHistory.reduce((sum, h) => sum + h.responseTime, 0) / recentHistory.length;
    const averageConfidence = recentHistory.reduce((sum, h) => sum + h.confidence, 0) / recentHistory.length;
    
    let targetDifficulty = recentHistory[recentHistory.length - 1].difficulty;
    
    // Adjust based on success rate
    const successRate = correctAnswers / recentHistory.length;
    if (successRate > 0.8) {
      targetDifficulty += 1;
    } else if (successRate < 0.4) {
      targetDifficulty -= 1;
    }
    
    // Adjust based on response time (faster = increase difficulty)
    if (averageResponseTime < 20000 && successRate > 0.6) {
      targetDifficulty += 0.5;
    } else if (averageResponseTime > 60000) {
      targetDifficulty -= 0.5;
    }
    
    // Adjust based on confidence
    if (averageConfidence > 0.8 && successRate > 0.6) {
      targetDifficulty += 0.5;
    } else if (averageConfidence < 0.5) {
      targetDifficulty -= 0.5;
    }
    
    return Math.max(1, Math.min(10, targetDifficulty));
  }

  public static shouldProgressToNextMicroSkill(
    microSkillHistory: Array<{
      isCorrect: boolean;
      difficulty: number;
      confidence: number;
    }>
  ): boolean {
    if (microSkillHistory.length < 3) return false;
    
    const recent = microSkillHistory.slice(-3);
    const allCorrect = recent.every(h => h.isCorrect);
    const averageDifficulty = recent.reduce((sum, h) => sum + h.difficulty, 0) / recent.length;
    const averageConfidence = recent.reduce((sum, h) => sum + h.confidence, 0) / recent.length;
    
    return allCorrect && averageDifficulty >= 6 && averageConfidence >= 0.8;
  }
}