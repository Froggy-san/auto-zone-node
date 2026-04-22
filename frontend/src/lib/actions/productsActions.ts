"use server";

import { AUTH_TOEKN_NAME, PAGE_SIZE } from "@lib/constants";
import { getAllCategories } from "@lib/data-service";
import { getToken } from "@lib/helper";
import { deleteImageFromBucketSr } from "@lib/services/server-helpers";

import {
  AddetionalDetailsSchema,
  CarGeneration,
  CartItem,
  CreateProductProps,
  EditProduct,
  Product,
  ProductById,
  ProductImage,
  ProductWithCategory,
} from "@lib/types";
import { createClient } from "@utils/supabase/server";
import { compareAsc } from "date-fns";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface GetProdcutsActionProps {
  name?: string;
  id?: number;
  categoryId?: string;
  productTypeId?: string;
  productBrandId?: string;
  isAvailable?: string;
  pageNumber?: string;
  makerId?: string;
  modelId?: string;
  generationId?: string;
}
//Product?PageNumber=1&PageSize=10
// /api/Product?Name=test&CategoryId=1&ProductTypeId=1&ProductBrandId=1&IsAvailable=true&PageNumber=1&PageSize=10
// const token = getToken();

// if (!token)
//   return { data: null, error: "You are not authorized to make this action." };
export async function getProductsAction({
  pageNumber,
  id,
  name,
  categoryId,
  productTypeId,
  productBrandId,
  isAvailable,
  makerId,
  modelId,
  generationId,
}: GetProdcutsActionProps) {
  const from = (Number(pageNumber) - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = `${supabaseUrl}/rest/v1/product?select=*,productImages(*),categories(name)&order=created_at.desc&productImages.order=id.asc`;
  //&productImages.order=created_at.asc

  if (id) query = query + `&id=eq.${id}`;

  if (name)
    query = query + `&or=(name.ilike.*${name}*,description.ilike.*${name}*)`;

  if (categoryId) query = query + `&categoryId=eq.${categoryId}`;

  if (productTypeId) query = query + `&productTypeId=eq.${productTypeId}`;

  if (productBrandId) query = query + `&productBrandId=eq.${productBrandId}`;

  if (makerId) query = query + `&makerId=eq.${makerId}`;

  if (modelId) query = query + `&modelId=eq.${modelId}`;

  if (generationId) query = query + `&generationsArr=ilike.*${generationId}*`;

  if (isAvailable == "true") {
    query = query + `&isAvailable=eq.${isAvailable === "true"}&stock=gte.${1}`;
  }
  if (isAvailable == "false") {
    query = query + `&or=(isAvailable.eq.false,stock.eq.0)`;
  }

  const headers = {
    apikey: `${supabaseKey}`,
    Authorization: `Bearer ${supabaseKey}`,
    Prefer: "count=exact",
  } as Record<string, string>;

  if (pageNumber) {
    headers.Range = `${from}-${to}`;
  }

  const response = await fetch(query, {
    method: "GET",
    headers,
    next: {
      tags: ["products"],
    },
  });

  if (!response.ok) {
    const error =
      (await response.json()).message ||
      "Something went wrong whole grabbing the products.";

    return {
      data: null,
      error,
    };
  }

  const data: ProductWithCategory[] = await response.json();

  //  !!IMPORTANT::  This is a really nice way to sort things based on more than one thing, here we get a list of images that sometimes have the same date, so if that is the case this function sorts then by id as well.
  // const productsWithSortedImages = data.map((product) => ({
  //   ...product,
  //   productImages: product.productImages?.sort((a, b) => {
  //     const dateDiff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  //     return dateDiff !== 0 ? dateDiff : a.id - b.id; // Fallback to ID
  //   }),
  // }));
  return { data, error: "" };
}
// const productsWithCategories = data.map((product) => {
//   const category = categories.find(
//     (cat: Category) => cat.id === product.categoryId
//   ).name;
//   return { ...product, category: category };
// });

type AppliedFilters = {
  name: string;
  categoryId: string;
  productTypeId: string;
  productBrandId: string;
  isAvailable: string;
  makerId: string;
  modelId: string;
  generationId: string;
};

interface ReturnedById extends ProductById {
  pages: { prevPro: number | null; nextPro: number | null } | null;
}
export async function getProductByIdAction(
  id: string,
  appliedFilters: AppliedFilters,
): Promise<{ data: ReturnedById | null; error: string }> {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/product?id=eq.${id}&select=*,productImages(*),categories(*),productBrands(*),productTypes(*),moreDetails(*),carMakers(*),carModels(*)&productImages.order=id.asc`,
      {
        method: "GET",
        headers: {
          apikey: `${supabaseKey}`,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: {
          // Dynamic tag for the specific product and the general list
          tags: ["products", `product-${id}`],
        },
      },
    );

    if (!response.ok) {
      // Handle HTTP errors (e.g., 404, 500)
      const errorData = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
      console.error(
        `API Error for product ${id}: ${response.status} - ${errorData.message}`,
      );
      throw new Error(
        `Failed to fetch product ${id}: ${errorData.message || response.statusText}`,
      );
    }

    const data = await response.json();
    const product = data[0];
    const moreDetails = product.moreDetails.map(
      (item: { title: string; description: string; table: string }) => {
        const table = JSON.parse(item.table);
        return {
          ...item,
          table,
        };
      },
    );

    // let errors = "";
    // let generationsArr: CarGeneration[] = [];
    const { generations, error } = await fetchProductGenerations(product);
    console.log(`Generations Fetch Error: ${error}`);

    const { pages, error: pagesError } = await getNextAndPrevPros(
      product.id,
      appliedFilters,
    );

    const productById = {
      ...product,
      moreDetails,
      generationsArr: generations || [],
      pages,
    };

    return { data: productById, error: error || "" };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

interface FetchedProductData {
  generations: CarGeneration[] | null;
  error?: string; // Optional error message
}

async function getNextAndPrevPros(
  currId: number,
  {
    name,
    categoryId,
    productBrandId,
    productTypeId,
    makerId,
    modelId,
    generationId,
    isAvailable,
  }: AppliedFilters,
) {
  const supabase = await createClient();

  let nextPage = supabase
    .from("product")
    .select("id")
    .order("id", { ascending: true });
  // if (id) query = query + `&id=eq.${id}`;

  let previousPage = supabase
    .from("product")
    .select("id")
    .order("id", { ascending: false });

  if (name) {
    nextPage = nextPage.or(`name.ilike.*${name}*,description.ilike.*${name}*`);
    previousPage = previousPage.or(
      `name.ilike.*${name}*,description.ilike.*${name}*`,
    );
  }

  if (categoryId) {
    nextPage = nextPage.eq("categoryId", categoryId);
    previousPage = previousPage.eq("categoryId", categoryId);
  }

  if (productTypeId) {
    nextPage = nextPage.eq("productTypeId", productTypeId);
    previousPage = previousPage.eq("productTypeId", productTypeId);
  }

  if (productBrandId) {
    nextPage = nextPage.eq("productBrandId", productBrandId);
    previousPage = previousPage.eq("productBrandId", productBrandId);
  }

  if (makerId) {
    nextPage = nextPage.eq("makerId", makerId);
    previousPage = previousPage.eq("makerId", makerId);
  }

  if (modelId) {
    nextPage = nextPage.eq("modelId", modelId);
    previousPage = previousPage.eq("modelId", modelId);
  }

  if (generationId) {
    nextPage = nextPage.ilike("generationsArr", `%${generationId}%`);
    previousPage = previousPage.ilike("generationsArr", `%${generationId}%`);
  }

  if (isAvailable) {
    nextPage = nextPage.eq("isAvailable", true);
    previousPage = previousPage.eq("isAvailable", true);
  }
  const { data: nextPro, error: nextError } = await nextPage
    .gt("id", currId)
    .limit(1)
    .single();

  if (nextError) {
    if (nextError.code === "PGRST116") {
      console.error("Prev Error Message :", nextError.message);
    } else {
      return { data: null, error: nextError.message };
    }
  }
  const { data: prevPro, error: prevError } = await previousPage
    .lt("id", currId)
    .limit(1)
    .single();
  if (prevError) {
    if (nextError) {
      if (nextError.code === "PGRST116") {
        console.error("Prev Error Message :", nextError.message);
      } else {
        return { data: null, error: prevError.message };
      }
    }
  }
  const pages = {
    prevPro: prevPro ? prevPro.id : null,
    nextPro: nextPro ? nextPro.id : null,
  };

  return { pages, error: "" };
}

async function fetchProductGenerations(
  product: ProductById,
): Promise<FetchedProductData> {
  const supabase = await createClient(); // Get your Supabase client instance

  let generationsArr: CarGeneration[] = [];
  let error: string | undefined;

  // Safely parse the generationsArr string
  let genIds: number[] | null = null;
  if (product.generationsArr && typeof product.generationsArr === "string") {
    try {
      const parsed = JSON.parse(product.generationsArr);
      if (
        Array.isArray(parsed) &&
        parsed.every((id) => typeof id === "number")
      ) {
        genIds = parsed;
      } else {
        console.warn(
          "Parsed generationsArr is not an array of numbers:",
          product.generationsArr,
        );
        error = "Invalid generations data format.";
      }
    } catch (e) {
      console.error(
        "Error parsing generationsArr JSON:",
        product.generationsArr,
        e,
      );
      error = "Failed to process generations data.";
    }
  }

  if (genIds && genIds.length > 0) {
    // Only fetch if we have valid IDs
    const generationPromises = genIds.map(
      (genId: number) =>
        supabase.from("carGenerations").select("*").eq("id", genId).single(), // Use .single() if you expect one result per ID
    );

    try {
      const results = await Promise.all(generationPromises);

      // Check for individual errors within the results
      const hasErrorsInResults = results.some((res) => res.error);
      if (hasErrorsInResults) {
        // Log individual errors for debugging
        results.forEach((res, index) => {
          if (res.error) {
            console.error(
              `Error fetching generation ID ${genIds[index]}:`,
              res.error,
            );
          }
        });
        error = error || "Failed to fetch some generation details."; // Prioritize existing error if any
      }

      // Filter out null/undefined data and ensure correct type
      generationsArr = results
        .map((res) => res.data) // data will be null if .single() didn't find a match
        .filter((data): data is CarGeneration => data !== null); // Type guard for filtering

      // Optional: If you strictly need all generations to be found,
      // and want an error if some are missing:
      if (generationsArr.length !== genIds.length && !error) {
        console.warn("Some generations IDs did not return data.");
        error = error || "Some associated generations could not be found.";
      }
    } catch (e) {
      console.error("Promise.all error during generations fetch:", e);
      error = "An unexpected error occurred during generations fetch.";
    }
  }
  return { generations: generationsArr, error };
}

export async function createProductAction({
  name,
  categoryId,
  productTypeId,
  productBrandId,
  description,
  listPrice,
  carinfoId,
  salePrice,
  stock,
  isAvailable,
  images,
}: CreateProductProps) {
  // 1. Create the product.

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product")
    .insert([
      {
        name,
        categoryId,
        productTypeId,
        productBrandId,
        description,
        listPrice,
        salePrice,
        stock,
        isAvailable,
      },
    ])
    .select();

  if (error) return { data: null, error: error.message };

  // 2. Upload the related images to the product created.

  if (!images.length) return { data, error: "" };

  const product = data[0];

  const imageObjs = images.map((image) => {
    const img = image.get("image") as File;
    const isMain = image.get("isMain");

    const name = `${Math.random()}-${img.name}`.replace(/\//g, "");

    return {
      path: `${supabaseUrl}/storage/v1/object/public/product/${name}`,
      name,
      isMain: isMain === "true",
      file: img,
    };
  });

  const dataForImagesTable = imageObjs.map((obj) => {
    return { productId: product.id, imageUrl: obj.path, isMain: obj.isMain };
  });

  const { data: imagesData, error: imagesError } = await supabase
    .from("productImages")
    .insert(dataForImagesTable)
    .select();

  if (imagesError)
    return {
      data: product,
      error: `Error from the Table: ${imagesError.message}`,
    };

  // 3. Handle image uploads to the bucket.
  let finalError = "";

  // Use Promise.all to handle concurrent uploads.
  const uploadPromises = imageObjs.map(async (img) => {
    try {
      const { data, error } = await supabase.storage
        .from("product")
        .upload(img.name, img.file);

      if (error) {
        console.log("ERROR:", error.message);
        throw new Error(error.message);
      }

      console.log("UPLOAD SUCCESS:", data);
      return data;
    } catch (err: any) {
      console.log("UPLOAD ERROR:", err);
      finalError = err.message;
    }
  });

  await Promise.all(uploadPromises);

  if (finalError) {
    return {
      data: product,
      error: `Image upload error: ${finalError}`,
    };
  }

  revalidateTag("products");
  return { data: product, error: "" };
}

export async function revalidateProducts() {
  revalidateTag("products");
}

export async function revalidateProductById(id: number) {
  // revalidatePath(`/products/${id}`);
  revalidateTag(`product-${id}`);
}
export async function adjustProductsStockAction(
  actionType: "decrement" | "increment",
  cartItems: any[], // Just the array of {id, quantity}
) {
  try {
    const supabase = await createClient();

    // We send the whole array to the one "Batch" function
    const { error } = await supabase.rpc("adjust_stock_batch", {
      items_array: cartItems,
      action_type: actionType,
    });

    if (error) throw new Error(error.message);
    // 1. Purge the main products list cache
    revalidateTag("products");

    // 2. Purge each individual product's cache
    cartItems.forEach((item) => {
      revalidateTag(`product-${item.id}`);
    });
    return { success: true };
  } catch (error: any) {
    console.error("Stock adjustment failed:", error.message);
    return { success: false, error: error.message };
  }
}
// export async function createProductAction({
//   name,
//   categoryId,
//   productTypeId,
//   productBrandId,
//   description,
//   listPrice,
//   carinfoId,
//   salePrice,
//   stock,
//   isAvailable,
//   images,
// }: CreateProductProps) {
//   // 1. Create the product.

//   const supabase = await createClient();
//   const { data, error } = await supabase
//     .from("product")
//     .insert([
//       {
//         name,
//         categoryId,
//         productTypeId,
//         productBrandId,
//         description,
//         listPrice,
//         salePrice,
//         stock,
//         isAvailable,
//       },
//     ])
//     .select();

//   if (error) return { data: null, error: error.message };

//   // 2. Upload the related images to the product created.

//   //  An example of an image url: https://umkyoinqpknmedkowqva.supabase.co/storage/v1/object/public/product//473017616_908603508057544_5962038006304143388_n.jpg

//   if (!images.length) return { data, error: "" };

//   const product = data[0];

//   const imageObjs = images.map((image) => {
//     const img = image.get("image") as File;
//     const isMain = image.get("isMain");

//     const name = `${Math.random()}-${img.name}`.replace(/\//g, "");

//     return {
//       path: `${supabaseUrl}/storage/v1/object/public/product/${name}`,
//       name,
//       isMain: isMain === "true",
//       file: img,
//     };
//   });

//   const dataForImagesTable = imageObjs.map((obj) => {
//     return { productId: product.id, imageUrl: obj.path, isMain: obj.isMain };
//   });

//   const { data: imagesData, error: imagesError } = await supabase
//     .from("productImages")
//     .insert(dataForImagesTable)
//     .select();

//   if (imagesError)
//     return {
//       data: product,
//       error: `Error from the Tabe: ${imagesError.message}`,
//     };

//   // The problem come after this point in the code.

//   let finalError = "";

//   for (let i = 0; i < imageObjs.length; i++) {
//     const img = imageObjs[i];

//     const { data, error } = await supabase.storage
//       .from("product")
//       .upload(img.name, img.file);

//     if (error) {
//       console.log("ERROR:", error.message);
//       finalError = error.message;
//     }
//   }
//   console.log("ERROR:", finalError);

//   revalidateTag("products");
//   return { data: product, error: finalError };
// }

export async function editProductAction({
  productToEdit,
  imagesToUpload,
  imagesToDelete,
  isMain,
  isEqual,
}: {
  productToEdit: EditProduct;
  imagesToUpload: FormData[];
  imagesToDelete: ProductImage[];
  isEqual: boolean;
  isMain?: ProductImage | null;
}) {
  const cookie = cookies();
  const token = cookie.get(AUTH_TOEKN_NAME)?.value || "";

  if (!token) redirect("/login");

  if (!isEqual) {
    const response = await fetch(
      `${process.env.API_URL}/api/Product/${productToEdit.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productToEdit),
      },
    );

    if (!response.ok) {
      if (response.status === 409) {
        return { data: null, error: (await response.json()).message };
      }
      return { data: null, error: "Had truble creating a product." };
    }
  }

  if (imagesToUpload.length) {
    const upload = imagesToUpload.map((image) =>
      createProductImageAction(image),
    );
    await Promise.all(upload);
  }

  if (imagesToDelete.length) {
    const deleteImages = imagesToDelete.map((deletedImage) =>
      deleteProductsImageAction(deletedImage.id),
    );

    await Promise.all(deleteImages);
  }

  if (isMain) {
    await setProductImageAsMain(isMain.id);
  }

  revalidatePath(`/products/${productToEdit.id}`);
  revalidateTag("products");

  return { data: null, error: "" };
}

