"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

import styles from "./LoginForm.module.scss";

const LoginForm = () => {
  const [password, setPassword] = useState("");
  const [passwordIncorrect, setPasswordIncorrect] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const request = await fetch(`/api/auth`, {
      body: JSON.stringify({ password }),
      headers: { "Content-Type": "application/json" },
      method: "post",
    });

    if (request.status !== 200) {
      return setPasswordIncorrect(true), setLoading(false);
    }
    router.push("/");
  };

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <input
        type="password"
        placeholder="password"
        id=""
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.input}
      />
      {passwordIncorrect && <p>Password incorrect</p>}
      <button className={styles.button} disabled={loading} type="submit">
        {loading ? "loading..." : "submit"}
      </button>
    </form>
  );
};

export default LoginForm;
