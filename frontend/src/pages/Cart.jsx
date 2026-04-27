import React, { useEffect, useMemo, useState } from "react";
import Container from "../components/Container.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import { clearCart, getCart, removeCartItem } from "../api/cart.js";
import { money } from "../api/client.js";
import { useNavigate } from "react-router-dom";
import useReveal from "../hooks/useReveal.js";

export default function Cart() {
  useReveal();
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const rows = await getCart();
      setItems(rows);
    } catch (e) {
      setError(e.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const total = useMemo(() => {
    let sum = 0;
    for (const i of items) sum += Number(i.price) * Number(i.quantity);
    return Math.round(sum * 100) / 100;
  }, [items]);

  return (
    <Container>
      <header className="pageHeader">
        <p className="pageEyebrow" data-reveal>
          Your Cart
        </p>

        <h1 className="pageTitle" data-reveal>
          Review your items
        </h1>

        <p className="pageSub" data-reveal>
          Check your selected products, update quantities, or remove items before placing your order.
        </p>
      </header>

      <div className="grid2">
        {/* LEFT: CART ITEMS */}
        <Card className="cardHover" data-reveal>
          <div className="cardTitleRow">
            <div className="cardTitle">Cart Items</div>
            <span className="cardMeta">
              {loading ? "Loading..." : `${items.length} item${items.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          <div className="hr" />

          {error ? (
            <div className="errorText" style={{ marginBottom: 10 }}>
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="muted">Loading your cart...</div>
          ) : items.length ? (
            <div className="cartRows">
              {items.map((i) => (
                <div key={i.id} className="cartRow" data-reveal>
                  <div className="cartRowMedia">
                    <img
                      src={i.image_url || "/images/iphone.svg"}
                      alt={i.name}
                    />
                  </div>

                  <div className="cartRowBody">
                    <div className="cartRowTop">
                      <div className="cartRowTitle">{i.name}</div>
                      <div className="cartRowCost">
                        {money(Number(i.price) * Number(i.quantity))}
                      </div>
                    </div>

                    <div className="cartRowDesc">
                      Product ID: #{i.product_id}
                    </div>

                    <div className="cartRowMeta">
                      <div className="cartRowMetaItem">
                        <span className="cartRowMetaLabel">Unit Price</span>
                        <span className="cartRowMetaValue">
                          {money(i.price)}
                        </span>
                      </div>

                      <div className="cartRowMetaItem">
                        <span className="cartRowMetaLabel">Quantity</span>
                        <span className="cartRowMetaValue">
                          {i.quantity}
                        </span>
                      </div>

                      <div className="cartRowMetaItem">
                        <span className="cartRowMetaLabel">Total</span>
                        <span className="cartRowMetaValue">
                          {money(Number(i.price) * Number(i.quantity))}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        onClick={async () => {
                          setBusyId(i.id);
                          try {
                            await removeCartItem(i.id);
                            await refresh();
                          } catch (e2) {
                            setError(e2.message || "Failed to remove item");
                          } finally {
                            setBusyId(null);
                          }
                        }}
                        disabled={busyId === i.id}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="muted">
              Your cart is empty. Browse products and add items to get started.
            </div>
          )}

          <div className="rowWrap" style={{ marginTop: 14 }}>
            <Button variant="ghost" onClick={() => nav("/products")}>
              Continue shopping
            </Button>

            <Button
              variant="danger"
              onClick={async () => {
                if (!confirm("Are you sure you want to clear your cart?")) return;
                try {
                  await clearCart();
                  await refresh();
                } catch (e) {
                  setError(e.message || "Failed to clear cart");
                }
              }}
              disabled={!items.length}
            >
              Clear cart
            </Button>
          </div>
        </Card>

        {/* RIGHT: SUMMARY */}
        <Card className="cardHover" data-reveal>
          <div className="cardTitle">Order Summary</div>
          <div className="hr" />

          <div className="stackSm">
            <div className="between">
              <span className="muted">Subtotal</span>
              <span>{money(total)}</span>
            </div>

            <div className="between">
              <span className="muted">Shipping</span>
              <span className="muted">Free</span>
            </div>

            <div className="between totalRow">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>

            <Button
              onClick={() => nav("/orders")}
              disabled={!items.length}
            >
              Proceed to checkout
            </Button>

            <div className="hintText">
              Your order will include all items currently in your cart.
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
}