export async function deleteProductsByIdAction(
  id: number,
  imagePaths: string[],
) {
  //Product?PageNumber=1&PageSize=10

  // const token = getToken();

  // if (!token) redirect("/login");
  const supabase = await createClient();
  const { error } = await supabase.from("product").delete().eq("id", id);

  if (error) return { data: null, error: error.message };

  if (imagePaths.length) {
    const { error: bucketError } = await deleteImageFromBucketSr({
      bucketName: "product",
      imagePaths,
    });

    if (bucketError) return { data: null, error: bucketError.message };
  }
  revalidatePath("products");

  return { data: null, error: "" };
}

interface GetProdcutsCountActionProps {
  name?: string;
  categoryId?: string;
  productTypeId?: string;
  productBrandId?: string;
  isAvailable?: string;
  makerId?: string;
  modelId?: string;
  generationId?: string;
}

export async function getProductsCountAction({
  name,
  categoryId,
  productTypeId,
  productBrandId,
  isAvailable,
  makerId,
  modelId,
  generationId,
}: GetProdcutsCountActionProps) {
  //Product?PageNumber=1&PageSize=10

  // const token = getToken();

  // if (!token)
  //   return {
  //     data: null,
  //     error: "You are not authorized to get the products count data.",
  //   };
  let query = `${supabaseUrl}/rest/v1/product?select=count`;

  if (name)
    query = query + `&or=(name.ilike.*${name}*,description.ilike.*${name}*)`;

  if (categoryId) query = query + `&categoryId=eq.${categoryId}`;

  if (productTypeId) query = query + `&productTypeId=eq.${productTypeId}`;

  if (productBrandId) query = query + `&productBrandId=eq.${productBrandId}`;

  if (makerId) query = query + `&makerId=eq.${makerId}`;

  if (modelId) query = query + `&modelId=eq.${modelId}`;

  if (generationId) query = query + `&generationArr=ilike.*${generationId}*"`;

  if (isAvailable) query = query + `&isAvailable=eq.${isAvailable === "true"}`;

  const response = await fetch(query, {
    method: "GET",
    cache: "no-cache",
    headers: {
      apikey: `${supabaseKey}`,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products count.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products count.",
    };
  }
  const data = await response.json();

  return { data: data[0].count, error: "" };
}

export async function editProductsStockAction(productsStock: Product[]) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("product")
    .upsert(productsStock, { onConflict: "id" });

  if (error) return error.message;
  // This is the new part:

  // const stocksPromises = productsStock.map((item) =>
  //   supabase.from("product").update({ stock: item.stock }).eq("id", item.id)
  // );

  // // Execute all update promises concurrently
  // const results = await Promise.all(stocksPromises);

  // // You might want to check the results for errors
  // const errors = results.filter(result => result.error !== null);
  // if (errors.length > 0) {
  //     console.error("Errors encountered during stock updates:", errors.map(e => e.error));
  //     // You might throw an error or handle them specifically
  //     throw new Error("Failed to update all product stocks.");
  // }

  // // Optionally, return a success message or the updated data (if you used .select() on each)
  // console.log("All stocks updated successfully.");
}

