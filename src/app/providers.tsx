import { QueryProvider } from "@/providers/query-provider";
import { type PropsWithChildren } from "react";
// import { AuthProvider } from "@/providers/auth-provider";

export default function Providers({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      {/* <AuthProvider> */}
      {children}
      {/* </AuthProvider> */}
    </QueryProvider>
  );
}
