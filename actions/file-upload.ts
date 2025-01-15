"use server";

import { getFileUploadClient } from "./axios-clients";

export const uploadFile = async (formData: FormData) => {
  const axiosClient = await getFileUploadClient();
  try {
    const response = await axiosClient.post("/method/upload_file", formData);
    return response.data.data;
  } catch (error) {
    console.error("Error uploading file", error);
    throw error;
  }
};
