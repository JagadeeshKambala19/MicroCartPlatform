import Container from "../components/Container.jsx";
import Button from "../components/Button.jsx";
import { useNavigate } from "react-router-dom";
import useReveal from "../hooks/useReveal.js";

export default function Home() {
  const nav = useNavigate();
  useReveal();

  return (
    <Container>
      <main className="home">
        <section className="homeHero" id="top">
          <div className="homeBackdrop" aria-hidden="true" />

          <div className="homeHeroInner">
            <p className="homeEyebrow" data-reveal>
              Online Store
            </p>

            <h1 className="homeTitle" data-reveal>
              Shop the latest products,
              <br />
              all in one place.
            </h1>

            <p className="homeLead" data-reveal>
              Browse products, add items to your cart, and place orders easily.
              Manage your purchases with a smooth and efficient shopping experience.
            </p>

            <div className="homeCtas" data-reveal>
              <Button onClick={() => nav("/products")}>
                Shop now
              </Button>

              <Button
                variant="ghost"
                onClick={() =>
                  document
                    .getElementById("details")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                View details
              </Button>
            </div>

            <div className="homePills" data-reveal>
              <span className="pill">Browse Products</span>
              <span className="pill">Add to Cart</span>
              <span className="pill">Place Orders</span>
              <span className="pill">Order History</span>
            </div>
          </div>

          <div className="homeHeroVisual" data-reveal>
            <div className="deviceFrame">
              <img
                className="deviceImg"
                src="/images/macbook.svg"
                alt="Featured product"
              />
            </div>
          </div>
        </section>

        <section className="homeSection" id="details">
          <div className="homeSectionHead" data-reveal>
            <h2 className="homeH2">Everything you need to shop.</h2>

            <p
              className="muted"
              style={{
                lineHeight: 1.6,
                margin: 0,
                maxWidth: "66ch",
              }}
            >
              Discover a wide range of products, manage your cart, and complete
              orders quickly. Track your purchases and view order history anytime.
            </p>
          </div>

          <div className="homeCards">
            <article className="homeCard" data-reveal>
              <div className="homeCardTop">
                <div className="homeKicker">Catalog</div>
                <div className="homeCardTitle">Explore Products</div>

                <p className="homeCardBody muted">
                  View available products with details, pricing, and availability.
                  Easily browse and find what you need.
                </p>
              </div>

              <div className="homeMedia">
                <img src="/images/iphone.svg" alt="Product preview" />
              </div>
            </article>

            <article className="homeCard" data-reveal>
              <div className="homeCardTop">
                <div className="homeKicker">Checkout</div>
                <div className="homeCardTitle">Cart & Orders</div>

                <p className="homeCardBody muted">
                  Add items to your cart, update quantities, and place orders.
                  Access your order history anytime.
                </p>
              </div>

              <div className="homeMedia">
                <img src="/images/watch.svg" alt="Order process" />
              </div>
            </article>
          </div>
        </section>
      </main>
    </Container>
  );
}