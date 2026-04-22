"use server";

import { createClient } from "@utils/supabase/server";

export async function deleteImageFromBucketSr({
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

  const supabase = await createClient();

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

export async function deleteImageFromBucketAction({
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

  const supabase = await createClient();

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
