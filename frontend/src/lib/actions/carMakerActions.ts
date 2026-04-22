"use server";

import { MAKER_PAGE_SIZE } from "@lib/constants";
import { getToken } from "@lib/helper";
import { CarMakersData } from "@lib/types";
import { createClient } from "@utils/supabase/server";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function getCarBrandsAction(): Promise<{
  carBrands: CarMakersData[] | null;
  error: string;
}> {
  const supabase = await createClient();
  const { data: carBrands, error } = await supabase
    .from("carMakers")
    .select("*,carModels(*,carGenerations(*))")
    .order("created_at", { ascending: false })
    .order("created_at", {
      referencedTable: "carModels",
      ascending: true,
    });

  if (error) return { carBrands: null, error: error.message };

  return { carBrands, error: "" };
}
export async function getAllCarMakersAction(pageNumber?: number): Promise<{
  data: CarMakersData[] | null;
  error: string;
}> {
  // const token = getToken();

  // if (!token)
  //   return { data: null, error: "You are not authorized to make this action." };
  try {
    const query = `${supabaseUrl}/rest/v1/carMakers?select=*,carModels(*,carGenerations(*))&order=created_at.desc&carModels.order=created_at.asc`;
    let headers;
    if (pageNumber) {
      const from = (Number(pageNumber) - 1) * MAKER_PAGE_SIZE; // (1-1) * 10 = 0

      const to = from + MAKER_PAGE_SIZE - 1; // 0 + 10 - 1 = 9
      headers = {
        apikey: `${supabaseKey}`,
        Authorization: `Bearer ${supabaseKey}`,
        Range: `${from}-${to}`,
      };
    } else {
      headers = {
        apikey: `${supabaseKey}`,
        Authorization: `Bearer ${supabaseKey}`,
      };
    }

    const response = await fetch(query, {
      method: "GET",
      headers,
      next: { tags: ["carMakers"] },
    });

    if (!response.ok) {
      const error =
        (await response.json()).message ||
        "Something went wrong while trying to fetch car makers data.";

      console.log(`Error in getAllCarMakersAction: ${error}`);
      throw new Error(`Faield to get the car makers data: ${error}`);
    }

    const data = await response.json();

    return { data, error: "" };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}
// Create a car maker.

export async function createCarMakerAction(formData: FormData) {
  const token = getToken();
  if (!token) redirect("/login");

  const response = await fetch(`${process.env.API_URL}/api/CarMakers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }

    return {
      data: null,
      error: "Something went wrong while creating the car maker.",
    };
  }

  // revalidatePath("/dashboard/insert-data");
  revalidateTag("carMakers");
  const data = await response.json();
  return { data, error: "" };
}

export async function revalidateMakers() {
  revalidateTag("carMakers");
}
export async function editCarMakerAction(formData: FormData, id: number) {
  const token = getToken();
  if (!token) redirect("/login");
  const response = await fetch(`${process.env.API_URL}/api/CarMakers/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }

    throw new Error("Something went wrong!");
  }

  revalidateTag("carMakers");
}

export async function deleteCarMakerAction(id: string) {
  const token = getToken();
  if (!token) redirect("/login");
  const response = await fetch(`${process.env.API_URL}/api/carmakers/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json",
    },
  });
  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }

    return { data: null, error: "Something went wrong!" };
  }
  revalidateTag("carMakers");
}

export async function getCarMakerCountAction() {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };
  const response = await fetch(`${process.env.API_URL}/api/carmakers/count`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return {
      data: null,
      error: "Something went wrong while trying to fetch car makers count.",
    };
  }

  const data = await response.json();
  return { data, error: "" };
}

// export async function getAllCarBrandsAction(pageNumber?: number) {
//   let query = `${supabaseUrl}?/carMakers?select=*,carModels(*,carGenerations(*))`;

//   let headers;

//   if (pageNumber) {
//     const from = (Number(pageNumber) - 1) * MAKER_PAGE_SIZE; // (1-1) * 10 = 0

//     const to = from + MAKER_PAGE_SIZE - 1; // 0 + 10 - 1 = 9
//     headers = {
//       apiKey: `${supabaseKey}`,
//       Authorization: `Bearer ${supabaseKey}`,
//       Range: `${from}-${to}`,
//     };
//   } else {
//     headers = {
//       apiKey: `${supabaseKey}`,
//       Authorization: `Bearer ${supabaseKey}`,
//     };
//   }
// }

/*

"use server";
import { MAKER_PAGE_SIZE } from "@lib/constants";
import { getToken } from "@lib/helper";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function getAllCarMakersAction(pageNumber?: number) {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  let query = `${process.env.API_URL}/api/CarMakers`;

  if (pageNumber)
    query = query + `?PageSize=${MAKER_PAGE_SIZE}&PageNumber=${pageNumber}`;

  const response = await fetch(query, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: { tags: ["carMakers"] },
  });

  if (!response.ok) {
    return {
      data: null,
      error: "Something went wrong while trying to fetch car makers data.",
    };
  }

  const data = await response.json();
  return { data, error: "" };
}

export async function createCarMakerAction(formData: FormData) {
  const token = getToken();
  if (!token) redirect("/login");

  const response = await fetch(`${process.env.API_URL}/api/CarMakers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }

    return {
      data: null,
      error: "Something went wrong while creating the car maker.",
    };
  }

  // revalidatePath("/dashboard/insert-data");
  revalidateTag("carMakers");
  const data = await response.json();
  return { data, error: "" };
}

export async function editCarMakerAction(formData: FormData, id: number) {
  const token = getToken();
  if (!token) redirect("/login");
  const response = await fetch(`${process.env.API_URL}/api/CarMakers/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }

    throw new Error("Something went wrong!");
  }

  revalidateTag("carMakers");
}

export async function deleteCarMakerAction(id: string) {
  const token = getToken();
  if (!token) redirect("/login");
  const response = await fetch(`${process.env.API_URL}/api/carmakers/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json",
    },
  });
  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }

    return { data: null, error: "Something went wrong!" };
  }
  revalidateTag("carMakers");
}

export async function getCarMakerCountAction() {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };
  const response = await fetch(`${process.env.API_URL}/api/carmakers/count`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return {
      data: null,
      error: "Something went wrong while trying to fetch car makers count.",
    };
  }

  const data = await response.json();
  return { data, error: "" };
}
*/
