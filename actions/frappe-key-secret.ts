"use server";
import { auth } from "@/auth";
import { getData } from "./crud-actions";
import { THERMAX_USER_API, USER_API } from "@/configs/api-endpoints";

export const getFrappeToken = async () => {
  const session = await auth();
  const email = session?.userInfo?.email;
  const user = await getData(
    `${THERMAX_USER_API}/${email}?fields=["hashed_token"]`
  );
  const token = user?.hashed_token;
  return token;
};

export const getFrappeAdminToken = async () => {
  return `token ${process.env.FRAPPE_ADMIN_AUTH_KEY}:${process.env.FRAPPE_ADMIN_AUTH_SECRET}`;
};

export const getFrappeBaseUrl = () => {
  return process.env.FRAPPE_BASE_URL;
};

export const getAuthSecretToken = () => {
  return process.env.AUTH_SECRET;
};
