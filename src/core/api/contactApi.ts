import { apiClient } from "./client";
import type { ApiResponse, CreateContactInput } from "@ipartydjs/shared";

export const sendContactMessage = async (data: CreateContactInput) => {
  const response = await apiClient.post<ApiResponse<void>>("/contacto", data);
  return response.data;
};
