import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MathSymbolsHook {
  quickSymbols: string[];
  loading: boolean;
  getSymbolsForText: (text: string) => string[];
  detectUIHelpRequest: (text: string) => { needsHelp: boolean; symbolRequested?: string };
}

export const useMathSymbols = (skillId?: string): MathSymbolsHook => {
  const [quickSymbols, setQuickSymbols] = useState<string[]>([]);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load skill-specific symbols and patterns on mount
  useEffect(() => {
    const loadSymbols = async () => {
      try {
        setLoading(true);

        // Load patterns for text analysis
        const { data: patternsData } = await supabase
          .from('math_symbol_patterns')
          .select('*')
          .order('confidence', { ascending: false });

        if (patternsData) {
          setPatterns(patternsData);
        }

        // Load skill-specific symbols if skillId provided
        if (skillId) {
          const { data: skillSymbols } = await supabase
            .from('skill_math_symbols')
            .select('quick_symbols')
            .eq('skill_id', skillId)
            .single();

          if (skillSymbols?.quick_symbols) {
            setQuickSymbols(skillSymbols.quick_symbols as string[]);
          }
        }
      } catch (error) {
        console.error('Error loading math symbols:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSymbols();
  }, [skillId]);

  // Analyze text to suggest relevant symbols
  const getSymbolsForText = (text: string): string[] => {
    if (!text || patterns.length === 0) return [];

    const textLower = text.toLowerCase();
    const matches: Array<{ symbols: string[]; confidence: number }> = [];

    patterns.forEach((pattern) => {
      const keywords = pattern.keywords || [];
      let matchCount = 0;

      keywords.forEach((keyword: string) => {
        if (textLower.includes(keyword.toLowerCase())) {
          matchCount++;
        }
      });

      if (matchCount > 0) {
        const relevanceScore = (matchCount / keywords.length) * pattern.confidence;
        matches.push({
          symbols: pattern.symbols as string[],
          confidence: relevanceScore
        });
      }
    });

    // Sort by confidence and merge symbols
    matches.sort((a, b) => b.confidence - a.confidence);
    const suggestedSymbols: string[] = [];

    matches.slice(0, 3).forEach((match) => {
      match.symbols.forEach((symbol) => {
        if (!suggestedSymbols.includes(symbol) && suggestedSymbols.length < 4) {
          suggestedSymbols.push(symbol);
        }
      });
    });

    return suggestedSymbols;
  };

  // Detect if user needs help with UI/symbols
  const detectUIHelpRequest = (text: string): { needsHelp: boolean; symbolRequested?: string } => {
    if (!text) return { needsHelp: false };
    
    const textLower = text.toLowerCase();
    const helpPatterns = [
      'jak wstawić', 'gdzie znajdę', 'nie wiem jak', 'jak napisać', 'jak dodać',
      'nie mogę znaleźć', 'gdzie jest symbol', 'jak napisać symbol'
    ];
    
    const needsHelp = helpPatterns.some(pattern => textLower.includes(pattern));
    
    if (needsHelp) {
      // Try to detect which symbol they need
      let symbolRequested;
      if (textLower.includes('pierwiastek')) symbolRequested = 'pierwiastek';
      else if (textLower.includes('delta')) symbolRequested = 'delta';
      else if (textLower.includes('sinus') || textLower.includes('sin')) symbolRequested = 'sinus';
      else if (textLower.includes('potęg')) symbolRequested = 'potęga';
      else if (textLower.includes('ułamek')) symbolRequested = 'ułamek';
      
      return { needsHelp: true, symbolRequested };
    }
    
    return { needsHelp: false };
  };

  return {
    quickSymbols,
    loading,
    getSymbolsForText,
    detectUIHelpRequest
  };
};