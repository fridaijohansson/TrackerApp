import supabase from '@lib/supabase';

export const handleSubmitSurvey = async (answers, router) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) return;

  const preferences = {
    id: user.id,
    artist_profile: answers['Artist Profile'] || {},
    skill_assessment: answers['Skill Assessment'] || {},
    prompt_setup: answers['Prompt Setup'] || {}
  };

  const { error } = await supabase.from('user_preferences').upsert(preferences);
  if (error) {
    console.error('Error saving survey preferences:', error);
    return;
  }

  await supabase.from('profiles').update({ hasCompletedSurvey: true }).eq('id', user.id);
  router.replace('/auth/gallery');
};
