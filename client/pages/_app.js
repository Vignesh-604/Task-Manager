import "@/styles/globals.css";
import { decrypt, useUserStore } from "@/utils/store";
import { useEffect } from "react";

export default function App({ Component, pageProps }) {
  const setUser = useUserStore((state) => state.setUser)

  useEffect(() => {
    const user = decrypt()
    if (user) setUser(user)
  }, [])

  return <Component {...pageProps} />;
}
