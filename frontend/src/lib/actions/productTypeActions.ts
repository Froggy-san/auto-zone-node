"use server";

import { getToken } from "@lib/helper";
import { deleteImageFromBucketAction } from "@lib/services/server-helpers";
import { ProductType } from "@lib/types";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export async function getAllProductTypesAction() {
  const response = await fetch(`${supabaseUrl}/rest/v1/productTypes`, {
    method: "GET",
    headers: {
      apikey: `${supabaseKey}`,
      Authorization: `Bearer ${supabaseKey}`,
    },
    next: {
      tags: ["productTypes"],
    },
  });

  if (!response.ok) {
    return {
      data: null,
      error: "Something went wrong while trying to fetch categories data.",
    };
  }

  const data = await response.json();

  return { data, error: "" };
}

export async function createProductTypeAction(productType: string) {
  // const token = getToken();
  // if (!token) redirect("/login");

  const response = await fetch(`${supabaseUrl}/rest/v1/productTypes`, {
    method: "POST",
    headers: {
      apikey: `${supabaseKey}`,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ name: productType }),
  });
  if (!response.ok) {
    const error =
      (await response.json()).message ||
      "Something went wrong while creating the a new product type.";

    return {
      data: null,
      error,
    };
  }
  // revalidatePath("/dashboard/insert-data");
  revalidateTag("productTypes");
  // const data = await response.json();
  return { data: null, error: "" };
}

export async function editProductTypeAction({
  productType,
  id,
}: {
  productType: string;
  id: number;
}) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/productTypes?id=eq.${id}`,
    {
      method: "PATCH",
      headers: {
        apikey: `${supabaseKey}`,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ name: productType }),
    }
  );
  if (!response.ok) {
    const error =
      (await response.json()).message ||
      "Something went wrong while creating the category.";

    return {
      data: null,
      error,
    };
  }
  revalidateTag("productTypes");
  // const data = await response.json();
  return { data: null, error: "" };
}

export async function deleteProductTypeAction(productTypes: ProductType[]) {
  const imagesToDelete = productTypes
    .map((item) => item.image)
    .filter((item) => item !== null);

  const ids = productTypes.map((item) => item.id);
  if (imagesToDelete.length) {
    const { error } = await deleteImageFromBucketAction({
      bucketName: "productType",
      imagePaths: imagesToDelete,
    });
    if (error) return { data: null, error: error.message };
    revalidateTag("categories");
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/productTypes?id=in.(${ids.join(",")})`,
    {
      method: "DELETE",
      headers: {
        apikey: `${supabaseKey}`,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal",
      },
    }
  );
  if (!response.ok) {
    const error =
      (await response.json()).message ||
      "Something went wrong while creating the category.";

    return {
      data: null,
      error,
    };
  }
  revalidateTag("productTypes");
  // const data = await response.json();
  return { data: null, error: "" };
}

export async function getproducttypesCountAction() {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };
  const response = await fetch(
    `${process.env.API_URL}/api/producttypes/count`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    console.log(
      "Something went wrong while trying to fetch product types count."
    );
    return {
      data: null,
      error: "Something went wrong while trying to fetch product types count.",
    };
  }

  const data = await response.json();
  return { data, error: "" };
}

// import { getToken } from "@lib/helper";
// import { revalidateTag } from "next/cache";
// import { redirect } from "next/navigation";
// export async function getAllProductTypesAction() {
//   // const token = getToken();

//   // if (!token)
//   //   return { data: null, error: "You are not authorized to make this action." };
//   const response = await fetch(`${process.env.API_URL}/api/producttypes`, {
//     method: "GET",
//     next: {
//       tags: ["productTyps"],
//     },
//   });

//   if (!response.ok) {
//     console.log(
//       "Something went wrong while trying to fetch product types data."
//     );
//     return {
//       data: null,
//       error: "Something went wrong while trying to fetch product types data.",
//     };
//   }

//   const data = await response.json();

//   return { data, error: "" };
// }

// export async function createProductTypeAction(productType: string) {
//   const token = getToken();
//   if (!token) redirect("/login");

//   const response = await fetch(`${process.env.API_URL}/api/producttypes`, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-type": "application/json",
//     },
//     body: JSON.stringify({ name: productType }),
//   });
//   if (!response.ok) {
//     if (response.status === 409) {
//       return { data: null, error: (await response.json()).message };
//     }
//     console.log("Something went wrong while creating the product type.");
//     return { data: null, error: "Something went wrong!" };
//   }

//   revalidateTag("productTyps");
//   const data = await response.json();
//   return { data, error: "" };
// }

// export async function editProductTypeAction({
//   productType,
//   id,
// }: {
//   productType: string;
//   id: number;
// }) {
//   const token = getToken();
//   if (!token) redirect("/login");
//   const response = await fetch(
//     `${process.env.API_URL}/api/producttypes/${id}`,
//     {
//       method: "PUT",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-type": "application/json",
//       },
//       body: JSON.stringify({ name: productType }),
//     }
//   );
//   if (!response.ok) {
//     if (response.status === 409) {
//       return { data: null, error: (await response.json()).message };
//     }
//     console.log("Something went wrong while creating the product type.");
//     return { data: null, error: "Something went wrong!" };
//   }
//   revalidateTag("productTyps");
//   // const data = await response.json();
//   return { data: null, error: "" };
// }

// export async function deleteProductTypeAction(id: number) {
//   const token = getToken();
//   if (!token) redirect("/login");
//   const response = await fetch(
//     `${process.env.API_URL}/api/producttypes/${id}`,
//     {
//       method: "DELETE",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );
//   if (!response.ok) {
//     if (response.status === 409) {
//       return { data: null, error: (await response.json()).message };
//     }
//     console.log("Something went wrong while deleting the ProductType.");
//     return { data: null, error: "Something went wrong!" };
//   }
//   revalidateTag("productTyps");
//   return { data: null, error: "" };
// }

// export async function getproducttypesCountAction() {
//   const token = getToken();

//   if (!token)
//     return { data: null, error: "You are not authorized to make this action." };
//   const response = await fetch(
//     `${process.env.API_URL}/api/producttypes/count`,
//     {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

//   if (!response.ok) {
//     console.log(
//       "Something went wrong while trying to fetch product types count."
//     );
//     return {
//       data: null,
//       error: "Something went wrong while trying to fetch product types count.",
//     };
//   }

//   const data = await response.json();
//   return { data, error: "" };
// }
