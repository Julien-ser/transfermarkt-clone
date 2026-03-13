"use client";

import { useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface UseAuthOptions {
  redirectTo?: string;
  redirectIfFound?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session && options.redirectTo) {
      router.push(options.redirectTo);
    } else if (session && options.redirectIfFound) {
      router.push(options.redirectTo || "/");
    }

    setIsLoading(false);
  }, [session, status, router, options.redirectTo, options.redirectIfFound]);

  return {
    session,
    status,
    isLoading: isLoading || status === "loading",
    isAuthenticated: !!session,
  };
}

// Higher-order component for protecting routes
export function withAuth<T extends Record<string, unknown>>(
  Component: (props: T) => ReactNode,
  options: UseAuthOptions = { redirectTo: "/login" }
) {
  return function AuthenticatedComponent(props: T) {
    const { isLoading, isAuthenticated } = useAuth(options);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}

// Component-based protection
export function ProtectedRoute({
  children,
  redirectTo = "/login",
  redirectIfFound,
}: {
  children: ReactNode;
  redirectTo?: string;
  redirectIfFound?: boolean;
}) {
  const { isLoading, isAuthenticated } = useAuth({
    redirectTo: redirectIfFound ? undefined : redirectTo,
    redirectIfFound,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated && !redirectIfFound) {
    return null;
  }

  if (isAuthenticated && redirectIfFound) {
    return null;
  }

  return <>{children}</>;
}
