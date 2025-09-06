import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MathSymbolPanelProps {
  onSymbolSelect: (symbol: string) => void;
  quickSymbols?: string[];
  className?: string;
}

const SYMBOL_CATEGORIES = {
  podstawowe: ['×', '÷', '±', '≠', '≈', '≤', '≥', '∞'],
  potegi: ['x²', 'x³', 'xⁿ', '√', '∛', 'ⁿ√'],
  trygonometria: ['sin', 'cos', 'tan', 'π', 'α', 'β', 'γ', '°'],
  analiza: ['∫', 'd/dx', 'lim', '→', 'Δ', '∂'],
  geometria: ['∠', '⊥', '∥', '≅', '∼', '△', '□'],
  funkcje: ['f(x)', 'g(x)', '|x|', 'ln', 'log', 'e'],
  zbiory: ['∈', '∉', '⊂', '⊃', '∪', '∩', '∅', '∀', '∃']
};

const MathSymbolPanel: React.FC<MathSymbolPanelProps> = ({
  onSymbolSelect,
  quickSymbols = [],
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<keyof typeof SYMBOL_CATEGORIES>('podstawowe');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded]);

  const handleSymbolClick = (symbol: string) => {
    onSymbolSelect(symbol);
  };

  return (
    <div ref={panelRef} className={cn("relative", className)}>
      {/* Quick symbols row */}
      {quickSymbols.length > 0 && (
        <div className="flex items-center gap-1 mb-2">
          {quickSymbols.slice(0, 4).map((symbol, index) => (
            <Button
              key={`quick-${index}`}
              variant="outline"
              size="sm"
              className="h-8 min-w-[2rem] px-2 text-sm font-mono hover:bg-accent"
              onClick={() => handleSymbolClick(symbol)}
            >
              {symbol}
            </Button>
          ))}
          {quickSymbols.length > 4 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>
      )}

      {/* Expand button when no quick symbols */}
      {quickSymbols.length === 0 && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 mb-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          Symbole {isExpanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
        </Button>
      )}

      {/* Expanded panel */}
      {isExpanded && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-background border border-border rounded-lg shadow-lg z-50 max-w-sm">
          <div className="p-3">
            {/* Header with close button */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Symbole matematyczne</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsExpanded(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1 mb-3">
              {Object.keys(SYMBOL_CATEGORIES).map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "ghost"}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setActiveCategory(category as keyof typeof SYMBOL_CATEGORIES)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Symbol grid */}
            <div className="grid grid-cols-6 gap-1">
              {SYMBOL_CATEGORIES[activeCategory].map((symbol, index) => (
                <Button
                  key={`${activeCategory}-${index}`}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 text-sm font-mono hover:bg-accent"
                  onClick={() => handleSymbolClick(symbol)}
                >
                  {symbol}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MathSymbolPanel;