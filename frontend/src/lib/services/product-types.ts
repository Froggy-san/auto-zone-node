import { SUPABASE_URL } from "@lib/constants";
import { ProductType, ProductTypeSchema } from "@lib/types";
import { createClient } from "@utils/supabase/client";
import { z } from "zod";
import { deleteImageFromBucket } from "./helper-services";
import { revalidateCategories } from "@lib/actions/categoriesAction";
//https://umkyoinqpknmedkowqva.supabase.co/storage/v1/object/public/productType/just-wanted-to-flex-my-prismo-tattoos-2023-to-now-3-v0-mi2kjvmko2mf1.webp
const supabase = createClient();
type StorageError = {
  name: string;
  message: string;
  status: number;
};

export async function createProductType({
  insert,
}: z.infer<typeof ProductTypeSchema>) {
  const paths: (string | null)[] = [];
  const filePromises: Promise<
    | {
        data: {
          id: string;
          path: string;
          fullPath: string;
        };
        error: null;
      }
    | {
        data: null;
        error: any;
      }
  >[] = [];

  insert.forEach((item) => {
    if (!item.image.length) {
      paths.push(null);
    } else {
      const file = item.image[0];
      const name = `${crypto.randomUUID()}-${file.name}`.replace(/\//g, "");
      const path = `${SUPABASE_URL}/storage/v1/object/public/productType/${name}`;
      paths.push(path);

      filePromises.push(
        supabase.storage.from("productType").upload(name, file)
      );
    }
  });

  if (filePromises.length) {
    const results = await Promise.allSettled(filePromises);

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`File upload at index ${index} failed:`, result.reason);
      } else {
        // result.status is 'fulfilled'
        console.log(
          `File at index ${index} uploaded successfully:`,
          result.value.data
        );
      }
    });
  }

  const insertedData = insert.map((item, i) => {
    return {
      name: item.name,
      categoryId: item.categoryId ? item.categoryId : null,
      image: paths[i],
    };
  });

  const { error } = await supabase.from("productTypes").insert(insertedData);

  if (error) throw new Error(error.message);
  await revalidateCategories();
}

interface EditProps {
  name: string;
  categoryId: number;
  image: File[];
  id: number;
  imageToDelete: string | null;
}

/*

    const uplodFile = async () => {
        const { error } = await supabase.storage
          .from("productType")
          .upload(name, file);
      };

  if (image.length) {
    const file = image[0];
    const name = `${Math.random()}-${file.name}`.replace(/\//g, "");
    path = `${SUPABASE_URL}/storage/v1/object/public/productType/${name}`;

    const { error } = await supabase.storage
      .from("productType")
      .upload(name, file);

    if (error) throw new Error(error.message);
  }

*/
export async function editProductType({
  id,
  name,
  categoryId,
  image,
  imageToDelete,
}: EditProps) {
  let path: string | null = null;

  if (image.length) {
    const file = image[0];
    const name = `${Math.random()}-${file.name}`.replace(/\//g, "");

    path = `${SUPABASE_URL}/storage/v1/object/public/productType/${name}`;
    const { error } = await supabase.storage
      .from("productType")
      .upload(name, file);

    if (error) throw new Error(error.message);
    if (imageToDelete) {
      const { error } = await deleteImageFromBucket({
        bucketName: "category",
        imagePaths: [imageToDelete],
      });
      if (error) throw new Error(error.message);
    }
  }

  const insert: { name: string; categoryId: number; image?: string } = {
    name,
    categoryId,
  };
  if (path) insert.image = path;

  const { error } = await supabase
    .from("productTypes")
    .update(insert)
    .eq("id", id);

  if (error) throw new Error(error.message);
  await revalidateCategories();
}

export async function searchProductTypes(searchTerm: string): Promise<{
  productTypes: ProductType[] | null;
  error: string;
}> {
  let query = supabase.from("productTypes").select("*");

  if (searchTerm) {
    query = query.ilike("name", `%${searchTerm}%`);
  } else {
    query = query.range(0, 10);
  }

  const { data: productTypes, error } = await query;

  return { productTypes, error: error?.message || "" };
}
