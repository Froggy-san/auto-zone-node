import {
  deleteCarAction,
  revalidateCarPath,
  revlidateCars,
} from "@lib/actions/carsAction";
import { Car, CarImage, ImgData } from "@lib/types";
import { createClient } from "@utils/supabase/client";
import {
  deleteImageFromBucket,
  deleteMultipleImageFromTable,
  uploadImageToBucket,
} from "./helper-services";

const supabase = createClient();

interface CarCreatedProps {
  color: string;
  plateNumber: string;
  chassisNumber: string;
  motorNumber: string;
  notes: string;
  clientId: number;
  carGenerationId: number;
}

export async function createCar({
  car,
  images,
}: {
  car: CarCreatedProps;
  images: ImgData[];
}) {
  // Create car.
  const { data, error } = await supabase.from("cars").insert([car]).select();

  if (error) {
    console.log(error.message);
    throw new Error(error.message);
  }

  const createdCar = data[0];

  if (!images.length) {
    await revlidateCars(car.clientId);
    return data;
  }

  const imagesForTable = images.map((obj) => {
    return { carId: createdCar.id, imagePath: obj.path, isMain: obj.isMain };
  });

  const { error: imagesError } = await supabase
    .from("carImages")
    .insert(imagesForTable);

  if (imagesError) {
    const imagesToDelete = imagesForTable.map((image) => image.imagePath);
    await deleteCarAction(car.clientId, createdCar.id, imagesToDelete);
    throw new Error(`Failed to create images: ${imagesError.message}`);
  }
  await uploadImageToBucket({ bucketName: "carImages", images });

  await revlidateCars(car.clientId);
}

interface EditProps {
  car: Car;
  id: string;
  imagesToUpload: ImgData[];
  imagesToDelete: CarImage[];
  isEqual: boolean;
}

export async function editCar({
  car,
  id,
  imagesToUpload,
  imagesToDelete,
  isEqual,
}: EditProps) {
  // 1. If the user didn't change anything about the car's data then don't run the update car code.

  console.log("isEqual:", isEqual);
  if (!isEqual) {
    const { error } = await supabase.from("cars").update(car).eq("id", id);

    if (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  // 2. Upload new images.
  if (imagesToUpload.length) {
    // 1. Upload the images paths to the "carImages" table.
    const imagesForTable = imagesToUpload.map((obj) => {
      return { carId: id, imagePath: obj.path, isMain: obj.isMain };
    });

    const { error: imagesError } = await supabase
      .from("carImages")
      .insert(imagesForTable);

    if (imagesError) {
      console.log(`Failed to create images: ${imagesError.message}`);
      throw new Error(`Failed to create images: ${imagesError.message}`);
    }

    // 2. Upload the image files to the "carImages" bucket.
    await uploadImageToBucket({
      bucketName: "carImages",
      images: imagesToUpload,
    });
  }

  // 3. Delete any images removed by the user from the 'carImages' table & bucket

  if (imagesToDelete.length) {
    const ids: number[] = [];
    const imagePaths: string[] = [];
    imagesToDelete.forEach((image) => {
      ids.push(image.id);
      imagePaths.push(image.imagePath);
    });

    // 1. Delete image paths from the 'carImages' table.
    const { error: imageTableError } = await deleteMultipleImageFromTable(
      "carImages",
      ids
    );

    if (imageTableError) {
      console.log(
        `Failed to delete car image paths from the table: ${imageTableError.message}`
      );
      throw new Error(imageTableError.message);
    }

    // 2. Delete image files from the 'carImages' bucket.
    const { error } = await deleteImageFromBucket({
      bucketName: "carImages",
      imagePaths,
    });
    if (error) {
      console.log(
        `Failed to delete car image files from the bucket: ${error.message}`
      );

      throw new Error(error.message);
    }
  }
  // await revlidateCars(car.clientId);
  await revalidateCarPath(car.clientId);
}
