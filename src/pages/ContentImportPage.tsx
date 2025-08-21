import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { importAllSkillContent, contentDatabase } from '@/lib/skillContentImporter';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

export const ContentImportPage = () => {
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);
    setResults([]);

    try {
      const totalSkills = contentDatabase.contentDatabase.length;
      
      for (let i = 0; i < totalSkills; i++) {
        const skillData = contentDatabase.contentDatabase[i];
        setProgress(((i + 1) / totalSkills) * 100);

        const { importSkillContent } = await import('@/lib/skillContentImporter');
        const result = await importSkillContent(skillData);
        
        setResults(prev => [...prev, {
          skillName: skillData.skillName,
          success: result.success,
          error: result.error
        }]);
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${results.filter(r => r.success).length} skills`,
      });

    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import skill content",
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
          <CardTitle>Import Skill Content Database</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground">
            This will import {contentDatabase.contentDatabase.length} skills with their theory, examples, 
            practice exercises, and misconception patterns into the database.
          </div>

          {importing && (
            <div className="space-y-4">
              <Progress value={progress} className="w-full" />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Importing skills... {Math.round(progress)}%</span>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={result.success ? "text-green-700" : "text-red-700"}>
                    {result.skillName}
                  </span>
                  {result.error && (
                    <span className="text-xs text-muted-foreground">
                      - {result.error.message}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <Button 
            onClick={handleImport} 
            disabled={importing}
            className="w-full"
          >
            {importing ? 'Importing...' : 'Import Skill Content'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};