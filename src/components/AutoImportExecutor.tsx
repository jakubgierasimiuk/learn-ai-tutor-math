import React, { useEffect } from 'react';
import { useAutoImport } from '../hooks/useAutoImport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export const AutoImportExecutor: React.FC = () => {
  const { isImporting, importResult, executeImport } = useAutoImport();

  // Auto-execute on mount
  useEffect(() => {
    executeImport();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isImporting && <Loader2 className="h-5 w-5 animate-spin" />}
          {importResult?.success && <CheckCircle className="h-5 w-5 text-green-500" />}
          {importResult && !importResult.success && <XCircle className="h-5 w-5 text-red-500" />}
          Import 8 Advanced Skills
        </CardTitle>
        <CardDescription>
          Importing advanced learning content into the database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isImporting && (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Importing skills to database...</p>
          </div>
        )}
        
        {importResult && (
          <div className="space-y-2">
            {importResult.success ? (
              <div className="text-green-600">
                <p className="font-medium">✅ Import Successful!</p>
                <p className="text-sm">
                  Imported {importResult.importedCount} of {importResult.totalSkills} advanced skills
                </p>
              </div>
            ) : (
              <div className="text-red-600">
                <p className="font-medium">❌ Import Failed</p>
                <p className="text-sm">
                  Imported {importResult.importedCount || 0} skills with errors
                </p>
                {importResult.errors && (
                  <ul className="text-xs mt-2 space-y-1">
                    {importResult.errors.map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            onClick={executeImport} 
            disabled={isImporting}
            variant="outline"
          >
            {isImporting ? 'Importing...' : 'Retry Import'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};