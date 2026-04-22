import { FileWithPreview } from "@lib/types";
import { createClient } from "@utils/supabase/client";

type ImgData = {
  path: string;
  name: string;
  isMain: boolean;
  file: FileWithPreview | File;
};
interface UploadImageToBucket {
  bucketName: string;
  images: ImgData[];
}

export async function uploadImageToBucket({
  bucketName,
  images,
}: UploadImageToBucket) {
  const supabase = createClient();

  const uploadPromises = images.map(async (img) => {
    const { error } = await supabase.storage
      .from(`${bucketName}`)
      .upload(img.name, img.file);

    if (error) {
      console.log("ERROR:", error.message);
      throw new Error(error.message);
    }
  });

  await Promise.all(uploadPromises);
}

export async function deleteMultipleImageFromTable(
  tableName: string,
  imageIds: number[]
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .in("id", imageIds);
  // 'ids' should be an array of IDs you want to delete

  if (error) {
    console.error("Error deleting products:", error);
  } else {
    console.log("Deleted products:", data);
  }
  return { data, error };
}

interface UploadsingleImageToBucket {
  bucketName: string;
  image: {
    name: string;
    file: File | FileWithPreview;
  };
}
export async function uploadSingleImgToBucket({
  bucketName,
  image,
}: UploadsingleImageToBucket) {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(`${bucketName}`)
    .upload(image.name, image.file);

  if (error) {
    console.log("ERROR:", error.message);
    return { data, error };
  }

  return { data, error };
}

export async function deleteImageFromBucket({
  bucketName,
  imagePaths,
}: {
  bucketName: string;
  imagePaths: string[];
}): Promise<{ success: boolean; error?: any }> {
  // Input validation
  if (!bucketName || !imagePaths || imagePaths.length === 0) {
    console.error("Invalid input: bucketName and imagePaths are required.");
    return { success: false, error: "Invalid input" };
  }

  const supabase = createClient();

  try {
    const imagesToDelete = imagePaths.map(
      (path) => path.split(`/${bucketName}/`)[1]
    );

    const { error } = await supabase.storage
      .from(bucketName)
      .remove(imagesToDelete);

    if (error) {
      console.error("Error deleting images:", error);
      return { success: false, error };
    }

    console.log("Images deleted successfully:", imagePaths);
    return { success: true };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: err };
  }
}

function geoError(error: GeolocationPositionError) {
  console.log(`Failed to get user's position: ${error.message}`);
}

export function getUserLocation() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json&apiKey=5bc31636d79f4d8e91fae8f1b1b53e12`
      )
        .then((res) => res.json())
        .then((data) => {
          console.log(data, "DD");

          // const country = data.features[0].properties.country;
          // console.log(country, "SSSSSSSSSSSSSSSSSSSSSSSSSSSSS"); // e.g., "Germany"
        });
    }, geoError);
  } else {
  }
}

// Server helpers
