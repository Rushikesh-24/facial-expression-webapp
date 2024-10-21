import React, { useEffect, useState } from "react";

interface UseAuthProps {
  code: string;
}

const UseAuth: React.FC<UseAuthProps> = ({ code }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);

  useEffect(() => {
    if(!code) return;
    fetch("/api/getUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setExpiresIn(data.expiresIn);
        window.history.pushState({}, "", "/");
      })
      .catch((error) => {
        console.error("Error:", error);
        window.location.href = "/";
      });
  }, [code]);


  useEffect(() => {
    if (!refreshToken || !expiresIn) return;
    const interval = setInterval(() => {
      fetch("/api/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setAccessToken(data.accessToken);
          setRefreshToken(data.refreshToken);
          setExpiresIn(data.expiresIn);
        })
        .catch((error) => {
          console.error("Error:", error);
          window.location.href = "/";
        });
    }, (expiresIn - 60) * 1000);
    return () => clearInterval(interval);
  }, [refreshToken, expiresIn]);


  return accessToken;
};

export default UseAuth;
