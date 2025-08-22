import React from 'react';
import { BatchImportRunner } from '@/components/BatchImportRunner';
import { Seo } from '@/components/Seo';

const BatchImportPage = () => {
  return (
    <>
      <Seo 
        title="Batch Import - System Uzupełniania Umiejętności"
        description="System importu treści edukacyjnych z ChatGPT dla uzupełnienia brakujących umiejętności w bazie danych."
      />
      <div className="min-h-screen bg-background">
        <BatchImportRunner />
      </div>
    </>
  );
};

export default BatchImportPage;