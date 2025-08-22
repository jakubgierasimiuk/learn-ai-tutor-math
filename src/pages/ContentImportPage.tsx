import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  importTrigonometricFunctionsSkill, 
  importLimitsFunctionsSkill, 
  importDerivativeFunctionSkill,
  importPolynomialEquationsSkill,
  importPlaneGeometrySkill,
  importSolidGeometrySkill,
  importCombinatoricsProbabilitySkill,
  autoImportNewBatch,
  importSingleSkillFromJSON,
  importLinearInequalitiesSkill,
  importAbsoluteValueSkill,
  importQuadraticInequalitiesSkill,
  importAbsoluteValueEquationsSkill,
  importDefiniteIntegralBasicsSkill,
  importDefiniteIntegralApplicationsSkill,
  importExponentialLogarithmicFunctionsSkill,
  importNumberSequencesSkill
} from '@/lib/skillContentImporter';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Clock, Upload, Calculator, Loader2 } from 'lucide-react';
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
  
  // State for Definite Integral Basics import
  const [importingDefiniteIntegralBasics, setImportingDefiniteIntegralBasics] = useState(false);
  const [definiteIntegralBasicsResult, setDefiniteIntegralBasicsResult] = useState<any>(null);

  // State for Definite Integral Applications import
  const [importingDefiniteIntegral, setImportingDefiniteIntegral] = useState(false);
  const [definiteIntegralResult, setDefiniteIntegralResult] = useState<any>(null);

  // State for Exponential/Logarithmic Functions import  
  const [importingExpLog, setImportingExpLog] = useState(false);
  const [expLogResult, setExpLogResult] = useState<any>(null);

  // State for Number Sequences import
  const [importingSequences, setImportingSequences] = useState(false);
  const [sequencesResult, setSequencesResult] = useState<any>(null);

  // State for Trigonometric Functions import
  const [importingTrigonometric, setImportingTrigonometric] = useState(false);
  const [trigonometricResult, setTrigonometricResult] = useState<any>(null);

  // State for Limits Functions import
  const [importingLimits, setImportingLimits] = useState(false);
  const [limitsResult, setLimitsResult] = useState<any>(null);

  // State for Derivative Function import
  const [importingDerivative, setImportingDerivative] = useState(false);
  const [derivativeResult, setDerivativeResult] = useState<any>(null);

  // State for Polynomial Equations import
  const [importingPolynomial, setImportingPolynomial] = useState(false);
  const [polynomialResult, setPolynomialResult] = useState<any>(null);

  // State for Plane Geometry import
  const [importingPlaneGeometry, setImportingPlaneGeometry] = useState(false);
  const [planeGeometryResult, setPlaneGeometryResult] = useState<any>(null);

  // State for Solid Geometry import
  const [importingSolidGeometry, setImportingSolidGeometry] = useState(false);
  const [solidGeometryResult, setSolidGeometryResult] = useState<any>(null);

  // State for Combinatorics Probability import
  const [importingCombinatoricsProbability, setImportingCombinatoricsProbability] = useState(false);
  const [combinatoricsProbabilityResult, setCombinatoricsProbabilityResult] = useState<any>(null);

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);
    setResults([]);

    try {
      const totalSkills = 0; // Legacy content database disabled
      
      if (totalSkills === 0) {
        toast({
          title: "Import Disabled",
          description: "Legacy content database is disabled. Use the new batch import instead.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Import Complete",
        description: "Legacy import is disabled",
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

  const handleDefiniteIntegralBasicsImport = async () => {
    setImportingDefiniteIntegralBasics(true);
    setDefiniteIntegralBasicsResult(null);

    try {
      const result = await importDefiniteIntegralBasicsSkill();
      setDefiniteIntegralBasicsResult(result);
      
      if (result.result.success) {
        toast({
          title: "Definite Integral Basics Imported!",
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
        description: "Failed to import definite integral basics skill",
        variant: "destructive"
      });
    } finally {
      setImportingDefiniteIntegralBasics(false);
    }
  };

  const handleDefiniteIntegralImport = async () => {
    setImportingDefiniteIntegral(true);
    setDefiniteIntegralResult(null);

    try {
      const result = await importDefiniteIntegralApplicationsSkill();
      setDefiniteIntegralResult(result);
      
      if (result.result.success) {
        toast({
          title: "Definite Integral Applications Imported!",
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
        description: "Failed to import definite integral applications skill",
        variant: "destructive"
      });
    } finally {
      setImportingDefiniteIntegral(false);
    }
  };

  const handleExpLogImport = async () => {
    setImportingExpLog(true);
    setExpLogResult(null);

    try {
      const result = await importExponentialLogarithmicFunctionsSkill();
      setExpLogResult(result);
      
      if (result.result.success) {
        toast({
          title: "Exponential/Logarithmic Functions Imported!",
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
        description: "Failed to import exponential/logarithmic functions skill",
        variant: "destructive"
      });
    } finally {
      setImportingExpLog(false);
    }
  };

  const handleSequencesImport = async () => {
    setImportingSequences(true);
    setSequencesResult(null);

    try {
      const result = await importNumberSequencesSkill();
      setSequencesResult(result);
      
      if (result.result.success) {
        toast({
          title: "Number Sequences Imported!",
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
        description: "Failed to import number sequences skill",
        variant: "destructive"
      });
    } finally {
      setImportingSequences(false);
    }
  };

  const handleTrigonometricImport = async () => {
    setImportingTrigonometric(true);
    setTrigonometricResult(null);

    try {
      const result = await importTrigonometricFunctionsSkill();
      setTrigonometricResult(result);
      
      if (result.result.success) {
        toast({
          title: "Trigonometric Functions Imported!",
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
        description: "Failed to import trigonometric functions skill",
      });
    } finally {
      setImportingTrigonometric(false);
    }
  };

  const handleLimitsImport = async () => {
    setImportingLimits(true);
    setLimitsResult(null);

    try {
      const result = await importLimitsFunctionsSkill();
      setLimitsResult(result);
      
      if (result.result.success) {
        toast({
          title: "Limits Functions Imported!",
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
        description: "Failed to import limits functions skill",
        variant: "destructive"
      });
    } finally {
      setImportingLimits(false);
    }
  };

  const handleDerivativeImport = async () => {
    setImportingDerivative(true);
    setDerivativeResult(null);

    try {
      const result = await importDerivativeFunctionSkill();
      setDerivativeResult(result);
      
      if (result.result.success) {
        toast({
          title: "Derivative Function Imported!",
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
        description: "Failed to import derivative function skill",
        variant: "destructive"
      });
    } finally {
      setImportingDerivative(false);
    }
  };

  const handlePolynomialImport = async () => {
    setImportingPolynomial(true);
    setPolynomialResult(null);

    try {
      const result = await importPolynomialEquationsSkill();
      setPolynomialResult(result);
      
      if (result.result.success) {
        toast({
          title: "Polynomial Equations Imported!",
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
        description: "Failed to import polynomial equations skill",
        variant: "destructive"
      });
    } finally {
      setImportingPolynomial(false);
    }
  };

  const handlePlaneGeometryImport = async () => {
    setImportingPlaneGeometry(true);
    setPlaneGeometryResult(null);

    try {
      const result = await importPlaneGeometrySkill();
      setPlaneGeometryResult(result);
      
      if (result.result.success) {
        toast({
          title: "Plane Geometry Imported!",
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
        description: "Failed to import plane geometry skill",
        variant: "destructive"
      });
    } finally {
      setImportingPlaneGeometry(false);
    }
  };

  const handleSolidGeometryImport = async () => {
    setImportingSolidGeometry(true);
    setSolidGeometryResult(null);

    try {
      const result = await importSolidGeometrySkill();
      setSolidGeometryResult(result);
      
      if (result.result.success) {
        toast({
          title: "Solid Geometry Imported!",
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
        description: "Failed to import solid geometry skill",
        variant: "destructive"
      });
    } finally {
      setImportingSolidGeometry(false);
    }
  };

  const handleCombinatoricsProbabilityImport = async () => {
    setImportingCombinatoricsProbability(true);
    setCombinatoricsProbabilityResult(null);

    try {
      const result = await importCombinatoricsProbabilitySkill();
      setCombinatoricsProbabilityResult(result);
      
      if (result.result.success) {
        toast({
          title: "Combinatorics & Probability Imported!",
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
        description: "Failed to import combinatorics & probability skill",
        variant: "destructive"
      });
    } finally {
      setImportingCombinatoricsProbability(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Updated Missing Skills Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Stan Bazy Danych - Braki w Umiejętnościach</CardTitle>
          <CardDescription>
            Aktualny status pokrycia umiejętności w bazie danych (ostatnia aktualizacja: 22.01.2025)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* DATABASE STATUS - UPDATED */}
          <div className="mb-6 p-6 bg-card rounded-lg border">
            <h3 className="text-xl font-semibold mb-4">Aktualny stan bazy danych</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">230</div>
                <div className="text-sm text-muted-foreground">Łącznie umiejętności</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">40</div>
                <div className="text-sm text-muted-foreground">Z teorią</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">39</div>
                <div className="text-sm text-muted-foreground">Z przykładami</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">37</div>
                <div className="text-sm text-muted-foreground">Z ćwiczeniami</div>
              </div>
            </div>
          </div>

          {/* COMPLETE SKILLS - UPDATED */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">✅ UMIEJĘTNOŚCI Z PEŁNĄ ZAWARTOŚCIĄ (37 z teorią, przykładami i ćwiczeniami):</h4>
            <div className="text-sm text-green-700 space-y-1">
              <div><strong>Klasy 4-6 (10):</strong> Działania na liczbach naturalnych, Ułamki zwykłe, Figury geometryczne, Pomiary długości, Liczby dziesiętne, Procenty podstawowe, Pola figur, Jednostki miar, Liczby ujemne, Proporcjonalność</div>
              <div><strong>Klasa 1 (5):</strong> Funkcje — definicja i własności, Równania i nierówności kwadratowe, Trygonometria — funkcje i wzory, Ciągi arytmetyczne i geometryczne, Prawdopodobieństwo warunkowe</div>
              <div><strong>Klasa 2 (7):</strong> Funkcja wykładnicza i logarytmiczna, Geometria analityczna – okrąg i parabola, Ciągi liczbowe, Granice funkcji, Równania i nierówności z wartością bezwzględną, Równania i nierówności wielomianowe, Planimetria – wielokąty i okręgi</div>
              <div><strong>Klasa 3 (15):</strong> Pochodna funkcji, Całka nieoznaczona, Całka oznaczona, Zastosowania całki, Funkcje wykładnicze i logarytmiczne, Równania różniczkowe, Rozkłady prawdopodobieństwa, Stereometria — objętości i pola powierzchni, Kombinatoryka i prawdopodobieństwo, Stereometria – bryły</div>
            </div>
          </div>

          {/* MISSING CONTENT */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">❌ PROBLEM: BŁĘDNE STATYSTYKI!</h4>
            <div className="text-sm text-red-700 space-y-1">
              <div><strong>Wykryto rozbieżność:</strong> Statystyki nie odpowiadają rzeczywistości</div>
              <div><strong>Wcześniej raportowano:</strong> 279/469 (59.5%) i 280/470 (59.6%)</div>
              <div><strong>Rzeczywistość w bazie:</strong> Tylko 26/230 umiejętności ma zawartość (11.3%)</div>
              <div><strong>Błąd:</strong> Liczby były na sztywno wpisane, nie pochodziły z bazy</div>
            </div>
          </div>

          {/* PROGRESS STATS - CORRECTED */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">📊 RZECZYWISTE STATYSTYKI Z BAZY:</h4>
            <div className="text-sm text-orange-700 space-y-1">
              <div>• <strong>Aktywne umiejętności:</strong> 230 (nie 469/470)</div>
              <div>• <strong>Z pełną zawartością:</strong> 26 umiejętności (11.3%)</div>
              <div>• <strong>Bez zawartości:</strong> 204 umiejętności (88.7%)</div>
              <div>• <strong>Stan krytyczny:</strong> Konieczny masowy import treści</div>
              <div>• <strong>Przyczyna rozbieżności:</strong> Błędne na sztywno wpisane liczby</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skill Gap Analysis Dashboard */}
      <SkillGapDashboard />
      
      {/* Original Content Import */}
      <Card>
        <CardHeader>
          <CardTitle>Import Skill Content Database</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Legacy content database import is disabled. Use the new batch import or single skill import instead.
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
            Import 2 new advanced mathematics skills for class 3 liceum:
            <ul className="mt-2 ml-4 list-disc">
              <li>Rozkłady prawdopodobieństwa — dyskretne i ciągłe</li>
              <li>Równania różniczkowe — podstawy (separowalne i liniowe)</li>
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

      {/* Definite Integral Applications Import */}
        <Card>
          <CardHeader>
            <CardTitle>Definite Integral Basics Import</CardTitle>
            <CardDescription>
              Import "Całka oznaczona - definicja i obliczanie" skill for class 3 (analiza matematyczna)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleDefiniteIntegralBasicsImport}
              disabled={importingDefiniteIntegralBasics}
              className="w-full"
            >
              {importingDefiniteIntegralBasics && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import Definite Integral Basics Skill
            </Button>
            
            {definiteIntegralBasicsResult && (
              <div className="mt-4 p-3 rounded-md bg-muted/50">
                <p className="text-sm font-medium">Import Result:</p>
                <p className="text-sm text-muted-foreground">
                  Skill: {definiteIntegralBasicsResult.skillName}
                </p>
                <p className={`text-sm ${definiteIntegralBasicsResult.result.success ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {definiteIntegralBasicsResult.result.success ? 'Success' : 'Failed'}
                  {definiteIntegralBasicsResult.result.error && ` - ${definiteIntegralBasicsResult.result.error}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Import Definite Integral Applications (Class 3)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Import "Zastosowania całki oznaczonej (pola, objętości)" skill for Class 3 with complete content.
          </div>

          <Button 
            onClick={handleDefiniteIntegralImport} 
            disabled={importing || importingNewBatch || importingJson || importingInequalities || importingAbsoluteValue || importingQuadraticInequalities || importingAbsoluteValueEquations || importingDefiniteIntegral}
            className="w-full"
          >
            {importingDefiniteIntegral ? 'Importing...' : 'Import Definite Integral Applications'}
          </Button>
        </CardContent>
        </Card>

        {/* HIGH PRIORITY SKILLS SECTION */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⭐ PRIORYTET WYSOKI: Funkcje wykładnicze i logarytmiczne
            </CardTitle>
            <CardDescription>
              Import "Funkcje wykładnicze i logarytmiczne" skill for class 3 (analiza matematyczna) - HIGH PRIORITY
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleExpLogImport}
              disabled={importingExpLog}
              className="w-full"
              variant="default"
            >
              {importingExpLog && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import Exponential/Logarithmic Functions (PRIORYTET WYSOKI)
            </Button>
            
            {expLogResult && (
              <div className="mt-4 p-3 rounded-md bg-muted/50">
                <p className="text-sm font-medium">Import Result:</p>
                <p className="text-sm text-muted-foreground">
                  Skill: {expLogResult.skillName}
                </p>
                <p className={`text-sm ${expLogResult.result.success ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {expLogResult.result.success ? 'Success' : 'Failed'}
                  {expLogResult.result.error && ` - ${expLogResult.result.error}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Number Sequences - HIGH PRIORITY */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⭐ PRIORYTET WYSOKI: Ciągi liczbowe
            </CardTitle>
            <CardDescription>
              Import "Ciągi liczbowe" skill for class 2 (algebra) - HIGH PRIORITY
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleSequencesImport}
              disabled={importingSequences}
              className="w-full"
              variant="default"
            >
              {importingSequences && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import Number Sequences (PRIORYTET WYSOKI)
            </Button>
            
            {sequencesResult && (
              <div className="mt-4 p-3 rounded-md bg-muted/50">
                <p className="text-sm font-medium">Import Result:</p>
                <p className="text-sm text-muted-foreground">
                  Skill: {sequencesResult.skillName}
                </p>
                <p className={`text-sm ${sequencesResult.result.success ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {sequencesResult.result.success ? 'Success' : 'Failed'}
                  {sequencesResult.result.error && ` - ${sequencesResult.result.error}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trigonometric Functions - HIGH PRIORITY */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⭐ PRIORYTET WYSOKI: Funkcje trygonometryczne
            </CardTitle>
            <CardDescription>
              Import "Funkcje trygonometryczne" skill for class 2 (funkcje elementarne) - HIGH PRIORITY
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleTrigonometricImport}
              disabled={importingTrigonometric}
              className="w-full"
              variant="default"
            >
              {importingTrigonometric && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import Trigonometric Functions (PRIORYTET WYSOKI)
            </Button>
            
            {trigonometricResult && (
              <div className="mt-4 p-3 rounded-md bg-muted/50">
                <p className="text-sm font-medium">Import Result:</p>
                <p className="text-sm text-muted-foreground">
                  Skill: {trigonometricResult.skillName}
                </p>
                <p className={`text-sm ${trigonometricResult.result.success ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {trigonometricResult.result.success ? 'Success' : 'Failed'}
                  {trigonometricResult.result.error && ` - ${trigonometricResult.result.error}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Limits Functions - HIGH PRIORITY */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⭐ PRIORYTET WYSOKI: Granice funkcji
            </CardTitle>
            <CardDescription>
              Import "Granice funkcji" skill for class 3 (analiza matematyczna) - HIGH PRIORITY
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleLimitsImport}
              disabled={importingLimits}
              className="w-full"
              variant="default"
            >
              {importingLimits && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import Limits Functions (PRIORYTET WYSOKI)
            </Button>
            
            {limitsResult && (
              <div className="mt-4 p-3 rounded-md bg-muted/50">
                <p className="text-sm font-medium">Import Result:</p>
                <p className="text-sm text-muted-foreground">
                  Skill: {limitsResult.skillName}
                </p>
                <p className={`text-sm ${limitsResult.result.success ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {limitsResult.result.success ? 'Success' : 'Failed'}
                  {limitsResult.result.error && ` - ${limitsResult.result.error}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Derivative Function - HIGH PRIORITY */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⭐ PRIORYTET WYSOKI: Pochodna funkcji
            </CardTitle>
            <CardDescription>
              Import "Pochodna funkcji" skill for class 3 (analiza matematyczna) - HIGH PRIORITY
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleDerivativeImport}
              disabled={importingDerivative}
              className="w-full"
              variant="default"
            >
              {importingDerivative && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import Derivative Function (PRIORYTET WYSOKI)
            </Button>
            
            {derivativeResult && (
              <div className="mt-4 p-3 rounded-md bg-muted/50">
                <p className="text-sm font-medium">Import Result:</p>
                <p className="text-sm text-muted-foreground">
                  Skill: {derivativeResult.skillName}
                </p>
                <p className={`text-sm ${derivativeResult.result.success ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {derivativeResult.result.success ? 'Success' : 'Failed'}
                  {derivativeResult.result.error && ` - ${derivativeResult.result.error}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Polynomial Equations - HIGH PRIORITY */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⭐ PRIORYTET WYSOKI: Równania i nierówności wielomianowe
            </CardTitle>
            <CardDescription>
              Import "Równania i nierówności wielomianowe" skill for class 2 (algebra) - HIGH PRIORITY
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handlePolynomialImport}
              disabled={importingPolynomial}
              className="w-full"
              variant="default"
            >
              {importingPolynomial && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import Polynomial Equations (PRIORYTET WYSOKI)
            </Button>
            
            {polynomialResult && (
              <div className="mt-4 p-3 rounded-md bg-muted/50">
                <p className="text-sm font-medium">Import Result:</p>
                <p className="text-sm text-muted-foreground">
                  Skill: {polynomialResult.skillName}
                </p>
                <p className={`text-sm ${polynomialResult.result.success ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {polynomialResult.result.success ? 'Success' : 'Failed'}
                  {polynomialResult.result.error && ` - ${polynomialResult.result.error}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plane Geometry - HIGH PRIORITY */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⭐ PRIORYTET WYSOKI: Planimetria – wielokąty i okręgi
            </CardTitle>
            <CardDescription>
              Import "Planimetria – wielokąty i okręgi" skill for class 2 (geometria) - HIGH PRIORITY
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handlePlaneGeometryImport}
              disabled={importingPlaneGeometry}
              className="w-full"
              variant="default"
            >
              {importingPlaneGeometry && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import Planimetria – wielokąty i okręgi (PRIORYTET WYSOKI)
            </Button>
            
            {planeGeometryResult && (
              <div className="mt-4 p-3 rounded-md bg-muted/50">
                <p className="text-sm font-medium">Import Result:</p>
                <p className="text-sm text-muted-foreground">
                  Skill: {planeGeometryResult.skillName}
                </p>
                <p className={`text-sm ${planeGeometryResult.result.success ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {planeGeometryResult.result.success ? 'Success' : 'Failed'}
                  {planeGeometryResult.result.error && ` - ${planeGeometryResult.result.error}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Solid Geometry - HIGH PRIORITY */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⭐ PRIORYTET WYSOKI: Stereometria – bryły
            </CardTitle>
            <CardDescription>
              Import "Stereometria – bryły" skill for class 3 (geometria) - HIGH PRIORITY
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleSolidGeometryImport}
              disabled={importingSolidGeometry}
              className="w-full"
              variant="default"
            >
              {importingSolidGeometry && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import Stereometria – bryły (PRIORYTET WYSOKI)
            </Button>
            
            {solidGeometryResult && (
              <div className="mt-4 p-3 rounded-md bg-muted/50">
                <p className="text-sm font-medium">Import Result:</p>
                <p className="text-sm text-muted-foreground">
                  Skill: {solidGeometryResult.skillName}
                </p>
                <p className={`text-sm ${solidGeometryResult.result.success ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {solidGeometryResult.result.success ? 'Success' : 'Failed'}
                  {solidGeometryResult.result.error && ` - ${solidGeometryResult.result.error}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kombinatoryka i prawdopodobieństwo */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Kombinatoryka i prawdopodobieństwo
            </CardTitle>
            <CardDescription>
              Import "Kombinatoryka i prawdopodobieństwo" skill for class 3 (statystyka_prawdopodobienstwo) - HIGH PRIORITY
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleCombinatoricsProbabilityImport}
              disabled={importingCombinatoricsProbability}
              className="w-full"
              variant="default"
            >
              {importingCombinatoricsProbability && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import Kombinatoryka i prawdopodobieństwo (PRIORYTET WYSOKI)
            </Button>
            
            {combinatoricsProbabilityResult && (
              <div className="mt-4 p-3 rounded-md bg-muted/50">
                <p className="text-sm font-medium">Import Result:</p>
                <p className="text-sm text-muted-foreground">
                  Skill: {combinatoricsProbabilityResult.skillName}
                </p>
                <p className={`text-sm ${combinatoricsProbabilityResult.result.success ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {combinatoricsProbabilityResult.result.success ? 'Success' : 'Failed'}
                  {combinatoricsProbabilityResult.result.error && ` - ${combinatoricsProbabilityResult.result.error}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };