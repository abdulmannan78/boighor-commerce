import React, { useMemo, useState } from "react";
import { categories, createBooks } from "./data/books.js";

const money = (value) => `৳${Math.round(value).toLocaleString("en-BD")}`;
const today = () => new Date().toISOString().slice(0, 10);

const tabs = [
  ["store", "Storefront"],
  ["checkout", "Checkout"],
  ["management", "Management"],
  ["delivery", "Delivery"],
  ["payments", "Payments"],
  ["billing", "Billing"],
];

function App() {
  const [activeTab, setActiveTab] = useState("store");
  const [books, setBooks] = useState(createBooks);
  const [cart, setCart] = useState({});
  const [orders, setOrders] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [sort, setSort] = useState("featured");
  const [checkout, setCheckout] = useState({
    customerName: "Nusrat Jahan",
    customerPhone: "01712345678",
    customerEmail: "customer@example.com",
    district: "Dhaka",
    address: "House 12, Road 8, Dhanmondi, Dhaka",
    deliveryMode: "standard",
    coupon: "",
    payment: "bKash",
    transactionId: "TXN-DEMO-20260503",
    paymentStatus: "Paid",
  });

  const cartLines = useMemo(() => Object.entries(cart).map(([id, qty]) => ({
    ...books.find((book) => book.id === id),
    qty,
  })).filter((item) => item.id), [books, cart]);

  const totals = useMemo(() => {
    const subtotal = cartLines.reduce((sum, item) => sum + item.price * item.qty, 0);
    const delivery = checkout.deliveryMode === "pickup" || subtotal === 0
      ? 0
      : checkout.deliveryMode === "express"
        ? 120
        : checkout.district === "Dhaka"
          ? 60
          : 100;
    const discount = checkout.coupon.trim().toUpperCase() === "BOOK10" ? subtotal * 0.1 : 0;
    const vat = Math.max(0, subtotal - discount) * 0.05;

    return { subtotal, delivery, discount, vat, total: subtotal - discount + vat + delivery };
  }, [cartLines, checkout]);

  const filteredBooks = useMemo(() => {
    const text = query.trim().toLowerCase();
    const list = books.filter((book) => {
      const haystack = `${book.title} ${book.author} ${book.category} ${book.isbn}`.toLowerCase();
      return (!text || haystack.includes(text)) && (category === "All categories" || book.category === category);
    });

    return [...list].sort((a, b) => {
      if (sort === "priceLow") return a.price - b.price;
      if (sort === "priceHigh") return b.price - a.price;
      if (sort === "stockLow") return a.stock - b.stock;
      return 0;
    });
  }, [books, category, query, sort]);

  const cartCount = cartLines.reduce((sum, item) => sum + item.qty, 0);
  const grossSales = orders.reduce((sum, order) => sum + order.totals.total, 0);
  const inventoryUnits = books.reduce((sum, book) => sum + book.stock, 0);
  const lowStock = books.filter((book) => book.stock <= 5).length;

  function setField(field, value) {
    setCheckout((current) => ({ ...current, [field]: value }));
  }

  function addToCart(id) {
    const book = books.find((item) => item.id === id);
    setCart((current) => {
      const qty = current[id] || 0;
      if (!book || qty >= book.stock) return current;
      return { ...current, [id]: qty + 1 };
    });
  }

  function changeQty(id, delta) {
    const book = books.find((item) => item.id === id);
    setCart((current) => {
      const next = (current[id] || 0) + delta;
      if (next <= 0) {
        const updated = { ...current };
        delete updated[id];
        return updated;
      }
      if (book && next <= book.stock) return { ...current, [id]: next };
      return current;
    });
  }

  function buildOrder(items = cartLines) {
    const id = `ORD-${Date.now().toString().slice(-6)}`;
    return {
      id,
      invoice: `INV-${id.slice(4)}`,
      date: today(),
      customer: checkout.customerName,
      phone: checkout.customerPhone,
      email: checkout.customerEmail,
      address: checkout.address,
      district: checkout.district,
      deliveryMode: checkout.deliveryMode,
      courier: checkout.deliveryMode === "express" ? "Pathao Courier" : "Sundarban Courier",
      deliveryStatus: "Processing",
      payment: checkout.payment,
      paymentStatus: checkout.paymentStatus,
      transactionId: checkout.transactionId || `REF-${Date.now()}`,
      items,
      totals,
    };
  }

  function saveOrder(order) {
    setOrders((current) => [order, ...current]);
    setBooks((current) => current.map((book) => {
      const item = order.items.find((line) => line.id === book.id);
      return item ? { ...book, stock: Math.max(0, book.stock - item.qty) } : book;
    }));
    setCart({});
    setInvoiceOrder(order);
    setActiveTab("billing");
  }

  function placeOrder(event) {
    event.preventDefault();
    if (!cartLines.length) {
      alert("Please add at least one book to the cart.");
      return;
    }
    saveOrder(buildOrder());
  }

  function createDemoOrder() {
    const demoCart = { "BK-001": 1, "BK-009": 1, "BK-015": 2 };
    const items = Object.entries(demoCart).map(([id, qty]) => ({ ...books.find((book) => book.id === id), qty }));
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const demoTotals = {
      subtotal,
      delivery: 60,
      discount: subtotal * 0.1,
      vat: (subtotal * 0.9) * 0.05,
      total: subtotal * 0.9 * 1.05 + 60,
    };
    const id = `ORD-${Date.now().toString().slice(-6)}`;
    saveOrder({
      ...buildOrder(items),
      id,
      invoice: `INV-${id.slice(4)}`,
      transactionId: "DEMO-BKASH-001",
      items,
      totals: demoTotals,
    });
  }

  function restockLowItems() {
    setBooks((current) => current.map((book) => book.stock <= 5 ? { ...book, stock: book.stock + 20 } : book));
  }

  function updateDelivery(id, status) {
    setOrders((current) => current.map((order) => order.id === id ? { ...order, deliveryStatus: status } : order));
  }

  function showTab(tab) {
    setActiveTab(tab);
    setCartOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} showTab={showTab} />
      <main className="main">
        <header className="topbar">
          <label className="search" aria-label="Search books">
            <span>⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, author, category, ISBN" />
          </label>
          <button className="ghost-btn" onClick={createDemoOrder}>Create demo order</button>
          <button className="primary-btn" onClick={() => setCartOpen(true)}>Cart <span>{cartCount}</span></button>
        </header>

        {activeTab === "store" && (
          <Storefront
            books={filteredBooks}
            allBooks={books}
            allCount={books.length}
            category={category}
            setCategory={setCategory}
            sort={sort}
            setSort={setSort}
            addToCart={addToCart}
            showTab={showTab}
          />
        )}
        {activeTab === "checkout" && (
          <Checkout
            checkout={checkout}
            setField={setField}
            cartLines={cartLines}
            totals={totals}
            placeOrder={placeOrder}
          />
        )}
        {activeTab === "management" && (
          <Management
            books={books}
            grossSales={grossSales}
            orderCount={orders.length}
            inventoryUnits={inventoryUnits}
            lowStock={lowStock}
            adjustStock={(id) => setBooks((current) => current.map((book) => book.id === id ? { ...book, stock: book.stock + 5 } : book))}
            restockLowItems={restockLowItems}
          />
        )}
        {activeTab === "delivery" && <Delivery orders={orders} updateDelivery={updateDelivery} />}
        {activeTab === "payments" && <Payments orders={orders} />}
        {activeTab === "billing" && <Billing orders={orders} setInvoiceOrder={setInvoiceOrder} />}
      </main>

      <CartDrawer
        open={cartOpen}
        setOpen={setCartOpen}
        cartLines={cartLines}
        totals={totals}
        changeQty={changeQty}
        showTab={showTab}
      />

      {invoiceOrder && <InvoiceModal order={invoiceOrder} close={() => setInvoiceOrder(null)} />}
    </div>
  );
}

