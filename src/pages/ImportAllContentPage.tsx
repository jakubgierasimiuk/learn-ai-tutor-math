import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { importAllContentPackages } from '@/utils/importContentDatabase';

export default function ImportAllContentPage() {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // SEO basics
    document.title = "Import All Content – AI Tutor";
    const desc = "Import all content packages into the AI Tutor database.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.origin + '/import-all-content');
  }, []);

  const handleImportAll = async () => {
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const result = await importAllContentPackages();
      setImportResult(result);
      
      if (result.success) {
        toast({
          title: 'Import Successful',
          description: `Successfully imported ${result.importedCount} of ${result.totalSkills} skills`,
        });
      } else {
        toast({
          title: 'Import Failed',
          description: `Import completed with errors. Check details below.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import Error',
        description: 'An unexpected error occurred during import',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Import All Content Packages</h1>
        <p className="text-muted-foreground mt-2">
          Import all predefined content packages including limits, combinatorics, complex numbers, derivatives, integrals, stereometry, probability distributions, and differential equations.
        </p>
      </header>

      <main className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Packages Summary</CardTitle>
            <CardDescription>
              8 skills across different mathematics domains (class levels 2-3)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Granica funkcji</span>
                <div className="flex gap-2">
                  <Badge variant="secondary">Class 2</Badge>
                  <Badge variant="outline">Calculus</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Kombinatoryka zaawansowana</span>
                <div className="flex gap-2">
                  <Badge variant="secondary">Class 2</Badge>
                  <Badge variant="outline">Statistics</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Liczby zespolone</span>
                <div className="flex gap-2">
                  <Badge variant="secondary">Class 2</Badge>
                  <Badge variant="outline">Algebra</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Pochodna funkcji</span>
                <div className="flex gap-2">
                  <Badge variant="secondary">Class 3</Badge>
                  <Badge variant="outline">Calculus</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Całka nieoznaczona</span>
                <div className="flex gap-2">
                  <Badge variant="secondary">Class 3</Badge>
                  <Badge variant="outline">Calculus</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Stereometria</span>
                <div className="flex gap-2">
                  <Badge variant="secondary">Class 3</Badge>
                  <Badge variant="outline">Geometry</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Rozkłady prawdopodobieństwa</span>
                <div className="flex gap-2">
                  <Badge variant="secondary">Class 3</Badge>
                  <Badge variant="outline">Statistics</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Równania różniczkowe</span>
                <div className="flex gap-2">
                  <Badge variant="secondary">Class 3</Badge>
                  <Badge variant="outline">Calculus</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Action</CardTitle>
            <CardDescription>
              Click to import all content packages into the database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleImportAll} 
              disabled={isImporting}
              className="w-full"
              size="lg"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import All Content Packages
                </>
              )}
            </Button>
            
            {importResult && (
              <div className="mt-4 space-y-3">
                {importResult.success ? (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">
                      Successfully imported {importResult.importedCount} of {importResult.totalSkills} skills
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">
                        Import completed with {importResult.errors?.length || 0} errors
                      </span>
                    </div>
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="space-y-1">
                        {importResult.errors.map((error: string, index: number) => (
                          <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {error}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}