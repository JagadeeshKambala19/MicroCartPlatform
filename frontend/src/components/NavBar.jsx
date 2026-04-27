import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Container from "./Container.jsx";
import Button from "./Button.jsx";
import { clearSession, getSession } from "../api/auth.js";

export default function NavBar() {
  const nav = useNavigate();
  const session = getSession();
  const username = session?.user?.username || "guest";
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setCompact(window.scrollY > 6);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={["navBar", compact ? "navBarCompact" : ""].filter(Boolean).join(" ")}>
      <div className="navPillWrap">
        <div className="navPill">
          <Container>
            <div className="navInner">
              <Link to="/" className="navBrand" aria-label="Home">
                <span className="navDot" aria-hidden="true" />
                <span className="navBrandText">MicroCart</span>
              </Link>

              <nav className="navLinks" aria-label="Primary">
                <TopLink to="/">Home</TopLink>
                <TopLink to="/products">Products</TopLink>
                <TopLink to="/cart">Cart</TopLink>
                <TopLink to="/orders">Orders</TopLink>
              </nav>

              <div className="navUser">
                <span className="navUsername">{username}</span>
                <Button
                  variant="ghost"
                  className="btnSm"
                  onClick={() => {
                    clearSession();
                    nav("/login");
                  }}
                >
                  Log out
                </Button>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
}

function TopLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => ["topLink", isActive ? "topLinkActive" : ""].filter(Boolean).join(" ")}
    >
      {children}
    </NavLink>
  );
}