function Sidebar({ activeTab, showTab }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">B</div>
        <div>
          <h1>Boighor Commerce</h1>
          <p>Bookstore ecommerce system</p>
        </div>
      </div>
      <nav className="nav" aria-label="Main navigation">
        {tabs.map(([id, label]) => (
          <button key={id} className={activeTab === id ? "active" : ""} onClick={() => showTab(id)}>{label}</button>
        ))}
      </nav>
      <div className="sidebar-panel">
        <strong>Project Outline</strong>
        <p>Catalog, cart, checkout, admin, delivery, payment records, and printable billing are split into a React app ready for backend APIs.</p>
      </div>
    </aside>
  );
}

function Storefront({ books, allBooks, allCount, category, setCategory, sort, setSort, addToCart, showTab }) {
  const categorySections = categories.map((item) => ({
    name: item,
    books: allBooks.filter((book) => book.category === item).slice(0, 5),
    count: allBooks.filter((book) => book.category === item).length,
  })).filter((section) => section.count > 0);

  return (
    <section>
      <div className="hero">
        <div>
          <h2>Sell books online with local checkout, delivery, and invoicing.</h2>
          <p>Built for Bangladesh book retail: bKash, Nagad, Visa, Mastercard, city-wise delivery fees, inventory alerts, admin order controls, and billing documents.</p>
          <button className="primary-btn" onClick={() => showTab("checkout")}>Start checkout</button>
        </div>
        <div className="hero-metrics">
          <Metric value={allCount} label="seed books" />
          <Metric value="4" label="payment options" />
          <Metric value="64" label="district coverage" />
        </div>
      </div>
      <div className="content">
        <SectionHead title="Book Categories" text="Browse the collection by subject, including a new IT Security learning shelf." />
        <div className="category-section-grid">
          {categorySections.map((section) => (
            <button className="category-section" key={section.name} onClick={() => setCategory(section.name)}>
              <span className="category-section-head">
                <strong>{section.name}</strong>
                <em>{section.count} books</em>
              </span>
              <span className="category-covers">
                {section.books.slice(0, 4).map((book) => <img key={book.id} src={book.cover} alt={`${book.title} cover`} loading="lazy" />)}
              </span>
            </button>
          ))}
        </div>

        <SectionHead title="Book Catalog" text="Seeded with Bangladesh bookshop categories and 110 starter products.">
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {["All categories", ...categories].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="featured">Featured</option>
            <option value="priceLow">Price: low to high</option>
            <option value="priceHigh">Price: high to low</option>
            <option value="stockLow">Low stock first</option>
          </select>
        </SectionHead>
        <div className="book-grid">
          {books.map((book) => <BookCard key={book.id} book={book} addToCart={addToCart} />)}
          {!books.length && <div className="empty">No books match this filter.</div>}
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }) {
  return <div className="metric"><strong>{value}</strong><span>{label}</span></div>;
}

function SectionHead({ title, text, children }) {
  return (
    <div className="section-head">
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      {children && <div className="filters">{children}</div>}
    </div>
  );
}

function BookCard({ book, addToCart }) {
  return (
    <article className="book-card">
      <div className="cover">
        <img src={book.cover} alt={`${book.title} cover`} loading="lazy" />
      </div>
      <div className="book-body">
        <p className="book-title">{book.title}</p>
        <div className="book-meta">
          <span>{book.author}</span>
          <span>{book.category} • {book.rating} rating</span>
          <span>ISBN {book.isbn}</span>
        </div>
        <span className="tag">{book.stock > 0 ? `${book.stock} in stock` : "Out of stock"}</span>
        <div className="price-row"><span className="price">{money(book.price)}</span><span className="old-price">{money(book.oldPrice)}</span></div>
        <button className="primary-btn" disabled={book.stock < 1} onClick={() => addToCart(book.id)}>Add to cart</button>
      </div>
    </article>
  );
}

function Checkout({ checkout, setField, cartLines, totals, placeOrder }) {
  return (
    <div className="content">
      <SectionHead title="Checkout" text="Customer, delivery, payment, tax, discount, and invoice generation." />
      <div className="checkout-grid">
        <Panel title="Customer & Delivery">
          <form onSubmit={placeOrder}>
            <div className="form-grid">
              <Field label="Customer name"><input required value={checkout.customerName} onChange={(event) => setField("customerName", event.target.value)} /></Field>
              <Field label="Phone"><input required value={checkout.customerPhone} onChange={(event) => setField("customerPhone", event.target.value)} /></Field>
              <Field label="Email"><input type="email" value={checkout.customerEmail} onChange={(event) => setField("customerEmail", event.target.value)} /></Field>
              <Field label="District">
                <select value={checkout.district} onChange={(event) => setField("district", event.target.value)}>
                  {["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Sylhet", "Barishal", "Rangpur", "Mymensingh", "Outside metro"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Delivery address" full><textarea required value={checkout.address} onChange={(event) => setField("address", event.target.value)} /></Field>
              <Field label="Delivery service">
                <select value={checkout.deliveryMode} onChange={(event) => setField("deliveryMode", event.target.value)}>
                  <option value="standard">Standard courier</option>
                  <option value="express">Express delivery</option>
                  <option value="pickup">Store pickup</option>
                </select>
              </Field>
              <Field label="Coupon"><input placeholder="BOOK10" value={checkout.coupon} onChange={(event) => setField("coupon", event.target.value)} /></Field>
            </div>

            <h3>Payment</h3>
            <div className="payment-methods">
              {["bKash", "Nagad", "Visa", "Mastercard"].map((method) => (
                <label key={method}>
                  <input type="radio" name="payment" checked={checkout.payment === method} onChange={() => setField("payment", method)} />
                  <span className="pay-card">{method}</span>
                </label>
              ))}
            </div>

            <div className="form-grid">
              <Field label="Transaction / card reference"><input value={checkout.transactionId} onChange={(event) => setField("transactionId", event.target.value)} /></Field>
              <Field label="Payment status">
                <select value={checkout.paymentStatus} onChange={(event) => setField("paymentStatus", event.target.value)}>
                  <option>Paid</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>
              </Field>
            </div>
            <button className="primary-btn submit-btn" type="submit">Place order & generate invoice</button>
          </form>
        </Panel>
        <Panel title="Order Summary"><OrderSummary cartLines={cartLines} totals={totals} /></Panel>
      </div>
    </div>
  );
}

function Field({ label, full, children }) {
  return <label className={`field ${full ? "full" : ""}`}><span>{label}</span>{children}</label>;
}

function Panel({ title, children }) {
  return (
    <section className="panel">
      <div className="panel-head"><h3>{title}</h3></div>
      <div className="panel-body">{children}</div>
    </section>
  );
}

function OrderSummary({ cartLines, totals }) {
  return (
    <>
      {cartLines.map((item) => <SummaryRow key={item.id} label={`${item.title} × ${item.qty}`} value={money(item.price * item.qty)} />)}
      {!cartLines.length && <div className="empty">No cart items yet.</div>}
      <SummaryRow label="Subtotal" value={money(totals.subtotal)} />
      <SummaryRow label="Discount" value={`-${money(totals.discount)}`} />
      <SummaryRow label="VAT 5%" value={money(totals.vat)} />
      <SummaryRow label="Delivery" value={money(totals.delivery)} />
      <SummaryRow label="Payable" value={money(totals.total)} total />
    </>
  );
}

function SummaryRow({ label, value, total }) {
  return <div className={`summary-row ${total ? "total" : ""}`}><span>{label}</span><strong>{value}</strong></div>;
}

function Management({ books, grossSales, orderCount, inventoryUnits, lowStock, adjustStock, restockLowItems }) {
  return (
    <div className="content">
      <SectionHead title="Store Management" text="Inventory, revenue, order status, and low-stock monitoring." />
      <div className="admin-grid">
        <Stat label="Gross sales" value={money(grossSales)} />
        <Stat label="Orders" value={orderCount} />
        <Stat label="Inventory units" value={inventoryUnits} />
        <Stat label="Low stock SKUs" value={lowStock} />
      </div>
      <section className="panel">
        <div className="panel-head"><h3>Inventory</h3><button className="ghost-btn" onClick={restockLowItems}>Restock low items</button></div>
        <div className="panel-body table-wrap">
          <table>
            <thead><tr><th>Book</th><th>Author</th><th>Category</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead>
            <tbody>
              {books.slice(0, 55).map((book) => (
                <tr key={book.id}>
                  <td><strong>{book.title}</strong><br /><span className="book-meta">{book.id} • {book.isbn}</span></td>
                  <td>{book.author}</td>
                  <td>{book.category}</td>
                  <td>{money(book.price)}</td>
                  <td><span className={`status ${book.stock <= 5 ? "pending" : "paid"}`}>{book.stock}</span></td>
                  <td><button className="mini-btn" onClick={() => adjustStock(book.id)}>+5</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return <div className="stat-card"><span>{label}</span><strong>{value}</strong></div>;
}

function Delivery({ orders, updateDelivery }) {
  return (
    <div className="content">
      <SectionHead title="Delivery Management" text="Assign courier, update status, and track customer shipments." />
      <Panel title="Shipments">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>District</th><th>Courier</th><th>Status</th><th>Update</th></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong><br />{order.date}</td>
                  <td>{order.customer}<br /><span className="book-meta">{order.phone}</span></td>
                  <td>{order.district}</td>
                  <td>{order.courier}</td>
                  <td><span className={`status ${order.deliveryStatus.toLowerCase()}`}>{order.deliveryStatus}</span></td>
                  <td>
                    <select value={order.deliveryStatus} onChange={(event) => updateDelivery(order.id, event.target.value)}>
                      {["Processing", "Packed", "Shipped", "Delivered", "Cancelled"].map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {!orders.length && <EmptyTable columns={6} text="No shipments yet. Create an order to populate delivery management." />}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Payments({ orders }) {
  return (
    <div className="content">
      <SectionHead title="Payment Integration" text="Simulation layer for bKash, Nagad, Visa, and Mastercard settlement records." />
      <Panel title="Transactions">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order</th><th>Gateway</th><th>Reference</th><th>Amount</th><th>Status</th><th>Settled</th></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.payment}</td>
                  <td>{order.transactionId}</td>
                  <td>{money(order.totals.total)}</td>
                  <td><span className={`status ${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus}</span></td>
                  <td>{order.paymentStatus === "Paid" ? order.date : "Awaiting confirmation"}</td>
                </tr>
              ))}
              {!orders.length && <EmptyTable columns={6} text="Payment records will appear after checkout." />}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Billing({ orders, setInvoiceOrder }) {
  return (
    <div className="content">
      <SectionHead title="Invoicing & Billing" text="Generate printable invoices and keep billing history." />
      <Panel title="Invoices">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Invoice</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.invoice}</strong><br />{order.id}</td>
                  <td>{order.customer}<br /><span className="book-meta">{order.email}</span></td>
                  <td>{order.date}</td>
                  <td>{money(order.totals.total)}</td>
                  <td><span className={`status ${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus}</span></td>
                  <td><button className="mini-btn" onClick={() => setInvoiceOrder(order)}>View / print</button></td>
                </tr>
              ))}
              {!orders.length && <EmptyTable columns={6} text="No invoices generated yet." />}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function EmptyTable({ columns, text }) {
  return <tr><td colSpan={columns}><div className="empty">{text}</div></td></tr>;
}

function CartDrawer({ open, setOpen, cartLines, totals, changeQty, showTab }) {
  return (
    <aside className={`drawer ${open ? "open" : ""}`} aria-hidden={!open}>
      <div className="drawer-backdrop" onClick={() => setOpen(false)} />
      <div className="drawer-panel" role="dialog" aria-label="Shopping cart">
        <div className="drawer-head">
          <h3>Your Cart</h3>
          <button className="ghost-btn" onClick={() => setOpen(false)}>Close</button>
        </div>
        <div className="cart-items">
          {cartLines.map((item) => (
            <div className="cart-item" key={item.id}>
              <img className="thumb" src={item.cover} alt={`${item.title} cover`} />
              <div>
                <strong>{item.title}</strong>
                <div className="book-meta">{item.author}<br />{money(item.price)} each</div>
                <div className="qty">
                  <button onClick={() => changeQty(item.id, -1)}>−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => changeQty(item.id, 1)}>+</button>
                </div>
              </div>
              <strong>{money(item.price * item.qty)}</strong>
            </div>
          ))}
          {!cartLines.length && <div className="empty">Your cart is empty. Add a few books to begin.</div>}
        </div>
        <div className="drawer-foot">
          <SummaryRow label="Subtotal" value={money(totals.subtotal)} />
          <SummaryRow label="Total" value={money(totals.total)} total />
          <button className="primary-btn" onClick={() => showTab("checkout")}>Checkout</button>
        </div>
      </div>
    </aside>
  );
}

function InvoiceModal({ order, close }) {
  return (
    <div className="modal open" onClick={(event) => event.target.classList.contains("modal") && close()}>
      <div className="invoice">
        <div className="invoice-head">
          <div>
            <h2>Boighor Commerce</h2>
            <p>Online bookstore invoice</p>
          </div>
          <div className="right">
            <h3>{order.invoice}</h3>
            <p>Date: {order.date}<br />Order: {order.id}</p>
          </div>
        </div>
        <div className="invoice-body">
          <div className="checkout-grid invoice-grid">
            <div>
              <h3>Bill To</h3>
              <p>{order.customer}<br />{order.phone}<br />{order.email}<br />{order.address}</p>
            </div>
            <div>
              <h3>Payment & Delivery</h3>
              <p>{order.payment} • {order.paymentStatus}<br />Reference: {order.transactionId}<br />{order.courier}<br />Status: {order.deliveryStatus}</p>
            </div>
          </div>
          <table>
            <thead><tr><th>Book</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="invoice-book">
                      <img src={item.cover} alt={`${item.title} cover`} />
                      <span>{item.title}<br /><span className="book-meta">{item.author}</span></span>
                    </div>
                  </td>
                  <td>{item.qty}</td>
                  <td>{money(item.price)}</td>
                  <td>{money(item.price * item.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="invoice-total">
            <SummaryRow label="Subtotal" value={money(order.totals.subtotal)} />
            <SummaryRow label="Discount" value={`-${money(order.totals.discount)}`} />
            <SummaryRow label="VAT 5%" value={money(order.totals.vat)} />
            <SummaryRow label="Delivery" value={money(order.totals.delivery)} />
            <SummaryRow label="Total" value={money(order.totals.total)} total />
          </div>
          <div className="drawer-foot no-print">
            <button className="ghost-btn" onClick={close}>Close</button>
            <button className="primary-btn" onClick={() => window.print()}>Print invoice</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
