import React, { useEffect, useState } from 'react';
import { autoImportSkills } from '@/lib/skillContentImporter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export const AutoImportRunner = () => {
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const runImport = async () => {
    setImporting(true);
    setCompleted(false);
    setResults([]);

    try {
      const importResults = await autoImportSkills();
      setResults(importResults);
      setCompleted(true);
      
      const successCount = importResults.filter(r => r.result.success).length;
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount}/${importResults.length} skills`,
      });
    } catch (error) {
      toast({
        title: "Import Failed", 
        description: "Failed to import skills",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Skill Content Auto-Import</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          This will import all 10 mathematics skills (classes 4-6) with complete content structure.
        </div>

        {!completed && !importing && (
          <Button onClick={runImport} className="w-full">
            Import All Skills
          </Button>
        )}

        {importing && (
          <div className="flex items-center gap-2 p-4 border rounded-lg">
            <Clock className="w-5 h-5 animate-spin" />
            <span>Importing skills to database...</span>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Import Results:</h3>
            {results.map((result, index) => (
              <div key={index} className="flex items-center gap-2 text-sm p-2 border rounded">
                {result.result.success ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
                <span className={result.result.success ? "text-green-700" : "text-red-700"}>
                  {result.skillName}
                </span>
                {result.result.skillId && (
                  <span className="text-xs text-muted-foreground">
                    ID: {result.result.skillId}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {completed && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-800">Import Complete!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              All skills have been imported. The Study-Tutor system can now use this content.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoImportRunner;