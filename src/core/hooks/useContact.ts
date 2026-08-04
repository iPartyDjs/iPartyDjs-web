import { useMutation } from "@tanstack/react-query";
import { sendContactMessage } from "../api/contactApi";
import type { CreateContactInput } from "@ipartydjs/shared";

export const useContact = () => {
  return useMutation({
    mutationFn: (data: CreateContactInput) => sendContactMessage(data),
  });
};
