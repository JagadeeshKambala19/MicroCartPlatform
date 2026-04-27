import React, { useEffect, useMemo, useState } from "react";
import Container from "../components/Container.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import { listOrders, placeOrder } from "../api/orders.js";
import { getSession } from "../api/auth.js";
import { money } from "../api/client.js";
import useReveal from "../hooks/useReveal.js";

export default function Orders() {
  useReveal();
  const session = getSession();
  const userId = session?.user?.id;
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const data = await listOrders(userId);
      setOrders(data.orders || []);
      setItems(data.items || []);
    } catch (e) {
      setError(e.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const itemsByOrder = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      const list = map.get(it.order_id) || [];
      list.push(it);
      map.set(it.order_id, list);
    }
    return map;
  }, [items]);

  return (
    <Container>
      <header className="pageHeader">
        <p className="pageEyebrow" data-reveal>
          Orders
        </p>

        <h1 className="pageTitle" data-reveal>
          Your order history
        </h1>

        <p className="pageSub" data-reveal>
          Review your past orders and place new ones using the items in your cart.
        </p>
      </header>

      <div className="grid2">
        {/* LEFT: PLACE ORDER */}
        <Card className="cardHover" data-reveal>
          <div className="cardTitleRow">
            <div className="cardTitle">Checkout</div>
            <span className="cardMeta">
              Account ID: #{userId}
            </span>
          </div>

          <div className="hr" />

          {error ? (
            <div className="errorText" style={{ marginBottom: 10 }}>
              {error}
            </div>
          ) : null}

          <Button
            loading={placing}
            onClick={async () => {
              setError("");
              setPlacing(true);
              try {
                await placeOrder(userId);
                await refresh();
              } catch (e) {
                setError(e.message || "Failed to place order");
              } finally {
                setPlacing(false);
              }
            }}
          >
            Place order
          </Button>

          <div className="hintText" style={{ marginTop: 12 }}>
            This will create a new order using the items currently in your cart.
          </div>
        </Card>

        {/* RIGHT: ORDER HISTORY */}
        <Card className="cardHover" data-reveal>
          <div className="cardTitleRow">
            <div className="cardTitle">Order History</div>
            <span className="cardMeta">
              {loading ? "Loading..." : `${orders.length} order${orders.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          <div className="hr" />

          {loading ? (
            <div className="muted">Loading your orders...</div>
          ) : orders.length ? (
            <div className="stack">
              {orders.map((o) => (
                <div key={o.id} className="orderItem" data-reveal>
                  <div className="orderTop">
                    <div>
                      <div className="listItemTitle">
                        Order #{o.id}
                      </div>
                      <div className="cardMeta">
                        Placed on {new Date(o.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="orderTotal">
                      {money(o.total_price)}
                    </div>
                  </div>

                  <div className="stackSm" style={{ marginTop: 12 }}>
                    {(itemsByOrder.get(o.id) || []).map((it) => (
                      <div key={it.id} className="orderRow">
                        <div className="orderRowLeft">
                          <img
                            className="imgThumb"
                            src={it.image_url || "/images/iphone.svg"}
                            alt={it.name}
                          />
                          <div>
                            <div>{it.name}</div>
                            <div className="cardMeta">
                              {it.quantity} × {money(it.unit_price)}
                            </div>
                          </div>
                        </div>

                        <div className="orderRowRight">
                          {money(Number(it.unit_price) * Number(it.quantity))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="muted">
              You have no orders yet. Add items to your cart and place your first order.
            </div>
          )}
        </Card>
      </div>
    </Container>
  );
}