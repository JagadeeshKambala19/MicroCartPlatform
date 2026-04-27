import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Container from "../components/Container.jsx";
import Card from "../components/Card.jsx";
import Field from "../components/Field.jsx";
import Button from "../components/Button.jsx";
import { login } from "../api/auth.js";
import useReveal from "../hooks/useReveal.js";

export default function Login() {
  useReveal();
  const nav = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <Container>
      <header className="pageHeader pageHeaderCenter">
        <p className="pageEyebrow" data-reveal>
          Account
        </p>
        <h1 className="pageTitle" data-reveal>
          Welcome back.
        </h1>
        <p className="pageSub" data-reveal>
          Sign in with any username and password. This is a local demo that auto‑creates users.
        </p>
      </header>

      <div className="authWrap">
        <Card className="cardHover" data-reveal>
          <div className="stack">
            <Field label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error ? <div className="errorText">{error}</div> : null}

            <div className="row">
              <Button
                loading={loading}
                onClick={async () => {
                  setError("");
                  setLoading(true);
                  try {
                    await login({ username, password });
                    nav(from, { replace: true });
                  } catch (e) {
                    setError(e.message || "Login failed");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Continue
              </Button>
              <span className="hintText">No account needed.</span>
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
}
