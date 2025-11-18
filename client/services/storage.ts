import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

export const uploadTripImage = async (tripId: string, uri: string) => {
  const storage = getStorage();
  const response = await fetch(uri);
  const blob = await response.blob();
  
  const imageRef = ref(storage, `trips/${tripId}/${Date.now()}.jpg`);
  await uploadBytes(imageRef, blob);
  
  const downloadURL = await getDownloadURL(imageRef);
  return downloadURL;
};

export const pickAndUploadImage = async (tripId: string) => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
  });
  
  if (!result.canceled) {
    return await uploadTripImage(tripId, result.assets[0].uri);
  }
};