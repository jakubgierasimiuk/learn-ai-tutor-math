import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, Upload, Download, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContentDatabase {
  skillId: string;
  skillName: string;
  class_level: number;
  department: string;
  generatorParams: {
    microSkill: string;
    difficultyRange: [number, number];
    fallbackTrigger: string;
  };
  teachingFlow: {
    phase1: { name: string; duration: number; activities: string[] };
    phase2: { name: string; duration: number; activities: string[] };
    phase3: { name: string; duration: number; activities: string[] };
  };
  content: any;
  pedagogicalNotes: any;
  misconceptionPatterns: any[];
  realWorldApplications: any[];
  assessmentRubric: any;
}

export default function ContentManager() {
  const [contentDatabase, setContentDatabase] = useState<ContentDatabase[]>([]);
  const [jsonInput, setJsonInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const { toast } = useToast();

  const validateContentStructure = (content: any): string[] => {
    const errors: string[] = [];
    
    if (!Array.isArray(content.contentDatabase)) {
      errors.push('contentDatabase must be an array');
      return errors;
    }

    content.contentDatabase.forEach((skill: any, index: number) => {
      const prefix = `Skill ${index + 1}`;
      
      // Required fields
      if (!skill.skillId) errors.push(`${prefix}: Missing skillId`);
      if (!skill.skillName) errors.push(`${prefix}: Missing skillName`);
      if (!skill.class_level || skill.class_level < 4 || skill.class_level > 8) {
        errors.push(`${prefix}: class_level must be 4-8`);
      }
      
      // Generator params validation
      if (skill.generatorParams?.microSkill) {
        const validMicroSkills = [
          'linear_equations', 'quadratic_equations', 'factoring', 'area_perimeter',
          'angles', 'transformations', 'basic_operations', 'fractions', 'decimals',
          'linear_functions', 'graphing', 'domain_range', 'arithmetic', 'geometric',
          'patterns', 'basic_ratios', 'unit_circle', 'identities', 'derivatives',
          'integrals', 'applications', 'probability', 'descriptive', 'combinatorics',
          'default'
        ];
        
        if (!validMicroSkills.includes(skill.generatorParams.microSkill)) {
          errors.push(`${prefix}: Invalid microSkill "${skill.generatorParams.microSkill}"`);
        }
      }
      
      // LaTeX validation (basic check for inline format)
      const checkLatex = (text: string, field: string) => {
        if (text && text.includes('$$')) {
          errors.push(`${prefix}: ${field} contains display LaTeX ($$), use inline ($) only`);
        }
        if (text && text.match(/\$[^$]{51,}\$/)) {
          errors.push(`${prefix}: ${field} contains LaTeX expression > 50 chars`);
        }
      };
      
      if (skill.content?.theory?.introduction) {
        checkLatex(skill.content.theory.introduction, 'theory.introduction');
      }
    });
    
    return errors;
  };

  const handleImportJson = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const errors = validateContentStructure(parsed);
      
      if (errors.length > 0) {
        setValidationErrors(errors);
        toast({
          title: 'Validation Failed',
          description: `Found ${errors.length} validation errors`,
          variant: 'destructive',
        });
        return;
      }
      
      setValidationErrors([]);
      
      // Import to database
      for (const skill of parsed.contentDatabase) {
        const { error } = await supabase
          .from('lessons')
          .upsert({
            topic_id: skill.skillId,
            title: skill.skillName,
            content_data: skill.content,
            generator_params: skill.generatorParams,
            teaching_flow: skill.teachingFlow,
            misconception_patterns: skill.misconceptionPatterns,
            real_world_applications: skill.realWorldApplications,
            assessment_rubric: skill.assessmentRubric,
            difficulty_level: skill.class_level,
            is_active: true
          });
          
        if (error) {
          console.error('Import error:', error);
          toast({
            title: 'Import Error',
            description: `Failed to import skill: ${skill.skillName}`,
            variant: 'destructive',
          });
          return;
        }
      }
      
      setContentDatabase(parsed.contentDatabase);
      toast({
        title: 'Import Successful',
        description: `Imported ${parsed.contentDatabase.length} skills`,
      });
      
    } catch (error) {
      toast({
        title: 'JSON Parse Error',
        description: 'Invalid JSON format',
        variant: 'destructive',
      });
    }
  };

  const handleExportJson = () => {
    const exportData = { contentDatabase };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'content-database.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredContent = contentDatabase.filter(skill => {
    const matchesSearch = skill.skillName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade ? skill.class_level === selectedGrade : true;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Database Manager</h1>
          <p className="text-muted-foreground">Import, validate, and manage educational content</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportJson} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import">Import Content</TabsTrigger>
          <TabsTrigger value="browse">Browse Content</TabsTrigger>
          <TabsTrigger value="validation">Validation Report</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import JSON Content Database</CardTitle>
              <CardDescription>
                Paste the complete JSON output from ChatGPT content generator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste JSON content here..."
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              <Button onClick={handleImportJson} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Import & Validate
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {[4, 5, 6, 7, 8].map(grade => (
                <Button
                  key={grade}
                  variant={selectedGrade === grade ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGrade(selectedGrade === grade ? null : grade)}
                >
                  Grade {grade}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {filteredContent.map((skill, index) => (
              <Card key={skill.skillId} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{skill.skillName}</h3>
                      <Badge variant="secondary">Grade {skill.class_level}</Badge>
                      <Badge variant="outline">{skill.department}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      MicroSkill: {skill.generatorParams?.microSkill || 'N/A'}
                    </p>
                    <div className="flex gap-1">
                      {skill.teachingFlow && Object.keys(skill.teachingFlow).map(phase => (
                        <Badge key={phase} variant="outline" className="text-xs">
                          {phase}: {skill.teachingFlow[phase]?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>Content sections: {Object.keys(skill.content || {}).length}</div>
                    <div>Misconceptions: {skill.misconceptionPatterns?.length || 0}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Validation Report</CardTitle>
              <CardDescription>
                Review validation errors and content quality issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              {validationErrors.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>No validation errors found</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {validationErrors.map((error, index) => (
                    <div key={index} className="flex items-start gap-2 text-red-600">
                      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}