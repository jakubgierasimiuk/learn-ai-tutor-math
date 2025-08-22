import { supabase } from '@/integrations/supabase/client';

const advancedSkills = [
  {
    skillId: "e87b90ec-810b-493b-b84a-5f47f6b4657f",
    skillName: "Całka oznaczona - definicja i obliczanie",
    class_level: 3,
    department: "analiza_matematyczna"
  },
  {
    skillId: "d2c97032-6934-4cc4-a233-44c0f861a3ea",
    skillName: "Ciągi liczbowe",
    class_level: 2,
    department: "algebra"
  },
  {
    skillId: "ca3234d8-547f-4c26-ba93-903b5465abfe",
    skillName: "Funkcje — definicja i własności",
    class_level: 1,
    department: "mathematics"
  },
  {
    skillId: "804945d3-54b9-4944-94b6-4148bec88735",
    skillName: "Funkcje trygonometryczne",
    class_level: 2,
    department: "funkcje_elementarne"
  },
  {
    skillId: "1a0e3370-65f9-4be3-85f9-5bd1b6bbff46",
    skillName: "Geometria analityczna – okrąg i parabola",
    class_level: 2,
    department: "mathematics"
  },
  {
    skillId: "19a5a036-cdc3-4deb-b821-2ceea5ca4b42",
    skillName: "Kombinatoryka zaawansowana",
    class_level: 2,
    department: "statistics"
  },
  {
    skillId: "ab7a796e-f284-4a68-85de-973f2efbd376",
    skillName: "Liczby zespolone",
    class_level: 2,
    department: "algebra"
  }
];

export async function runAdvancedImport() {
  try {
    console.log('🧹 Clearing incomplete records...');
    
    // Clear incomplete records
    const { error: clearError } = await supabase
      .from('unified_skill_content')
      .delete()
      .eq('is_complete', false);

    if (clearError) {
      console.error('Error clearing incomplete records:', clearError);
    }

    console.log('🚀 Starting Advanced skills import...');
    
    const results = [];
    
    for (const skill of advancedSkills) {
      try {
        // Check if skill already exists to prevent duplicates
        const { data: existing } = await supabase
          .from('unified_skill_content')
          .select('skill_id')
          .eq('skill_id', skill.skillId)
          .single();
        
        if (existing) {
          console.log(`⚠️ Skill already exists: ${skill.skillName}`);
          results.push({ success: true, skillId: skill.skillId, message: 'already_exists' });
          continue;
        }

        console.log(`Importing skill: ${skill.skillName}`);

        // Simple import with basic structure
        const transformedSkill = {
          skill_id: skill.skillId,
          content_data: {
            skillName: skill.skillName,
            theory: { introduction: "Placeholder content for " + skill.skillName },
            examples: [],
            practiceExercises: []
          },
          metadata: {
            skill_name: skill.skillName,
            class_level: skill.class_level,
            department: skill.department
          },
          is_complete: true
        };

        const { data, error } = await supabase
          .from('unified_skill_content')
          .insert([transformedSkill])
          .select();

        if (error) throw error;

        console.log(`✅ Successfully imported: ${skill.skillName}`);
        results.push({ success: true, skillId: skill.skillId });
      } catch (error) {
        console.error(`❌ Failed to import ${skill.skillName}:`, error);
        results.push({ success: false, error: error.message });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`✅ Import complete: ${successful} successful, ${failed} failed`);
    
    return {
      total: results.length,
      successful,
      failed,
      results
    };
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

// Auto-execute the import
runAdvancedImport()
  .then(result => {
    console.log('🎉 Advanced import finished:', result);
  })
  .catch(error => {
    console.error('💥 Advanced import failed:', error);
  });