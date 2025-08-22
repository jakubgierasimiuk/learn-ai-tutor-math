import { supabase } from '@/integrations/supabase/client';

const calculus2Skills = [
  {
    skillId: "a4017cd1-c5be-4412-981f-e2419a001290",
    skillName: "Granica funkcji",
    class_level: 2,
    department: "calculus"
  },
  {
    skillId: "3e374051-7e99-46c0-9f33-75bab9d22a00", 
    skillName: "Funkcja wykładnicza i logarytmiczna",
    class_level: 2,
    department: "mathematics"
  },
  {
    skillId: "5cdf12f1-c126-464d-b24c-f2f27936f1d8",
    skillName: "Ciągi arytmetyczne", 
    class_level: 2,
    department: "sequences"
  },
  {
    skillId: "dab95c2c-5aa5-40a2-981a-9abfac85b53a",
    skillName: "Ciągi arytmetyczne i geometryczne",
    class_level: 1,
    department: "mathematics"
  },
  {
    skillId: "99150efa-9f02-4a42-b979-bf20a69c0a8b",
    skillName: "Równania i nierówności kwadratowe",
    class_level: 1,
    department: "mathematics"
  },
  {
    skillId: "5ce227d9-ed62-4ad1-883e-4239ba64764e",
    skillName: "Liczby rzeczywiste",
    class_level: 1,
    department: "real_numbers"
  }
];

export async function runCalculus2Import() {
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

    console.log('🚀 Starting Calculus2 import...');
    
    const results = [];
    
    for (const skill of calculus2Skills) {
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
runCalculus2Import()
  .then(result => {
    console.log('🎉 Calculus2 import finished:', result);
  })
  .catch(error => {
    console.error('💥 Calculus2 import failed:', error);
  });