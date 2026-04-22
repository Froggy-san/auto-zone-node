"use server";

import { getToken } from "@lib/helper";
import { revalidateTag } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export async function getAllProductBrandsAction() {
  // const token = getToken();

  // if (!token)
  //   return { data: null, error: "You are not authorized to make this action." };
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/productBrands`, {
      method: "GET",
      headers: {
        apikey: `${supabaseKey}`,
        Authorization: `Bearer ${supabaseKey}`,
      },
      next: {
        tags: ["productBrands"],
      },
    });

    if (!response.ok) {
      const error =
        (await response.json()).message ||
        "Something went wrong while grabbing the product brands.";

      throw new Error(`Faield to get the product brands data: ${error}`);
    }

    const data = await response.json();

    return { data, error: "" };
  } catch (error: any) {
    console.log(`Error in getAllProductBrandsAction: ${error.message}`);
    return { data: null, error: error.message };
  }
}

export async function createProductBrandAction(productBrand: string) {
  const response = await fetch(`${supabaseUrl}/rest/v1/productBrands`, {
    method: "POST",
    headers: {
      apikey: `${supabaseKey}`,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ name: productBrand }),
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
  revalidateTag("productBrands");
  // const data = await response.json();
  return { data: null, error: "" };
}

export async function editProductBrandAction({
  productBrand,
  id,
}: {
  productBrand: string;
  id: number;
}) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/productBrands?id=eq.${id}`,
    {
      method: "PATCH",
      headers: {
        apikey: `${supabaseKey}`,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ name: productBrand }),
    },
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
  revalidateTag("productBrands");
  // const data = await response.json();
  return { data: null, error: "" };
}

export async function deleteProductBrandAction(id: number) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/productBrands?id=eq.${id}`,
    {
      method: "DELETE",
      headers: {
        apikey: `${supabaseKey}`,
        Authorization: `Bearer ${supabaseKey}`,

        Prefer: "return=minimal",
      },
    },
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
  revalidateTag("productBrands");
  // const data = await response.json();
  return { data: null, error: "" };
}

export async function getProductBrandsCountAction() {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };
  const response = await fetch(
    `${process.env.API_URL}/api/productbrands/count`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    console.log(
      "Something went wrong while trying to fetch product brands count.",
    );
    return {
      data: null,
      error: "Something went wrong while trying to fetch product brands count.",
    };
  }

  const data = await response.json();
  return { data, error: "" };
}

// import { getToken } from "@lib/helper";
// import { revalidateTag } from "next/cache";
// import { redirect } from "next/navigation";

// export async function getAllProductBrandsAction() {
//   // const token = getToken();

//   // if (!token)
//   //   return { data: null, error: "You are not authorized to make this action." };
//   const response = await fetch(`${process.env.API_URL}/api/productbrands`, {
//     method: "GET",

//     next: {
//       tags: ["productBrands"],
//     },
//   });

//   if (!response.ok) {
//     console.log(
//       "Something went wrong while trying to fetch product brands data."
//     );
//     return {
//       data: null,
//       error: "Something went wrong while trying to fetch product brands data.",
//     };
//   }

//   const data = await response.json();
//   return { data, error: "" };
// }

// export async function createProductBrandAction(productBrand: string) {
//   const token = getToken();
//   if (!token) redirect("/login");
//   const response = await fetch(`${process.env.API_URL}/api/productbrands`, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-type": "application/json",
//     },
//     body: JSON.stringify({ name: productBrand }),
//   });
//   if (!response.ok) {
//     if (response.status === 409) {
//       return { data: null, error: (await response.json()).message };
//     }
//     console.log("Something went wrong while creating the product brand.");
//     return { data: null, error: "Something went wrong!" };
//   }

//   revalidateTag("productBrands");
//   const data = await response.json();
//   return { data, error: "" };
// }

// export async function editProductBrandAction({
//   productBrand,
//   id,
// }: {
//   productBrand: string;
//   id: number;
// }) {
//   const token = getToken();
//   if (!token) redirect("/login");
//   const response = await fetch(
//     `${process.env.API_URL}/api/productbrands/${id}`,
//     {
//       method: "PUT",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-type": "application/json",
//       },
//       body: JSON.stringify({ name: productBrand }),
//     }
//   );
//   if (!response.ok) {
//     if (response.status === 409) {
//       return { data: null, error: (await response.json()).message };
//     }
//     console.log("Something went wrong while creating the product brand.");
//     return { data: null, error: "Something went wrong!" };
//   }
//   revalidateTag("productBrands");
//   // const data = await response.json();
//   return { data: null, error: "" };
// }

// export async function deleteProductBrandAction(id: number) {
//   const token = getToken();
//   if (!token) redirect("/login");
//   const response = await fetch(
//     `${process.env.API_URL}/api/productbrands/${id}`,
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
//     console.log("Something went wrong while deleting the ProductBrand.");
//     return { data: null, error: "Something went wrong!" };
//   }

//   revalidateTag("productBrands");
//   return { data: null, error: "" };
// }

// export async function getProductBrandsCountAction() {
//   const token = getToken();

//   if (!token)
//     return { data: null, error: "You are not authorized to make this action." };
//   const response = await fetch(
//     `${process.env.API_URL}/api/productbrands/count`,
//     {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

//   if (!response.ok) {
//     console.log(
//       "Something went wrong while trying to fetch product brands count."
//     );
//     return {
//       data: null,
//       error: "Something went wrong while trying to fetch product brands count.",
//     };
//   }

//   const data = await response.json();
//   return { data, error: "" };
// }
