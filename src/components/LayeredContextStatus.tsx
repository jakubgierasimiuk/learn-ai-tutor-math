import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Cpu, Database, Zap } from 'lucide-react';

export const LayeredContextStatus: React.FC = () => {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-6 w-6 text-primary" />
          Enhanced Layered Context System - Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Phase 1 - Core Components */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Faza 1: Kluczowe komponenty ✅
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4" />
                <Badge variant="secondary">Zaimplementowane</Badge>
              </div>
              <p className="text-sm"><strong>Token Tracking:</strong></p>
              <ul className="text-xs space-y-1 mt-1">
                <li>• prompt_tokens</li>
                <li>• completion_tokens</li> 
                <li>• total_tokens (GENERATED)</li>
                <li>• assistant_flags JSONB</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4" />
                <Badge variant="secondary">Dynamiczne</Badge>
              </div>
              <p className="text-sm"><strong>Instrukcje pedagogiczne:</strong></p>
              <ul className="text-xs space-y-1 mt-1">
                <li>• Dostosowanie tempa</li>
                <li>• Detekcja pseudo-aktywności</li>
                <li>• Główne błędy</li>
                <li>• Streaki sukcesów</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4" />
                <Badge variant="secondary">Inteligentne</Badge>
              </div>
              <p className="text-sm"><strong>Zarządzanie budżetem:</strong></p>
              <ul className="text-xs space-y-1 mt-1">
                <li>• clampCompact(120 tok.)</li>
                <li>• minify() dla sytem prompts</li>
                <li>• Budżet ≤1200 tokenów</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Phase 2 - Enhanced Triggers */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Faza 2: Kompletne triggery ✅
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: '8 tur', status: 'active' },
              { name: '24h', status: 'active' },
            { name: '>900 tok.', status: 'active' },
              { name: 'Koniec lekcji', status: 'active' },
              { name: 'Zmiana fazy', status: 'active' },
              { name: 'Assistant flags', status: 'active' }
            ].map((trigger) => (
              <div key={trigger.name} className="p-3 border rounded-lg text-center">
                <Badge variant="secondary" className="mb-2">
                  {trigger.name}
                </Badge>
                <p className="text-xs text-muted-foreground">Aktywne</p>
              </div>
            ))}
          </div>
        </div>

        {/* Phase 3 - Monitoring */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Faza 3: Monitoring i stabilność ✅
          </h3>
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm mb-2"><strong>Funkcje monitoringu:</strong></p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p><strong>Logowanie per żądanie:</strong></p>
                <ul className="space-y-1 mt-1">
                  <li>• input_tokens</li>
                  <li>• output_tokens</li>
                  <li>• window_pairs</li>
                  <li>• compact_len_tok</li>
                </ul>
              </div>
              <div>
                <p><strong>Alerty automatyczne:</strong></p>
                <ul className="space-y-1 mt-1">
                  <li>• input_tokens &gt; 1400</li>
                  <li>• compact_len_tok &gt; 200</li>
                  <li>• Brak summary przez 2 wywołania</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Summary State */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Kompletny summary_state:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              'progress.attempts', 'progress.correct_streak', 'progress.errors_total',
              'misconceptions[]', 'mastered[]', 'struggled[]', 
              'spaced_repetition', 'affect.pace', 'affect.pseudo_activity_strikes',
              'last_window_digest', 'next_recommendation', 'updated_at'
            ].map((field) => (
              <Badge key={field} variant="outline" className="text-center">
                {field}
              </Badge>
            ))}
          </div>
        </div>

        {/* Success Summary */}
        <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
          <h4 className="text-sm font-semibold text-green-800 mb-2">✅ System w pełni zaimplementowany</h4>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• Stabilny koszt ≤1200 tokenów input</li>
            <li>• Dynamiczne instrukcje pedagogiczne</li>
            <li>• Kompletne triggery summarization</li>
            <li>• Inteligentne cięcie budżetu</li>
            <li>• Pełny monitoring tokenów</li>
            <li>• Enhanced edge case handling</li>
            <li>• Wszystkie założenia pakietu 1+2 spełnione</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};