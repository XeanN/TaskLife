export type User = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: "email" | "google";
} | null;

export type GoogleUserInfo = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};
