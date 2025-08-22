// Quick manual trigger for the fixed import
import('./fixedImportRunner').then(module => {
  console.log('Manual import trigger executed');
}).catch(err => {
  console.error('Import failed:', err);
});