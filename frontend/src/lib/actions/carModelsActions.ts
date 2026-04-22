"use server";

import { PILL_SIZE } from "@lib/constants";
import { getToken } from "@lib/helper";
import { CreateCarModel } from "@lib/types";
import { createClient } from "@utils/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function revalidateModels() {
  revalidatePath("carModels");
}
export async function getAllCarModelsAction(pageNumber?: number) {
  const from = pageNumber ? (pageNumber - 1) * PILL_SIZE : 0; // (1-1) * 10 = 0
  const to = from + PILL_SIZE - 1;
  const query = `${supabaseUrl}/rest/v1/carModels?select=*,carGenerations(*)&order=created_at.asc&carGenerations.order=created_at.desc`;
  const headers = {
    apikey: `${supabaseKey}`,
    Authorization: `Bearer ${supabaseKey}`,
    Prefer: "count=exact",
  } as Record<string, string>;

  if (!pageNumber) {
    headers.Range = `${from}-${to}`;
  }
  const response = await fetch(query, {
    method: "GET",
    headers,
    next: { tags: ["carModels"] },
  });

  if (!response.ok) {
    const error =
      (await response.json()).message ||
      "Something went wrong while grabbing the car models data.";
    return {
      data: null,
      error,
    };
  }
  const count = response.headers.get("content-range")?.split("/")[1] || 0;

  const data = await response.json();

  return { data: { models: data, count }, error: "" };
}

export async function createCarModelAction(carModel: CreateCarModel) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("carModels")
    .insert([carModel])
    .select();

  if (error)
    return {
      data: null,
      error: error.message,
    };

  revalidateTag("carModels");

  return { data, error: "" };
}

export async function editCarModelAction({
  carModel,
  id,
}: {
  carModel: { name: string; notes: string };
  id: number;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("carModels")
    .update(carModel)
    .eq("id", id);

  if (error) return { data: null, error: error.message };

  revalidateTag("carModels");
}

export async function deleteCarModelAction(id: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("carModels").delete().eq("id", id);

  if (error) return error.message;
  revalidateTag("carModels");
}

export async function getCarModelsCountAction() {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };
  const response = await fetch(`${process.env.API_URL}/api/carmodels/count`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return {
      data: null,
      error: "Something went wrong while trying to fetch car models count.",
    };
  }

  const data = await response.json();
  return { data, error: "" };
}

/*


"use server";

import { PILL_SIZE } from "@lib/constants";
import { getToken } from "@lib/helper";
import { CarModel, CreateCarModel } from "@lib/types";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function getAllCarModelsAction(pageNumber?: number) {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };

  let query = `${process.env.API_URL}/api/carmodels`;
  if (pageNumber)
    query = query + `?PageSize=${PILL_SIZE}&PageNumber=${pageNumber}`;
  const response = await fetch(query, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: { tags: ["carModels"] },
  });

  if (!response.ok) {
    return {
      data: null,
      error: "Something went wrong while trying to fetch cars info data.",
    };
  }

  const data = await response.json();
  return { data, error: "" };
}

export async function createCarModelAction(carModel: CreateCarModel) {
  const token = getToken();
  if (!token) redirect("/login");
  const response = await fetch(`${process.env.API_URL}/api/carmodels`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json",
    },
    body: JSON.stringify(carModel),
  });
  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }

    return {
      data: null,
      error: "Something went wrong while creating the car model.",
    };
  }

  revalidateTag("carModels");

  return { data: null, error: "" };
}

export async function editCarModelAction({
  carModel,
  id,
}: {
  carModel: { name: string; notes: string };
  id: number;
}) {
  const token = getToken();
  if (!token) redirect("/login");
  const response = await fetch(`${process.env.API_URL}/api/carmodels/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json",
    },
    body: JSON.stringify(carModel),
  });
  if (!response.ok) {
    if (response.status === 409) {
      return { data: null, error: (await response.json()).message };
    }

    return {
      data: null,
      error: "Something went wrong while creating the car model.",
    };
  }

  revalidateTag("carModels");
}

export async function deleteCarModelAction(id: number) {
  const token = getToken();
  if (!token) redirect("/login");
  const response = await fetch(`${process.env.API_URL}/api/carmodels/${id}`, {
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

    return {
      data: null,
      error: "Something went wrong while creating the car model.",
    };
  }

  // const data = await response.json();
  // return data;
  revalidateTag("carModels");
}

export async function getCarModelsCountAction() {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };
  const response = await fetch(`${process.env.API_URL}/api/carmodels/count`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return {
      data: null,
      error: "Something went wrong while trying to fetch car models count.",
    };
  }

  const data = await response.json();
  return { data, error: "" };
}
*/
