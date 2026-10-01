import { QueryProvider } from "@/providers/QueryProvider";
import { type ReactNode } from "react";
import { AuthProvider } from "@/providers/AuthProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
