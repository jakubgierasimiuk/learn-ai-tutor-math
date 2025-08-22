import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { batchImportSkillContent, generateChatGPTPrompts, type BatchImportResult } from '@/lib/skillContentImporter';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Clock, Copy, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const BatchImportRunner = () => {
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [results, setResults] = useState<BatchImportResult | null>(null);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [skillCounts, setSkillCounts] = useState<Record<string, number>>({});
  const [generatingPrompts, setGeneratingPrompts] = useState(false);

  const runBatchImport = async () => {
    if (!jsonInput.trim()) {
      toast({
        title: "Błąd",
        description: "Wklej JSON z ChatGPT",
        variant: "destructive"
      });
      return;
    }

    setImporting(true);
    setResults(null);

    try {
      const data = JSON.parse(jsonInput);
      const importResults = await batchImportSkillContent(data);
      setResults(importResults);
      
      toast({
        title: "Import zakończony",
        description: `Przetworzono ${importResults.totalProcessed} umiejętności. Sukces: ${importResults.successful}, Błędy: ${importResults.failed}`,
      });

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Błąd importu",
        description: error instanceof Error ? error.message : "Nieprawidłowy format JSON",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const generatePrompts = async () => {
    setGeneratingPrompts(true);
    
    try {
      const { prompts: generatedPrompts, skillCounts: counts } = await generateChatGPTPrompts();
      setPrompts(generatedPrompts);
      setSkillCounts(counts);
      
      toast({
        title: "Prompty wygenerowane",
        description: `Utworzono ${generatedPrompts.length} promptów dla ChatGPT`,
      });
    } catch (error) {
      console.error('Error generating prompts:', error);
      toast({
        title: "Błąd generowania",
        description: "Nie udało się wygenerować promptów",
        variant: "destructive"
      });
    } finally {
      setGeneratingPrompts(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Skopiowano",
      description: `Prompt ${index + 1} skopiowany do schowka`,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>System Importu Batch - Uzupełnianie Umiejętności</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="import" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import">Import z ChatGPT</TabsTrigger>
              <TabsTrigger value="prompts">Generuj Prompty</TabsTrigger>
            </TabsList>
            
            <TabsContent value="import" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">JSON z ChatGPT:</label>
                  <Textarea
                    placeholder='Wklej tutaj JSON z ChatGPT w formacie: { "contentDatabase": [...] }'
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="min-h-[200px] font-mono text-xs"
                  />
                </div>
                
                {importing && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Importowanie danych...</span>
                  </div>
                )}

                {results && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{results.totalProcessed}</div>
                        <div className="text-sm text-blue-600">Przetworzono</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{results.successful}</div>
                        <div className="text-sm text-green-600">Sukces</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                        <div className="text-sm text-red-600">Błędy</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Szczegółowe wyniki:</h4>
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {results.details.map((result, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm p-2 rounded bg-muted">
                            {result.result.success ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className={result.result.success ? "text-green-700" : "text-red-700"}>
                              {result.skillName}
                            </span>
                            {result.result.error && (
                              <span className="text-xs text-muted-foreground ml-auto">
                                {result.result.error}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={runBatchImport} 
                  disabled={importing || !jsonInput.trim()}
                  className="w-full"
                >
                  {importing ? 'Importowanie...' : 'Importuj Dane z ChatGPT'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="prompts" className="space-y-6">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Wygeneruj prompty dla ChatGPT aby uzupełnić brakujące umiejętności:
                </div>

                {Object.keys(skillCounts).length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(skillCounts).map(([level, count]) => (
                      <div key={level} className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-blue-600">{count}</div>
                        <div className="text-xs text-blue-600">{level}</div>
                      </div>
                    ))}
                  </div>
                )}

                {generatingPrompts && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Generowanie promptów...</span>
                  </div>
                )}

                {prompts.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Prompty dla ChatGPT ({prompts.length}):</h4>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {prompts.map((prompt, index) => (
                        <Card key={index} className="relative">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm">Prompt {index + 1}</CardTitle>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(prompt, index)}
                                className="h-8"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Kopiuj
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <pre className="text-xs bg-muted p-3 rounded whitespace-pre-wrap max-h-32 overflow-y-auto">
                              {prompt.substring(0, 300)}...
                            </pre>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={generatePrompts} 
                  disabled={generatingPrompts}
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {generatingPrompts ? 'Generowanie...' : 'Wygeneruj Prompty dla ChatGPT'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};