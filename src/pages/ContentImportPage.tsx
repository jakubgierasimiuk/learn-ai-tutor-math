import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { autoImportNewBatch, importSingleSkillFromJSON, importLinearInequalitiesSkill, importAbsoluteValueSkill, importQuadraticInequalitiesSkill, importAbsoluteValueEquationsSkill } from '@/lib/skillContentImporter';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Clock, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import SkillGapDashboard from '@/components/SkillGapDashboard';

export const ContentImportPage = () => {
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  
  // New batch states
  const [importingNewBatch, setImportingNewBatch] = useState(false);
  const [newBatchResults, setNewBatchResults] = useState<any[]>([]);
  const [newBatchCompleted, setNewBatchCompleted] = useState(false);
  
  // Single JSON import states
  const [jsonContent, setJsonContent] = useState('');
  const [importingJson, setImportingJson] = useState(false);
  const [jsonResult, setJsonResult] = useState<any>(null);
  
  // Linear inequalities import
  const [importingInequalities, setImportingInequalities] = useState(false);
  const [inequalitiesResult, setInequalitiesResult] = useState<any>(null);
  
  // Absolute value import
  const [importingAbsoluteValue, setImportingAbsoluteValue] = useState(false);
  const [absoluteValueResult, setAbsoluteValueResult] = useState<any>(null);
  
  // State for Quadratic Inequalities import
  const [importingQuadraticInequalities, setImportingQuadraticInequalities] = useState(false);
  const [quadraticInequalitiesResult, setQuadraticInequalitiesResult] = useState<any>(null);
  
  // State for Absolute Value Equations import
  const [importingAbsoluteValueEquations, setImportingAbsoluteValueEquations] = useState(false);
  const [absoluteValueEquationsResult, setAbsoluteValueEquationsResult] = useState<any>(null);

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

  const handleNewBatchImport = async () => {
    setImportingNewBatch(true);
    setNewBatchCompleted(false);
    setNewBatchResults([]);

    try {
      const importResults = await autoImportNewBatch();
      setNewBatchResults(importResults);
      setNewBatchCompleted(true);
      
      const successCount = importResults.filter(r => r.result.success).length;
      toast({
        title: "New Batch Import Complete",
        description: `Successfully imported ${successCount}/2 new skills for class 2 liceum`,
      });

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "New Batch Import Failed",
        description: "Failed to import new batch content",
        variant: "destructive"
      });
    } finally {
      setImportingNewBatch(false);
    }
  };

  const handleJsonImport = async () => {
    if (!jsonContent.trim()) {
      toast({
        title: "No JSON Content",
        description: "Please paste JSON content to import",
        variant: "destructive"
      });
      return;
    }

    setImportingJson(true);
    setJsonResult(null);

    try {
      const parsedJson = JSON.parse(jsonContent);
      const result = await importSingleSkillFromJSON(parsedJson);
      setJsonResult(result);
      
      if (result.result.success) {
        toast({
          title: "JSON Import Complete",
          description: `Successfully imported skill: ${result.skillName}`,
        });
      } else {
        toast({
          title: "JSON Import Failed",
          description: result.result.error || "Unknown error",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('JSON parse error:', error);
      toast({
        title: "JSON Import Failed",
        description: "Invalid JSON format",
        variant: "destructive"
      });
    } finally {
      setImportingJson(false);
    }
  };

  const handleInequalitiesImport = async () => {
    setImportingInequalities(true);
    setInequalitiesResult(null);

    try {
      const result = await importLinearInequalitiesSkill();
      setInequalitiesResult(result);
      
      if (result.result.success) {
        toast({
          title: "Linear Inequalities Imported!",
          description: `Successfully imported: ${result.skillName}`,
        });
      } else {
        toast({
          title: "Import Failed",
          description: result.result.error || "Unknown error",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import linear inequalities skill",
        variant: "destructive"
      });
    } finally {
      setImportingInequalities(false);
    }
  };

  const handleAbsoluteValueImport = async () => {
    setImportingAbsoluteValue(true);
    setAbsoluteValueResult(null);

    try {
      const result = await importAbsoluteValueSkill();
      setAbsoluteValueResult(result);
      
      if (result.result.success) {
        toast({
          title: "Absolute Value Skill Imported!",
          description: `Successfully imported: ${result.skillName}`,
        });
      } else {
        toast({
          title: "Import Failed",
          description: result.result.error || "Unknown error",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed", 
        description: "Failed to import absolute value skill",
        variant: "destructive"
      });
    } finally {
      setImportingAbsoluteValue(false);
    }
  };

  const handleQuadraticInequalitiesImport = async () => {
    setImportingQuadraticInequalities(true);
    setQuadraticInequalitiesResult(null);

    try {
      const result = await importQuadraticInequalitiesSkill();
      setQuadraticInequalitiesResult(result);
      
      if (result.result.success) {
        toast({
          title: "Quadratic Inequalities Imported!",
          description: `Successfully imported: ${result.skillName}`,
        });
      } else {
        toast({
          title: "Import Failed",
          description: result.result.error || "Unknown error",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import quadratic inequalities skill",
        variant: "destructive"
      });
    } finally {
      setImportingQuadraticInequalities(false);
    }
  };

  const handleAbsoluteValueEquationsImport = async () => {
    setImportingAbsoluteValueEquations(true);
    setAbsoluteValueEquationsResult(null);

    try {
      const result = await importAbsoluteValueEquationsSkill();
      setAbsoluteValueEquationsResult(result);
      
      if (result.result.success) {
        toast({
          title: "Absolute Value Equations Imported!",
          description: `Successfully imported: ${result.skillName}`,
        });
      } else {
        toast({
          title: "Import Failed",
          description: result.result.error || "Unknown error",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import absolute value equations skill",
        variant: "destructive"
      });
    } finally {
      setImportingAbsoluteValueEquations(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Skill Gap Analysis Dashboard */}
      <SkillGapDashboard />
      
      {/* Original Content Import */}
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
            disabled={importing || importingNewBatch}
            className="w-full"
          >
            {importing ? 'Importing...' : 'Import Original Skill Content'}
          </Button>
        </CardContent>
      </Card>

      {/* New Batch Import */}
      <Card>
        <CardHeader>
          <CardTitle>New Batch Import - Class 2 Liceum Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Import {newBatchContentDatabase.contentDatabase.length} new advanced mathematics skills for class 2 liceum:
            <ul className="mt-2 ml-4 list-disc">
              {newBatchContentDatabase.contentDatabase.map((skill, index) => (
                <li key={index}>{skill.skillName}</li>
              ))}
            </ul>
          </div>

          {importingNewBatch && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Importing new batch skills...</span>
            </div>
          )}

          {newBatchResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Import Results:</h4>
              {newBatchResults.map((result, index) => (
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

          {newBatchCompleted && (
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
            onClick={handleNewBatchImport} 
            disabled={importing || importingNewBatch}
            className="w-full"
          >
            {importingNewBatch ? 'Importing New Batch...' : 'Import New Batch Skills (Class 2 Liceum)'}
          </Button>
        </CardContent>
      </Card>

      {/* Single JSON Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Single Skill from JSON
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Paste JSON content generated by ChatGPT to import a single skill with all its content.
          </div>

          <div className="space-y-2">
            <label htmlFor="json-content" className="text-sm font-medium">
              JSON Content:
            </label>
            <Textarea
              id="json-content"
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
              placeholder="Paste your JSON content here..."
              className="min-h-[200px] font-mono text-xs"
              disabled={importingJson}
            />
          </div>

          {importingJson && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Importing JSON skill...</span>
            </div>
          )}

          {jsonResult && (
            <div className="space-y-2">
              <h4 className="font-semibold">Import Result:</h4>
              <div className="flex items-center gap-2 text-sm">
                {jsonResult.result.success ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={jsonResult.result.success ? "text-green-700" : "text-red-700"}>
                  {jsonResult.skillName}
                </span>
                {jsonResult.result.error && (
                  <span className="text-xs text-muted-foreground">
                    - {jsonResult.result.error}
                  </span>
                )}
              </div>

              {jsonResult.result.success && jsonResult.result.skillId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Skill Successfully Imported!</span>
                  </div>
                  <p className="text-green-700 mt-1">
                    Skill ID: {jsonResult.result.skillId}<br />
                    The skill is now available in the Study-Tutor system.
                  </p>
                </div>
              )}
            </div>
          )}

          <Button 
            onClick={handleJsonImport} 
            disabled={importing || importingNewBatch || importingJson || !jsonContent.trim()}
            className="w-full"
          >
            {importingJson ? 'Importing JSON...' : 'Import Single Skill from JSON'}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Linear Inequalities Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📐 Quick Import: Linear Inequalities Skill
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Import the pre-configured "Nierówności liniowe z jedną niewiadomą" skill with fixed JSON format.
          </div>

          {importingInequalities && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Importing linear inequalities skill...</span>
            </div>
          )}

          {inequalitiesResult && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {inequalitiesResult.result.success ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={inequalitiesResult.result.success ? "text-green-700" : "text-red-700"}>
                  {inequalitiesResult.skillName}
                </span>
              </div>

              {inequalitiesResult.result.success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Skill Successfully Imported!</span>
                  </div>
                  <p className="text-green-700 mt-1">
                    Skill ID: {inequalitiesResult.result.skillId}<br />
                    Now available in Study-Tutor system with complete content.
                  </p>
                </div>
              )}
            </div>
          )}

          <Button 
            onClick={handleInequalitiesImport} 
            disabled={importing || importingNewBatch || importingJson || importingInequalities || importingAbsoluteValue}
            className="w-full"
          >
            {importingInequalities ? 'Importing...' : 'Import Linear Inequalities Skill'}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Absolute Value Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Quick Import: Absolute Value Skill
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Import the pre-configured "Wartość bezwzględna - definicja i własności" skill with complete content.
          </div>

          {importingAbsoluteValue && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Importing absolute value skill...</span>
            </div>
          )}

          {absoluteValueResult && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {absoluteValueResult.result.success ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={absoluteValueResult.result.success ? "text-green-700" : "text-red-700"}>
                  {absoluteValueResult.skillName}
                </span>
              </div>

              {absoluteValueResult.result.success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Skill Successfully Imported!</span>
                  </div>
                  <p className="text-green-700 mt-1">
                    Skill ID: {absoluteValueResult.result.skillId}<br />
                    Now available in Study-Tutor system with complete content.
                  </p>
                </div>
              )}
            </div>
          )}

          <Button 
            onClick={handleAbsoluteValueImport} 
            disabled={importing || importingNewBatch || importingJson || importingInequalities || importingAbsoluteValue || importingQuadraticInequalities || importingAbsoluteValueEquations}
            className="w-full"
          >
            {importingAbsoluteValue ? 'Importing...' : 'Import Absolute Value Skill'}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Quadratic Inequalities Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📈 Quick Import: Quadratic Inequalities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Import the "Nierówności kwadratowe" skill for Class 1 with complete content including theory, examples, and practice exercises.
          </div>

          {importingQuadraticInequalities && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Importing quadratic inequalities skill...</span>
            </div>
          )}

          {quadraticInequalitiesResult && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {quadraticInequalitiesResult.result.success ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={quadraticInequalitiesResult.result.success ? "text-green-700" : "text-red-700"}>
                  {quadraticInequalitiesResult.skillName}
                </span>
              </div>

              {quadraticInequalitiesResult.result.success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Skill Successfully Imported!</span>
                  </div>
                  <p className="text-green-700 mt-1">
                    Skill ID: {quadraticInequalitiesResult.result.skillId}<br />
                    Now available in Study-Tutor system with complete content.
                  </p>
                </div>
              )}
            </div>
          )}

          <Button 
            onClick={handleQuadraticInequalitiesImport} 
            disabled={importing || importingNewBatch || importingJson || importingInequalities || importingAbsoluteValue || importingQuadraticInequalities || importingAbsoluteValueEquations}
            className="w-full"
          >
            {importingQuadraticInequalities ? 'Importing...' : 'Import Quadratic Inequalities'}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Absolute Value Equations Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 Quick Import: Absolute Value Equations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Import the "Równania i nierówności z wartością bezwzględną" skill for Class 2 with comprehensive content.
          </div>

          {importingAbsoluteValueEquations && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Importing absolute value equations skill...</span>
            </div>
          )}

          {absoluteValueEquationsResult && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {absoluteValueEquationsResult.result.success ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={absoluteValueEquationsResult.result.success ? "text-green-700" : "text-red-700"}>
                  {absoluteValueEquationsResult.skillName}
                </span>
              </div>

              {absoluteValueEquationsResult.result.success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Skill Successfully Imported!</span>
                  </div>
                  <p className="text-green-700 mt-1">
                    Skill ID: {absoluteValueEquationsResult.result.skillId}<br />
                    Now available in Study-Tutor system with complete content.
                  </p>
                </div>
              )}
            </div>
          )}

          <Button 
            onClick={handleAbsoluteValueEquationsImport} 
            disabled={importing || importingNewBatch || importingJson || importingInequalities || importingAbsoluteValue || importingQuadraticInequalities || importingAbsoluteValueEquations}
            className="w-full"
          >
            {importingAbsoluteValueEquations ? 'Importing...' : 'Import Absolute Value Equations'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};