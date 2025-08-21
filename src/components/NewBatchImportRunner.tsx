import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { autoImportNewBatch } from '@/lib/skillContentImporter';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

export const NewBatchImportRunner = () => {
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const runNewBatchImport = async () => {
    setImporting(true);
    setCompleted(false);
    setResults([]);

    try {
      const importResults = await autoImportNewBatch();
      setResults(importResults);
      setCompleted(true);
      
      const successCount = importResults.filter(r => r.result.success).length;
      toast({
        title: "New Batch Import Complete",
        description: `Successfully imported ${successCount}/2 new skills for class 2 liceum`,
      });

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import new batch content",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>New Batch Import - Class 2 Liceum Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Import 2 new advanced mathematics skills for class 2 liceum:
            <ul className="mt-2 ml-4 list-disc">
              <li>Funkcja wykładnicza i logarytmiczna</li>
              <li>Geometria analityczna – okrąg i parabola</li>
            </ul>
          </div>

          {importing && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Importing new batch skills...</span>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Import Results:</h4>
              {results.map((result, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {result.result.success ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={result.result.success ? "text-green-700" : "text-red-700"}>
                    {result.skillName}
                  </span>
                  {result.result.error && (
                    <span className="text-xs text-muted-foreground">
                      - {result.result.error.message}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {completed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">New Batch Import Complete!</span>
              </div>
              <p className="text-green-700 mt-1">
                New skills have been imported. The Study-Tutor system can now use this 
                advanced content for class 2 liceum students.
              </p>
            </div>
          )}

          <Button 
            onClick={runNewBatchImport} 
            disabled={importing}
            className="w-full"
          >
            {importing ? 'Importing New Batch...' : 'Import New Batch Skills'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};