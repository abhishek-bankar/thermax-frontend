"use server";

import { AuthError } from "next-auth";
import * as z from "zod";
import { signIn } from "@/auth";
import { SignInSchema } from "@/configs/schemas";
import { getData, updateData } from "./crud-actions";
import { THERMAX_USER_API, USER_API } from "@/configs/api-endpoints";
import { adminApiClient } from "./axios-clients";
import bcrypt from "bcryptjs";

const handleAPIError = (error: any) => {
  if (error.isAxiosError) {
    throw new Error(
      JSON.stringify({
        message:
          error.response?.data?.errors[0]?.message || "Not able to catch error",
        type: error.response?.data?.errors[0]?.type || "Unknown error type",
        status: error.response?.status,
      })
    );
  } else {
    throw new Error(
      JSON.stringify({
        message: "Error is not related to axios",
        type: "Non-Axios error",
        status: "500",
      })
    );
  }
};

export const createFrappeApiKeys = async (email: string) => {
  try {
    const { data } = await adminApiClient.post(
      `/method/frappe.core.doctype.user.user.generate_keys?user=${email}`
    );
    const { api_secret } = data?.data;
    return api_secret;
  } catch (error) {
    handleAPIError(error);
  }
};

export const generateNewFrappeToken = async (email: string) => {
  const user = await getData(`${USER_API}/${email}`);
  const api_key = user?.api_key;
  const api_secret = await createFrappeApiKeys(email as string);
  const token = `token ${api_key}:${api_secret}`;
  await updateData(`${THERMAX_USER_API}/${email}`, true, {
    hashed_token: token,
  });
};
