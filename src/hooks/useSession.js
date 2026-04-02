import { useEffect, useState } from "react";
import { getStoredSession } from "../utils/authStorage";

export function useSession() {
  const [session, setSession] = useState(() => getStoredSession());

  useEffect(() => {
    function syncSession() {
      setSession(getStoredSession());
    }

    window.addEventListener("storage", syncSession);
    window.addEventListener("auth-changed", syncSession);

    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("auth-changed", syncSession);
    };
  }, []);

  return session;
}