/// OLD API

/// PRODUCT IMAGES.

export async function getProductsImageAction(id: number) {
  //Product?PageNumber=1&PageSize=10

  // const token = getToken();

  // if (!token)
  //   return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/${id}`,
    {
      method: "GET",
      // headers: {
      //   Authorization: `Bearer ${token}`,
      //   // "Content-type": "application/json",
      // },
    },
  );

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}

export async function createProductImageAction(formData: FormData) {
  const cookie = cookies();
  const token = cookie.get(AUTH_TOEKN_NAME)?.value || "";

  if (!token) redirect("/login");

  const response = await fetch(`${process.env.API_URL}/api/ProductImages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  console.log(response);

  if (!response.ok) {
    const error =
      response.status === 409
        ? (await response.json()).message
        : "Hat truble posting an image.";
    // throw new Error(error);
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }
    return { data: null, error: "Had truble creating a product." };
  }

  return { data: null, error: "" };
}

export async function createMultipleProImages(formData: FormData, id: number) {
  const cookie = cookies();
  const token = cookie.get(AUTH_TOEKN_NAME)?.value || "";

  if (!token) redirect("/login");

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/AddMulty/${id}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const errorMessage =
      response.status === 409
        ? (await response.json()).message
        : "Something went wrong while uploading images.";
    return { data: null, error: errorMessage };
  }

  return { data: null, error: "" };
}

export async function deleteProductsImageAction(imageId: number) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token) redirect("/login");

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/${imageId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-type": "application/json",
      },
    },
  );

  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  return { data: null, error: "" };
}

export async function getProductsImagesMainAction(id: number) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/main/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-type": "application/json",
      },
    },
  );

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}

export async function setProductImageAsMain(id: number) {
  const token = getToken();

  if (!token) redirect("/login");

  await fetch(`${process.env.API_URL}/api/ProductImages/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      // "Content-type": "application/json",
    },
  });
}

