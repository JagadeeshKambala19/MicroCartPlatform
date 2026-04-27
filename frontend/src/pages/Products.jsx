import React, { useEffect, useMemo, useState } from "react";
import Container from "../components/Container.jsx";
import Card from "../components/Card.jsx";
import Field from "../components/Field.jsx";
import Button from "../components/Button.jsx";
import { addToCart } from "../api/cart.js";
import { createProduct, deleteProduct, listProducts, updateProduct } from "../api/products.js";
import { money } from "../api/client.js";
import useReveal from "../hooks/useReveal.js";

const empty = { name: "", description: "", price: "999", image_url: "/images/iphone.svg" };

export default function Products() {
  useReveal();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const selected = useMemo(
    () => products.find((p) => p.id === editingId) || null,
    [products, editingId]
  );

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const rows = await listProducts();
      setProducts(rows);
    } catch (e) {
      setError(e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!selected) return;
    setForm({
      name: selected.name || "",
      description: selected.description || "",
      price: String(selected.price ?? ""),
      image_url: selected.image_url || ""
    });
  }, [selected]);

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(empty);
    setSaving(false);
    setError("");
  }

  function openCreate() {
    setError("");
    setEditingId(null);
    setForm(empty);
    setModalOpen(true);
  }

  function openEdit(id) {
    setError("");
    setEditingId(id);
    setModalOpen(true);
  }

  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalOpen]);

  return (
    <Container>
      <header className="pageHeader">
        <p className="pageEyebrow" data-reveal>
          Products
        </p>

        <h1 className="pageTitle" data-reveal>
          Browse our catalog
        </h1>

        <p className="pageSub" data-reveal>
          Explore available products, view details, and add items to your cart.
        </p>
      </header>

      <div className="productLayout">
        {/* PRODUCT LIST */}
        <Card className="cardHover" data-reveal>
          <div className="cardTitleRow">
            <div className="cardTitle">Available Products</div>
            <span className="cardMeta">
              {loading ? "Loading..." : `${products.length} product${products.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          <div className="hr" />

          {error ? <div className="errorText" style={{ marginBottom: 10 }}>{error}</div> : null}

          {loading ? (
            <div className="muted">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="muted">
              No products available yet. Click the + button to add one.
            </div>
          ) : (
            <div className="productGridFixed">
              {products.map((p) => (
                <div key={p.id} className="productCardFixed" data-reveal>
                  <div className="productCardMedia">
                    <img
                      src={p.image_url || "/images/iphone.svg"}
                      alt={p.name}
                    />
                  </div>

                  <div className="productCardBody">
                    <div className="productCardTop">
                      <div className="productCardTitle">{p.name}</div>
                      <div className="productCardPrice">
                        {money(p.price)}
                      </div>
                    </div>

                    <div className="productCardDesc">
                      {p.description || "No description available."}
                    </div>

                    <div className="productCardActions">
                      <Button
                        variant="ghost"
                        className="btnSm"
                        onClick={() => {
                          openEdit(p.id);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        className="btnSm"
                        onClick={async () => {
                          setError("");
                          try {
                            await addToCart(p.id, 1);
                            alert("Product added to cart");
                          } catch (e) {
                            setError(e.message || "Failed to add to cart");
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <button className="fab" type="button" onClick={openCreate} aria-label="Add product">
        <span aria-hidden="true">+</span>
      </button>

      {modalOpen ? (
        <div className="modalOverlay" role="presentation" onMouseDown={closeModal}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={editingId ? "Edit product" : "Add product"}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modalHeader">
              <div>
                <div className="modalTitle">{editingId ? `Edit Product #${editingId}` : "Add New Product"}</div>
                <div className="modalSub">Name, price, description and an image.</div>
              </div>
              <button className="iconBtn" type="button" onClick={closeModal} aria-label="Close dialog">
                ×
              </button>
            </div>

            <div className="hr" />

            <div className="productFormGrid">
              <div className="productFormRow2">
                <Field label="Product Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                <Field
                  label="Price"
                  hint="USD"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>

              <Field
                label="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />

              <Field
                label="Image URL"
                hint="Example: /images/product.svg"
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
              />

              {error ? <div className="errorText">{error}</div> : null}

              <div className="rowWrap modalActions">
                <Button variant="ghost" className="btnSm" onClick={closeModal}>
                  Cancel
                </Button>

                <div style={{ flex: 1 }} />

                {editingId ? (
                  <Button
                    variant="danger"
                    className="btnSm"
                    disabled={saving}
                    onClick={async () => {
                      if (!confirm("Are you sure you want to delete this product?")) return;
                      setSaving(true);
                      setError("");
                      try {
                        await deleteProduct(editingId);
                        await refresh();
                        closeModal();
                      } catch (e) {
                        setError(e.message || "Failed to delete product");
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    Delete
                  </Button>
                ) : null}

                <Button
                  loading={saving}
                  onClick={async () => {
                    setSaving(true);
                    setError("");
                    try {
                      const payload = {
                        name: form.name,
                        description: form.description,
                        price: form.price,
                        image_url: form.image_url
                      };

                      if (editingId) await updateProduct(editingId, payload);
                      else await createProduct(payload);

                      await refresh();
                      closeModal();
                    } catch (e) {
                      setError(e.message || "Failed to save product");
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  {editingId ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Container>
  );
}
