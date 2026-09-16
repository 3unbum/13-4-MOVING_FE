import { cookieFetch } from "@/lib/utils/api-client";
import type {
  CustomerProfileFormValues,
  MoverProfileFormValues,
} from "@/lib/schemas/profile-schema";

export interface ProfileImageUploadResult {
  imageUrl: string;
}

export interface CustomerProfileResponse {
  id: number;
  userId: number;
  image: string | null;
  region: string;
  services: string[];
}

export interface MoverProfileResponse {
  id: number;
  userId: number;
  image: string | null;
  nickName: string;
  career: number;
  bio: string;
  description: string;
  services: string[];
  regions: string[];
}

export const profileService = {
  // multipart/form-data라 FormData로 보낸다 — api-client가 FormData면 Content-Type을 안 건드려준다
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return cookieFetch<ProfileImageUploadResult>("/profiles/image", {
      method: "POST",
      body: formData,
    });
  },

  registerCustomer: (payload: CustomerProfileFormValues) =>
    cookieFetch<CustomerProfileResponse>("/profiles/customer", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  registerMover: (payload: MoverProfileFormValues) =>
    cookieFetch<MoverProfileResponse>("/profiles/mover", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
