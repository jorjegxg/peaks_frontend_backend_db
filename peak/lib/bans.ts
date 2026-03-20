import { apiFetch } from "./api";

export type BannedPhone = {
  phone: string;
  reason: string | null;
  createdAt: string;
};

function getAdminHeaders(adminPassword: string): Record<string, string> {
  return {
    "x-admin-password": adminPassword,
  };
}

export async function getBannedPhones(adminPassword: string): Promise<BannedPhone[]> {
  const data = await apiFetch<{ banned: BannedPhone[] }>("/api/bans", {
    headers: getAdminHeaders(adminPassword),
  });
  return data?.banned ?? [];
}

export async function banPhone(
  adminPassword: string,
  phone: string,
  reason?: string,
): Promise<void> {
  await apiFetch<{ success: boolean }>("/api/bans", {
    method: "POST",
    headers: getAdminHeaders(adminPassword),
    body: JSON.stringify({ phone, reason }),
  });
}

export async function unbanPhone(
  adminPassword: string,
  phone: string,
): Promise<void> {
  await apiFetch<void>(`/api/bans/${encodeURIComponent(phone)}`, {
    method: "DELETE",
    headers: getAdminHeaders(adminPassword),
  });
}
