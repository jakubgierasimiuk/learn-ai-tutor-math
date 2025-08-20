import { importAllContentPackages } from '../utils/importContentDatabase';

// Simple script to import all content packages
export const executeImport = async () => {
  console.log('Starting content import...');
  
  try {
    const result = await importAllContentPackages();
    
    if (result.success) {
      console.log(`✅ Import successful! Imported ${result.importedCount}/${result.totalSkills} skills`);
    } else {
      console.error('❌ Import failed with errors:', result.errors);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Import execution error:', error);
    return { success: false, errors: ['Import execution failed'] };
  }
};

// Execute immediately if this file is imported
executeImport();