import { useState, useEffect } from 'react';
import { importAllContentPackages } from '../utils/importContentDatabase';
import { useToast } from './use-toast';

interface ImportResult {
  success: boolean;
  importedCount?: number;
  totalSkills?: number;
  errors?: string[];
}

export const useAutoImport = (shouldExecute: boolean = false) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const executeImport = async () => {
    setIsImporting(true);
    setImportResult(null);
    
    try {
      console.log('🚀 Starting import of 8 advanced skills...');
      const result = await importAllContentPackages();
      setImportResult(result);
      
      if (result.success) {
        console.log(`✅ Import successful! Imported ${result.importedCount}/${result.totalSkills} skills`);
        toast({
          title: 'Import Successful',
          description: `Successfully imported ${result.importedCount} of ${result.totalSkills} advanced skills`,
        });
      } else {
        console.error('❌ Import failed with errors:', result.errors);
        toast({
          title: 'Import Failed',
          description: `Import completed with errors. Imported ${result.importedCount || 0} skills.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Import execution error:', error);
      toast({
        title: 'Import Error',
        description: 'An unexpected error occurred during import',
        variant: 'destructive',
      });
      setImportResult({ success: false, errors: ['Import execution failed'] });
    } finally {
      setIsImporting(false);
    }
  };

  useEffect(() => {
    if (shouldExecute) {
      executeImport();
    }
  }, [shouldExecute]);

  return {
    isImporting,
    importResult,
    executeImport
  };
};