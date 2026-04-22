"use server";

import { PILL_SIZE } from "@lib/constants";
import { getToken } from "@lib/helper";
import { CarGeneration } from "@lib/types";
import { revalidateTag } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function revalidateCarGenerations() {
  revalidateTag("carGenerations");
}

export async function getAllCarGenerationsAction(page?: number) {
  const from = page ? (page - 1) * PILL_SIZE : 0;
  const to = from + PILL_SIZE - 1;
  const query = `${supabaseUrl}/rest/v1/carGenerations?select=*&order=created_at.asc`;
  const headers = {
    apikey: `${supabaseKey}`,
    Authorization: `Bearer ${supabaseKey}`,
    Prefer: "count=exact",
  } as Record<string, string>;

  if (!page) {
    headers.Range = `${from}-${to}`;
  }

  const response = await fetch(query, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const error =
      (await response.json()).message || "Failed to get the generations data.";

    return {
      data: null,
      error,
    };
  }

  const carGenerationsData = await response.json();

  const count = response.headers.get("content-range")?.split("/")[1] || 0;

  return { data: { carGenerationsData, count }, error: "" };
}

export async function createCarGenerationAction(generations: CarGeneration) {
  const response = await fetch(`${supabaseUrl}/rest/v1/carGenerations`, {
    method: "POST",
    headers: {
      apikey: `${supabaseKey}`,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(generations),
  });
  if (!response.ok) {
    const error =
      (await response.json()).message || "Failed to create a new generation";

    return { data: null, error };
  }

  const data = await response.json();
  return { data, error: "" };
}

export async function editCarGenerationAction({
  generation,
  id,
}: {
  generation: { name: string; notes: string };
  id: number;
}) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/carGenerations?id=eq.${id}`,
    {
      method: "PUT",
      headers: {
        apikey: `${supabaseKey}`,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(generation),
    }
  );
  if (!response.ok) {
    const error =
      (await response.json()).message ||
      "Failed to edit t the generation data.he generation data.";

    return { data: null, error };
  }

  return { data: null, error: "" };
}

export async function deleteCarGenerationAction(id: number) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/carGenerations?id=eq.${id}`,
    {
      method: "DELETE",
      headers: {
        apikey: `${supabaseKey}`,
        Authorization: `Bearer ${supabaseKey}`,
      },
    }
  );
  if (!response.ok) {
    const error =
      (await response.json()).message ||
      "Failed to delete the generation data. ";
  }
}

export async function getCarGenerationCountAction() {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };
  const response = await fetch(
    `${process.env.API_URL}/api/cargenerations/count`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    return {
      data: null,
      error: "Something went wrong while trying to fetch car generations data.",
    };
  }

  const data = await response.json();
  return { data, error: "" };
}

// export async function getAllCarGenerationsAction(page?: number) {
//   const token = getToken();

//   if (!token)
//     return { data: null, error: "You are not authorized to make this action." };

//   let query = `${process.env.API_URL}/api/CarGenerations`;
//   if (page) query = query + `?PageNumber=${page}&PageSize=${PILL_SIZE}`;

//   const response = await fetch(query, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) {
//     return {
//       data: null,
//       error: "Something went wrong while trying to fetch car generations data.",
//     };
//   }

//   const carGenerationsData = await response.json();

//   let countData;

//   if (page) {
//     const count = await getCarGenerationCountAction();
//     countData = count.data;
//   }

//   return { data: { carGenerationsData, count: countData }, error: "" };
// }

// export async function createCarGenerationAction(generations: CarGeneration) {
//   const token = getToken();
//   if (!token) redirect("/login");
//   const response = await fetch(`${process.env.API_URL}/api/cargenerations`, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-type": "application/json",
//     },
//     body: JSON.stringify(generations),
//   });
//   if (!response.ok) {
//     if (response.status === 409) {
//       return { data: null, error: (await response.json()).message };
//     }

//     return { data: null, error: "Something went wrong!" };
//   }

//   const data = await response.json();
//   return { data, error: "" };
// }

// export async function editCarGenerationAction({
//   generation,
//   id,
// }: {
//   generation: { name: string; notes: string };
//   id: number;
// }) {
//   const token = getToken();
//   if (!token) redirect("/login");
//   const response = await fetch(
//     `${process.env.API_URL}/api/cargenerations/${id}`,
//     {
//       method: "PUT",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-type": "application/json",
//       },
//       body: JSON.stringify(generation),
//     }
//   );
//   if (!response.ok) {
//     if (response.status === 409) {
//       return { data: null, error: (await response.json()).message };
//     }

//     return { data: null, error: "Something went wrong!" };
//   }

//   // const data = await response.json();
//   // return data;

//   return { data: null, error: "" };
// }

// export async function deleteCarGenerationAction(id: number) {
//   const token = getToken();
//   if (!token) redirect("/login");
//   const response = await fetch(
//     `${process.env.API_URL}/api/CarGenerations/${id}`,
//     {
//       method: "DELETE",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-type": "application/json",
//       },
//     }
//   );
//   if (!response.ok) {
//     const errorMessage =
//       response.status === 409
//         ? (await response.json()).message
//         : "Failed to delete the generation data. car generation data.";

//     throw new Error(errorMessage);
//   }

//   // const data = await response.json();
//   // return data;
// }

// export async function getCarGenerationCountAction() {
//   const token = getToken();

//   if (!token)
//     return { data: null, error: "You are not authorized to make this action." };
//   const response = await fetch(
//     `${process.env.API_URL}/api/cargenerations/count`,
//     {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

//   if (!response.ok) {
//     return {
//       data: null,
//       error: "Something went wrong while trying to fetch car generations data.",
//     };
//   }

//   const data = await response.json();
//   return { data, error: "" };
// }
