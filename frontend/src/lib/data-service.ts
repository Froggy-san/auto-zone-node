import { getAllCarGenerationsAction } from "./actions/carGenerationsActions";
import { getToken } from "./helper";

export async function getAllCategories() {
  // await new Promise((res) => setTimeout(res, 9000));
  // const token = getToken();

  // if (!token) throw new Error("You are not authorized to make this action.");
  const response = await fetch(`${process.env.API_URL}/api/categories`, {
    method: "GET",
    // headers: {
    //   Authorization: `Bearer ${token}`,
    // },
  });

  if (!response.ok) {
    throw new Error(
      "Something went wrong while trying to fetch categories data."
    );
  }

  const data = await response.json();
  return data;
}

export async function getAllCarsInfo() {
  const token = getToken();

  if (!token) throw new Error("You are not authorized to make this action.");
  const response = await fetch(`${process.env.API_URL}/api/carinfos`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      "Something went wrong while trying to fetch cars info data."
    );
  }

  const data = await response.json();
  return data;
}

export async function getAllProductTypes() {
  const token = getToken();

  if (!token) throw new Error("You are not authorized to make this action.");
  const response = await fetch(`${process.env.API_URL}/api/producttypes`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      "Something went wrong while trying to fetch product types data."
    );
  }

  const data = await response.json();
  return data;
}

export async function getAllProductBrands() {
  const token = getToken();

  if (!token) throw new Error("You are not authorized to make this action.");
  const response = await fetch(`${process.env.API_URL}/api/productbrands`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      "Something went wrong while trying to fetch product brands data."
    );
  }

  const data = await response.json();
  return data;
}

export async function getProductFormReleventData() {
  try {
    const [categories, carInfos, carBrands, brandTypes] = await Promise.all([
      getAllCategories(),
      getAllCarsInfo(),
      getAllProductBrands(),
      getAllProductTypes(),
    ]);

    return { categories, carInfos, carBrands, brandTypes };
  } catch (error) {
    console.error("Error fetching product form relevant data:", error);
    throw new Error("Failed to fetch product form relevant data.");
  }
}

export async function createCarMakerAction(formData: FormData) {
  const token = getToken();
  if (!token) throw new Error("You are not Authorized to make this action.");

  const response = await fetch(`${process.env.API_URL}/api/carmakers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Something went wrong!");
  }

  const data = await response.json();
  return data;
}

// export async function getCarGenerations(page: number) {
//   const { data, error } = await getAllCarGenerationsAction({ page });
//   if (error) throw new Error(error);

//   return data;
// }
