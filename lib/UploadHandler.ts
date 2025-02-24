import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import supabase from '@lib/supabase';
import { updateStreaks } from './StreakHandler';

export const uploadImage = async (selectedImage, promptId, timeTaken, rating, thoughts, router) => {
  if (!selectedImage) {
    console.log('No image selected.');
    return;
  }

  try {
    const { data: user, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    const userId = user?.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const file = await FileSystem.readAsStringAsync(selectedImage, { encoding: FileSystem.EncodingType.Base64 });
    const fileName = `${userId}/${Date.now()}.jpg`;

    await supabase.storage.from('files').upload(fileName, decode(file), { contentType: 'image/jpeg' });

    console.log('Image uploaded:', fileName);

    const reviewData = {
      timeTaken: getTimeLabel(timeTaken),
      rating,
      thoughts: thoughts.current,
    };

    await supabase.from('prompt_uploads').update({
      image_url: fileName,
      review: reviewData,
      status: 'completed',
    }).eq('id', promptId);

    await updateStreaks(userId);
    router.push('/auth/gallery');
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};

const getTimeLabel = (value) => {
  if (value < 1) return 'Less than 10 minutes';
  if (value < 2) return 'Less than an hour';
  return 'More than an hour';
};
