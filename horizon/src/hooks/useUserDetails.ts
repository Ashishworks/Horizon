import { useState, useEffect } from "react";

export function useUserDetails() {
  const [userName, setUserName] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/userdetails");
        if (!response.ok) throw new Error("Failed to fetch user");
        
        const data = await response.json();
        setUserName(data.name);
      } catch (err) {
        console.error("User fetch error:", err);
        setUserName(null);
      } finally {
        setUserLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { userName, userLoading };
}