export async function deleteProductsImageMainAction(id: number) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/main/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-type": "application/json",
      },
    },
  );

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}

/*

"use server";

import { AUTH_TOEKN_NAME, PAGE_SIZE } from "@lib/constants";
import { getAllCategories } from "@lib/data-service";
import { getToken } from "@lib/helper";
import {
  Category,
  CreateProductProps,
  EditProduct,
  Product,
  ProductImage,
} from "@lib/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface GetProdcutsActionProps {
  name?: string;
  categoryId?: string;
  productTypeId?: string;
  productBrandId?: string;
  isAvailable?: string;
  pageNumber?: string;
}

export async function getProductsAction({
  pageNumber,
  name,
  categoryId,
  productTypeId,
  productBrandId,
  isAvailable,
}: GetProdcutsActionProps) {
  //Product?PageNumber=1&PageSize=10
  // /api/Product?Name=test&CategoryId=1&ProductTypeId=1&ProductBrandId=1&IsAvailable=true&PageNumber=1&PageSize=10
  // const token = getToken();

  // if (!token)
  //   return { data: null, error: "You are not authorized to make this action." };

  let query = `${process.env.API_URL}/api/Product?`;

  if (name) query = query + `&Name=${name}`;
  if (pageNumber)
    query = query + `&PageSize=${PAGE_SIZE}&PageNumber=${pageNumber}`;

  if (categoryId) query = query + `&CategoryId=${categoryId}`;

  if (productTypeId) query = query + `&ProductTypeId=${productTypeId}`;

  if (productBrandId) query = query + `&ProductBrandId=${productBrandId}`;

  if (isAvailable) query = query + `&IsAvailable=${isAvailable}`;

  const response = await fetch(query, {
    method: "GET",
    // headers: {
    //   Authorization: `Bearer ${token}`,
    //   "Content-type": "application/json",
    // },
    next: {
      // revalidate: 3600,
      tags: ["products"],
    },
  });

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const categories = await getAllCategories();

  const data = (await response.json()) as Product[];

  const productsWithCategories = data.map((product) => {
    const category = categories.find(
      (cat: Category) => cat.id === product.categoryId
    ).name;
    return { ...product, category: category };
  });

  return { data: productsWithCategories, error: "" };
}

export async function getProductByIdAction(id: string) {
  // const token = getToken();

  // if (!token)
  //   return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(`${process.env.API_URL}/api/Product/${id}`);

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}

export async function createProductAction({
  name,
  categoryId,
  productTypeId,
  productBrandId,
  description,
  listPrice,
  carinfoId,
  salePrice,
  stock,
  isAvailable,
  images,
}: CreateProductProps) {
  const cookie = cookies();
  const token = cookie.get(AUTH_TOEKN_NAME)?.value || "";

  if (!token) redirect("/login");

  const response = await fetch(`${process.env.API_URL}/api/Product`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      categoryId,
      productTypeId,
      productBrandId,
      description,
      listPrice,
      carinfoId,
      salePrice,
      stock,
      isAvailable,
    }),
  });

  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }
    return { data: null, error: "Had truble creating a product." };
  }

  const { prodcutId } = await response.json();

  if (images.length) {
    const upload = images.map((image) => {
      image.append("productId", String(prodcutId));
      return createProductImageAction(image);
    });
    const result = await Promise.all(upload);

    const item = result.find((item) => item.error.length > 0);
    if (item) {
      return { data: null, error: item.error };
    }
  }
  revalidateTag("products");

  return { data: null, error: "" };
}

export async function editProductAction({
  productToEdit,
  imagesToUpload,
  imagesToDelete,
  isMain,
  isEqual,
}: {
  productToEdit: EditProduct;
  imagesToUpload: FormData[];
  imagesToDelete: ProductImage[];
  isEqual: boolean;
  isMain?: ProductImage | null;
}) {
  const cookie = cookies();
  const token = cookie.get(AUTH_TOEKN_NAME)?.value || "";

  if (!token) redirect("/login");

  if (!isEqual) {
    const response = await fetch(
      `${process.env.API_URL}/api/Product/${productToEdit.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productToEdit),
      }
    );

    if (!response.ok) {
      if (response.status === 409) {
        return { data: null, error: (await response.json()).message };
      }
      return { data: null, error: "Had truble creating a product." };
    }
  }

  if (imagesToUpload.length) {
    const upload = imagesToUpload.map((image) =>
      createProductImageAction(image)
    );
    await Promise.all(upload);
  }

  if (imagesToDelete.length) {
    const deleteImages = imagesToDelete.map((deletedImage) =>
      deleteProductsImageAction(deletedImage.id)
    );

    await Promise.all(deleteImages);
  }

  if (isMain) {
    await setProductImageAsMain(isMain.id);
  }

  revalidatePath(`/products/${productToEdit.id}`);
  revalidateTag("products");

  return { data: null, error: "" };
}

export async function deleteProductsByIdAction(id: number) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token) redirect("/login");

  const response = await fetch(`${process.env.API_URL}/api/Product/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      // "Content-type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }
    return { data: null, error: "Had truble creating a product." };
  }

  revalidatePath("/products");

  return { data: null, error: "" };
}

interface GetProdcutsCountActionProps {
  name?: string;
  categoryId?: string;
  productTypeId?: string;
  productBrandId?: string;
  isAvailable?: string;
}

export async function getProductsCountAction({
  name,
  categoryId,
  productTypeId,
  productBrandId,
  isAvailable,
}: GetProdcutsCountActionProps) {
  //Product?PageNumber=1&PageSize=10

  // const token = getToken();

  // if (!token)
  //   return {
  //     data: null,
  //     error: "You are not authorized to get the products count data.",
  //   };

  let query = `${process.env.API_URL}/api/Product/count?`;

  if (name) query = query + `&Name=${name}`;

  if (categoryId) query = query + `&CategoryId=${categoryId}`;

  if (productTypeId) query = query + `&ProductTypeId=${productTypeId}`;

  if (productBrandId) query = query + `&ProductBrandId=${productBrandId}`;

  if (isAvailable) query = query + `&IsAvailable=${isAvailable}`;

  const response = await fetch(query, {
    method: "GET",
    cache: "no-cache",
  });

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products count.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products count.",
    };
  }
  const data = await response.json();

  return { data, error: "" };
}

/// PRODUCT IMAGES.

export async function getProductsImageAction(id: number) {
  //Product?PageNumber=1&PageSize=10

  // const token = getToken();

  // if (!token)
  //   return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/${id}`,
    {
      method: "GET",
      // headers: {
      //   Authorization: `Bearer ${token}`,
      //   // "Content-type": "application/json",
      // },
    }
  );

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}

export async function createProductImageAction(formData: FormData) {
  const cookie = cookies();
  const token = cookie.get(AUTH_TOEKN_NAME)?.value || "";

  if (!token) redirect("/login");

  const response = await fetch(`${process.env.API_URL}/api/ProductImages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  console.log(response);

  if (!response.ok) {
    const error =
      response.status === 409
        ? (await response.json()).message
        : "Hat truble posting an image.";
    // throw new Error(error);
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }
    return { data: null, error: "Had truble creating a product." };
  }

  return { data: null, error: "" };
}

export async function createMultipleProImages(formData: FormData, id: number) {
  const cookie = cookies();
  const token = cookie.get(AUTH_TOEKN_NAME)?.value || "";

  if (!token) redirect("/login");

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/AddMulty/${id}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorMessage =
      response.status === 409
        ? (await response.json()).message
        : "Something went wrong while uploading images.";
    return { data: null, error: errorMessage };
  }

  return { data: null, error: "" };
}

export async function deleteProductsImageAction(imageId: number) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token) redirect("/login");

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/${imageId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-type": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  return { data: null, error: "" };
}

export async function getProductsImagesMainAction(id: number) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/main/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-type": "application/json",
      },
    }
  );

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}

export async function setProductImageAsMain(id: number) {
  const token = getToken();

  if (!token) redirect("/login");

  await fetch(`${process.env.API_URL}/api/ProductImages/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      // "Content-type": "application/json",
    },
  });
}

export async function deleteProductsImageMainAction(id: number) {
  //Product?PageNumber=1&PageSize=10

  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  const response = await fetch(
    `${process.env.API_URL}/api/ProductImages/main/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-type": "application/json",
      },
    }
  );

  if (!response.ok) {
    console.log("Something went wrong while grabbing the products.");
    return {
      data: null,
      error: "Something went wrong while grabbing the products.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}

*/
