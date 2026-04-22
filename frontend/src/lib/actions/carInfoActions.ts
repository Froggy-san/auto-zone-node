"use server";

import { getToken } from "@lib/helper";
import { CarInfo } from "@lib/types";

export async function getAllCarsInfoAction() {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };
  const response = await fetch(`${process.env.API_URL}/api/carinfos`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
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

export async function createCarInfoAction(carInfo: CarInfo) {
  const token = getToken();
  if (!token) throw new Error("You are not Authorized to make this action.");
  const response = await fetch(`${process.env.API_URL}/api/carinfos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json",
    },
    body: JSON.stringify(carInfo),
  });
  if (!response.ok) {
    throw new Error("Something went wrong!");
  }

  // const data = await response.json();
  // return data;
}

export async function editCarInfoAction({
  carInfo,
  id,
}: {
  carInfo: CarInfo;
  id: string;
}) {
  const token = getToken();
  if (!token) throw new Error("You are not Authorized to make this action.");
  const response = await fetch(`${process.env.API_URL}/api/carinfos/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json",
    },
    body: JSON.stringify(carInfo),
  });
  if (!response.ok) {
    throw new Error("Something went wrong!");
  }

  const data = await response.json();
  return data;
}

export async function deleteCarInfoAction(id: string) {
  const token = getToken();
  if (!token) throw new Error("You are not Authorized to make this action.");
  const response = await fetch(`${process.env.API_URL}/api/carinfos/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Something went wrong!");
  }

  const data = await response.json();
  return data;
}

export async function getCarInfoCountAction() {
  const token = getToken();

  if (!token)
    return { data: null, error: "You are not authorized to make this action." };
  const response = await fetch(`${process.env.API_URL}/api/carinfos/count`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return {
      data: null,
      error: "Something went wrong while trying to fetch car infos count.",
    };
  }

  const data = await response.json();
  return { data, error: "" };
}
