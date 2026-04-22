import {
  AddetionalDetailsSchema,
  EditDetails,
  EditProduct,
  ImgData,
  ProductImage,
} from "@lib/types";
import { createClient } from "@utils/supabase/client";
import {
  deleteImageFromBucket,
  deleteMultipleImageFromTable,
  uploadImageToBucket,
} from "./helper-services";
import { z } from "zod";
const supabase = createClient();
interface CreateProductProps {
  name: string;
  categoryId: number;
  productTypeId: number;
  productBrandId: number;
  description: string;
  listPrice: number;
  salePrice: number;
  stock: number;
  isAvailable: boolean;
  images: ImgData[];
  moreDetails: z.infer<typeof AddetionalDetailsSchema>[];
  makerId: number | null;
  modelId: number | null;
  generationsArr: number[] | null;
}
interface insert extends Omit<
  CreateProductProps,
  "images" | "generationsArr" | "moreDetails"
> {
  generationsArr?: string;
}
export async function createProduct({
  name,
  categoryId,
  productTypeId,
  productBrandId,
  description,
  listPrice,
  salePrice,
  stock,
  isAvailable,
  images,
  moreDetails,
  makerId,
  modelId,
  generationsArr,
}: CreateProductProps) {
  let insert: insert = {
    name,
    categoryId,
    productTypeId,
    productBrandId,
    description,
    listPrice,
    salePrice,
    stock,
    isAvailable,
    makerId,
    modelId,
  };
  if (generationsArr?.length) {
    insert = {
      ...insert,
      generationsArr: JSON.stringify(generationsArr),
    };
  }

  const { data, error } = await supabase
    .from("product")
    .insert([insert])
    .select();

  if (error) throw new Error(error.message);

  const product = data[0];
  // 2. Upload the related images to the product created.

  if (!images.length) return product;

  const dataForImagesTable = images.map((obj) => {
    return { productId: product.id, imageUrl: obj.path, isMain: obj.isMain };
  });

  const { data: imagesData, error: imagesError } = await supabase
    .from("productImages")
    .insert(dataForImagesTable)
    .select();

  if (imagesError) throw new Error(`Image Table Error: ${imagesError.message}`);

  await uploadImageToBucket({ bucketName: "product", images });

  // Create Additional details.

  if (moreDetails.length) {
    const details = moreDetails.map((item) => {
      return {
        ...item,
        table: JSON.stringify(item.table),
        productId: product.id,
      };
    });

    const { error } = await supabase.from("moreDetails").insert(details);

    if (error) {
      console.log(`Additional details error: ${error.message}`);
      throw new Error(error.message);
    }
  }

  return product;
}

export async function editProdcut({
  productToEdit,
  imagesToUpload,
  imagesToDelete,
  isMain,
  isEqual,
  prevIsMian,
  moreDetails,
  deletedDetails,
}: {
  productToEdit: EditProduct;
  imagesToUpload: ImgData[];
  imagesToDelete: ProductImage[];
  isEqual: boolean;
  isMain?: ProductImage | null;
  prevIsMian: ProductImage | null;
  moreDetails: z.infer<typeof AddetionalDetailsSchema>[];
  deletedDetails: number[];
}) {
  /// 1. Edit the products data.
  if (!isEqual) {
    const { error } = await supabase
      .from("product")
      .update(productToEdit)
      .eq("id", productToEdit.id)
      .select();
    if (error) {
      console.log("Product edit error:", error.message);
      throw new Error(error.message);
    }
  }

  /// 2. Upload new images added by the user.

  if (imagesToUpload.length) {
    // Check if the user marked any of the new images as a main image
    const isThereMianImage = imagesToUpload.some((img) => img.isMain);
    // Check if the user changed or marked any of the new images as a main image , and see if there was a previus main images or not, becasue if there wasn't a main image then there is no need to unmark any previus images before markingthe new one as main.
    if (isThereMianImage && prevIsMian) {
      const { error } = await supabase
        .from("productImages")
        .update({ isMain: false })
        .eq("id", prevIsMian.id)
        .select();

      if (error) throw new Error(error.message);
    }

    const dataForImagesTable = imagesToUpload.map((obj) => {
      return {
        productId: productToEdit.id,
        imageUrl: obj.path,
        isMain: obj.isMain,
      };
    });

    const { data: imagesData, error: imagesError } = await supabase
      .from("productImages")
      .insert(dataForImagesTable)
      .select();

    if (imagesError)
      throw new Error(`Image Table Error: ${imagesError.message}`);

    await uploadImageToBucket({
      bucketName: "product",
      images: imagesToUpload,
    });
  }

  // 3. Delete any images removed by the user.

  if (imagesToDelete.length) {
    const ids: number[] = [];
    const imagePaths: string[] = [];
    imagesToDelete.forEach((image) => {
      ids.push(image.id);
      imagePaths.push(image.imageUrl);
    });

    const { error: imageTableError } = await deleteMultipleImageFromTable(
      "productImages",
      ids,
    );

    if (imageTableError)
      throw new Error(
        `Error from trying to delete images from the table: ${imageTableError.message}`,
      );

    const { error } = await deleteImageFromBucket({
      bucketName: "products",
      imagePaths,
    });
    console.log("error from bucket.");
    if (error) throw new Error(error.message);
  }

  // 4. Edit the main image if the user selected/chose a different main image to the product.
  if (isMain) {
    if (prevIsMian) {
      const { error } = await supabase
        .from("productImages")
        .update({ isMain: false })
        .eq("id", prevIsMian.id)
        .select();

      if (error) throw new Error(error.message);
    }

    const { error } = await supabase
      .from("productImages")
      .update({ isMain: true })
      .eq("id", isMain.id);

    if (error) {
      console.log("ERROR IS MAIN:", error.message);
      throw new Error(error.message);
    }
  }

  // 5. Edit/Add the moreDetails.

  if (moreDetails.length) {
    const detailsToBeAdded = moreDetails.filter((detail) => !detail.id);
    const detailsToEdit = moreDetails.filter(
      (detail) => detail.id,
    ) as EditDetails[];

    if (detailsToEdit.length) {
      for (let i = 0; i < detailsToEdit.length; i++) {
        const detail = detailsToEdit[i];
        console.log("WSSDADA", detail);
        const { error } = await supabase
          .from("moreDetails")
          .update({ ...detail, table: JSON.stringify(detail.table) })
          .eq("id", detail.id);

        if (error) {
          console.log("Edit detials error:", error.message);
          throw new Error(error.message);
        }
      }
    }

    if (detailsToBeAdded.length) {
      const details = detailsToBeAdded.map((d) => {
        return {
          ...d,
          table: JSON.stringify(d.table),
          productId: productToEdit.id,
        };
      });
      const { error } = await supabase.from("moreDetails").insert(details);

      if (error) throw new Error(error.message);
    }
  }

  // Delete moreDetails section.

  if (deletedDetails.length) {
    const { error } = await supabase
      .from("moreDetails")
      .delete()
      .in("id", deletedDetails);
    if (error) throw new Error(`More details Deletion error: ${error.message}`);
  }
}

/// To delete images form a bucket
// export async function deleteImageFromBucket({
//   bucketName,
//   imagePaths,
// }: {
//   bucketName: string;
//   imagePaths: string[];
// }) {
//   const supabase = createClient();
//   const { error } = await supabase.storage.from(bucketName).remove(imagePaths);

//   return error;
// }
