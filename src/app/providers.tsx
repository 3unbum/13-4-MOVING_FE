import { QueryProvider } from "@/providers/query-provider";
import { type ReactNode } from "react";
import { AuthProvider } from "@/providers/auth-provider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
