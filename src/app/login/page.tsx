"use client";

import { auth } from "@/src/backend/infrastructure/auth/auth";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      alert("Invalid Credentials");
      return;
    }

   

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      Email <input onChange={(e) => setEmail(e.target.value)} />

      password  <input
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={login}>
        Login
      </button>
    </>
  );
}