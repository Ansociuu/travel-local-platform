"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const user = searchParams.get("user");

    if (token && user) {
      try {
        localStorage.setItem("token", token);
        localStorage.setItem("user", user); // user is already stringified from backend
        
        // Success! Redirect to home
        router.push("/");
        router.refresh();
      } catch (error) {
        console.error("Failed to parse user data from Google login", error);
        router.push("/login?error=social_auth_failed");
      }
    } else {
      router.push("/login?error=missing_data");
    }
  }, [router, searchParams]);

  return (
    <div style={{ 
      height: "60vh", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center",
      gap: "20px"
    }}>
      <Loader2 size={48} className="animate-spin" style={{ color: "#0d9488" }} />
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>Đang hoàn tất đăng nhập</h2>
        <p style={{ color: "#64748b" }}>Vui lòng đợi trong giây lát...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={48} className="animate-spin" style={{ color: "#0d9488" }} />
      </div>
    }>
      <AuthCallbackHandler />
    </Suspense>
  );
}
