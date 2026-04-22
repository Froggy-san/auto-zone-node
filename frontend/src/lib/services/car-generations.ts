import { PILL_SIZE, SUPABASE_URL } from "@lib/constants";
import { CarGeneration } from "@lib/types";
import { createClient } from "@utils/supabase/client";
import {
  deleteImageFromBucket,
  uploadImageToBucket,
  uploadSingleImgToBucket,
} from "./helper-services";
import { revalidateMakers } from "@lib/actions/carMakerActions";
import {
  revalidateProductById,
  revalidateProducts,
} from "@lib/actions/productsActions";

const supabase = createClient();
export async function getCarGenerations(page: number) {
  const from = (page - 1) * PILL_SIZE;
  const to = from + PILL_SIZE - 1;
  const {
    data: carGenerations,
    count,
    error,
  } = await supabase
    .from("carGenerations")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { carGenerations, count };
}

export async function createCarGeneration({
  name,
  carModelId,
  notes,
  image,
}: CarGeneration) {
  //https://umkyoinqpknmedkowqva.supabase.co/storage/v1/object/public/generations/GyY4WwGWMAEq9nH.jpeg

  let path: string | null = null;
  // 1. Upload image.
  if (image.length) {
    const file = image[0];
    if (file instanceof File) {
      const name = `${Math.random()}-${file.name}`.replace(/\//g, "");
      path = `${SUPABASE_URL}/storage/v1/object/public/generations/${name}`;
      const { error } = await uploadSingleImgToBucket({
        bucketName: "generations",
        image: { name, file },
      });
      if (error) throw new Error(error.message);
    }

    if (typeof file === "string") {
      path = file;
    }
  }

  // 2. Upload generation data
  const { error } = await supabase
    .from("carGenerations")
    .insert([{ name, notes, carModelId, image: path }]);
  if (error) throw new Error(error.message);
  await revalidateMakers();
}

export async function editCarGeneration({
  generation: { name, carModelId, notes, image },
  imageToDelete,
  id,
}: {
  generation: CarGeneration;
  imageToDelete?: string;
  id: number;
}) {
  let path: string | null = null;
  if (image.length) {
    const file = image[0];
    if (file instanceof File) {
      const name = `${Math.random()}-${file.name}`.replace(/\//g, "");
      path = `${SUPABASE_URL}/storage/v1/object/public/generations/${name}`;
      const { error } = await uploadSingleImgToBucket({
        bucketName: "generations",
        image: { name, file },
      });
      if (error) throw new Error(error.message);
    }

    if (typeof file === "string") {
      path = file;
    }

    // Delete the existing image.
    if (imageToDelete && imageToDelete.split("/storage/")[0] === SUPABASE_URL) {
      console.log("STARTED>>>");
      const { error } = await deleteImageFromBucket({
        bucketName: "generations",
        imagePaths: [imageToDelete],
      });

      if (error)
        console.error(`Failed to delete existing image: ${error.message}`);
    }
  }

  const insert: {
    name: string;
    notes: string;
    carModelId: number;
    image?: string;
  } = { name, notes, carModelId };
  if (path) insert.image = path;
  const { error } = await supabase
    .from("carGenerations")
    .update(insert)
    .eq("id", id);

  if (error) throw new Error(error.message);
  await revalidateMakers();
}

export async function deleteCarGenerations({
  id,
  imageToDelete,
}: {
  id: number;
  imageToDelete?: string;
}) {
  const { data: product, error: relatedProducts } = await supabase
    .from("product")
    .select("*")
    .ilike("generationsArr", `%${id}%`);

  if (relatedProducts) throw new Error(relatedProducts.message);

  console.log(product);
  if (product?.length) {
    const upsert = product.map((pro) => {
      const generations: number[] = JSON.parse(pro.generationsArr);
      const updatedArr = generations.filter((item) => item !== id);
      const generationsArr = updatedArr.length
        ? JSON.stringify(updatedArr.filter((item) => item !== id))
        : null;

      return { ...pro, generationsArr };
    });

    const { error } = await supabase.from("product").upsert(upsert);

    if (error) throw new Error(error.message);

    await Promise.all(upsert.map((pro) => revalidateProductById(pro.id)));
  }
  // 2. Delete image.

  if (imageToDelete) {
    const { error } = await deleteImageFromBucket({
      bucketName: "generations",
      imagePaths: [imageToDelete],
    });

    if (error) throw new Error(error.message);
  }

  // 3 . Delte generation.

  const { error } = await supabase.from("carGenerations").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await revalidateMakers();
}
