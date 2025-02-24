import supabase from '@lib/supabase';

export const areConsecutiveDays = (date1: string | Date, date2: string | Date) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

export const updateStreaks = async (userId: string) => {
  try {
    const { data: uploads, error: uploadsError } = await supabase
      .from('prompt_uploads')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (uploadsError) throw uploadsError;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('current_streak, longest_streak')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    if (!uploads || uploads.length === 0) {
      await supabase.from('profiles').update({ current_streak: 0 }).eq('id', userId);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastUploadDate = new Date(uploads[0].created_at);
    lastUploadDate.setHours(0, 0, 0, 0);

    let currentStreak = 1;
    if (!areConsecutiveDays(today, lastUploadDate)) currentStreak = 1;

    for (let i = 0; i < uploads.length - 1; i++) {
      if (areConsecutiveDays(uploads[i].created_at, uploads[i + 1].created_at)) {
        currentStreak++;
      } else {
        break;
      }
    }

    await supabase
      .from('profiles')
      .update({
        current_streak: currentStreak,
        longest_streak: Math.max(currentStreak, profile.longest_streak || 0),
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Error updating streaks:', error);
  }
};
