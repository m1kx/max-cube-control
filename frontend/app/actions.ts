"use server";

import { cookies } from "next/headers";
import {
  BaseResponse,
  ConnectBody,
  CronsResponse,
  DevicesResponse,
  DisconnectBody,
  NewCronBody,
  SetTemperatureBody,
} from "./util/types";

const baseUrl = process.env.BASE_API_URL;

const getAuth = async () => {
  const cookieStore = await cookies();
  return {
    Authorization: `Bearer ${
      decodeURIComponent(
        cookieStore.get("site-access-token")?.value ?? "",
      )
    }`,
  };
};

export const setTemperature = async (body: SetTemperatureBody) => {
  const response = await fetch(`${baseUrl}/settemperature`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: await getAuth(),
  });
  const json: BaseResponse = await response.json();
  if (!json.success) {
    console.log(json);
  }
  return json;
};

export const getAllCrons = async (): Promise<CronsResponse> => {
  const response = await fetch(`${baseUrl}/crons`, {
    headers: await getAuth(),
  });
  const json: CronsResponse = await response.json();
  if (!json.success) {
    console.log(json);
  }
  return json;
};

export const getAllDevices = async (): Promise<DevicesResponse> => {
  const response = await fetch(`${baseUrl}/devices`, {
    headers: await getAuth(),
  });
  const json: DevicesResponse = await response.json();
  if (!json.success) {
    console.log(json);
  }
  return json;
};

export const connectNewDevice = async (
  connectData: ConnectBody,
): Promise<BaseResponse> => {
  const response = await fetch(`${baseUrl}/connect`, {
    method: "POST",
    body: JSON.stringify(connectData),
    headers: await getAuth(),
  });
  const json: BaseResponse = await response.json();
  if (!json.success) {
    console.log(json);
  }
  return json;
};

export const disconnectDevice = async (
  disconnectData: DisconnectBody,
): Promise<BaseResponse> => {
  const response = await fetch(`${baseUrl}/disconnect`, {
    method: "POST",
    body: JSON.stringify(disconnectData),
    headers: await getAuth(),
  });
  const json: BaseResponse = await response.json();
  if (!json.success) {
    console.log(json);
  }
  return json;
};

export const addNewCron = async (cronData: NewCronBody): Promise<void> => {
  const response = await fetch(`${baseUrl}/newcron`, {
    method: "POST",
    body: JSON.stringify(cronData),
    headers: await getAuth(),
  });
  await response.text();
};

export const updateCron = async (
  cronData: Partial<NewCronBody>,
): Promise<void> => {
  const response = await fetch(`${baseUrl}/updatecron`, {
    method: "POST",
    body: JSON.stringify(cronData),
    headers: await getAuth(),
  });
  await response.text();
};

export const deleteCron = async (cronName: string): Promise<void> => {
  const response = await fetch(`${baseUrl}/removecron`, {
    method: "POST",
    body: JSON.stringify({ name: cronName }),
    headers: await getAuth(),
  });
  await response.text();
};
