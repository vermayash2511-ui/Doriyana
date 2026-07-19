// ── CART STATE ──
let cart = JSON.parse(localStorage.getItem('doriyana_cart') || '[]');
const RAZORPAY_KEY_ID = 'rzp_live_TEuNXJmwrBBqfi';
const FREE_SHIPPING_THRESHOLD = 799;
const SHIPPING_CHARGE = 70;

function saveCart() {
  localStorage.setItem('doriyana_cart', JSON.stringify(cart));
}

// ── SHIPPING CALC ──
function getSubtotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}
function getShipping() {
  return getSubtotal() >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
}
function getTotal() {
  return getSubtotal() + getShipping();
}

// ── ADD TO CART ──
function addToCart(name, cat, price, img) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, cat, price, img, qty: 1 });
  }
  saveCart();
  showCartView('bag');
  renderCart();
  openCart();
}

// ── REMOVE ──
function removeFromCart(name) {
  cart = cart.filter(i => i.name !== name);
  saveCart();
  renderCart();
}

// ── CHANGE QTY ──
function changeQty(name, delta) {
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(name);
  else { saveCart(); renderCart(); }
}

// ── VIEWS: 'bag' | 'checkout' | 'success' ──
let cartView = 'bag';
function showCartView(v) {
  cartView = v;
  renderCart();
}

// ── RENDER ──
function renderCart() {
  const subtotal = getSubtotal();
  const shipping = getShipping();
  const total = getTotal();
  const count = cart.reduce((s, i) => s + i.qty, 0);

  // Badge
  const badge = document.getElementById('cartCount');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  const itemsEl = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmpty');
  const footerEl = document.getElementById('cartFooter');
  if (!itemsEl) return;

  // ── SUCCESS VIEW ──
  if (cartView === 'success') {
    if (emptyEl) emptyEl.style.display = 'none';
    if (footerEl) footerEl.style.display = 'none';
    itemsEl.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 1.5rem;text-align:center;gap:1rem">
        <div style="width:64px;height:64px;background:#f0fdf4;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2rem">✅</div>
        <h3 style="font-family:'Fraunces',serif;font-size:1.4rem;color:var(--foreground);margin:0">Order Placed!</h3>
        <p style="color:var(--muted-foreground);font-size:.9rem;margin:0">Payment successful. Khushi will confirm your order on WhatsApp within 24 hours.</p>
        <button onclick="showCartView('bag');closeCart()" style="margin-top:.5rem;background:var(--primary);color:white;border:none;padding:.75rem 2rem;border-radius:9999px;font-size:.9rem;font-weight:600;cursor:pointer;font-family:var(--font-sans)">Back to Shopping</button>
      </div>`;
    return;
  }

  // ── EMPTY ──
  if (cart.length === 0) {
    itemsEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'flex';
    if (footerEl) footerEl.style.display = 'none';
    cartView = 'bag';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (footerEl) footerEl.style.display = 'none';

  // ── CHECKOUT VIEW ──
  if (cartView === 'checkout') {
    itemsEl.innerHTML = `
      <div style="padding:1rem 1.25rem 2rem">
        <button onclick="showCartView('bag')" style="display:flex;align-items:center;gap:.4rem;background:none;border:none;color:var(--muted-foreground);font-size:.85rem;cursor:pointer;padding:0;margin-bottom:1.25rem;font-family:var(--font-sans)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to bag
        </button>

        <h3 style="font-family:'Fraunces',serif;font-size:1.1rem;margin:0 0 1.25rem;color:var(--foreground)">Delivery Details</h3>

        <div style="display:flex;flex-direction:column;gap:.75rem">
          <div>
            <label style="font-size:.75rem;font-weight:600;color:var(--foreground);display:block;margin-bottom:.3rem;text-transform:uppercase;letter-spacing:.08em">Full Name *</label>
            <input id="co-name" type="text" placeholder="Your full name" style="${inputStyle()}">
          </div>
          <div>
            <label style="font-size:.75rem;font-weight:600;color:var(--foreground);display:block;margin-bottom:.3rem;text-transform:uppercase;letter-spacing:.08em">Phone Number *</label>
            <input id="co-phone" type="tel" placeholder="10-digit mobile number" maxlength="10" style="${inputStyle()}">
          </div>
          <div>
            <label style="font-size:.75rem;font-weight:600;color:var(--foreground);display:block;margin-bottom:.3rem;text-transform:uppercase;letter-spacing:.08em">Address *</label>
            <textarea id="co-address" placeholder="House no., Street, Area" rows="2" style="${inputStyle()}resize:none;"></textarea>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
            <div>
              <label style="font-size:.75rem;font-weight:600;color:var(--foreground);display:block;margin-bottom:.3rem;text-transform:uppercase;letter-spacing:.08em">City *</label>
              <input id="co-city" type="text" placeholder="City" style="${inputStyle()}">
            </div>
            <div>
              <label style="font-size:.75rem;font-weight:600;color:var(--foreground);display:block;margin-bottom:.3rem;text-transform:uppercase;letter-spacing:.08em">Pincode *</label>
              <input id="co-pin" type="text" placeholder="6-digit PIN" maxlength="6" style="${inputStyle()}">
            </div>
          </div>
          <div>
            <label style="font-size:.75rem;font-weight:600;color:var(--foreground);display:block;margin-bottom:.3rem;text-transform:uppercase;letter-spacing:.08em">State *</label>
            <input id="co-state" type="text" placeholder="State" style="${inputStyle()}">
          </div>
        </div>

        <div style="margin-top:1.25rem;padding:1rem;background:var(--secondary);border-radius:.75rem;display:flex;flex-direction:column;gap:.4rem">
          <div style="display:flex;justify-content:space-between;font-size:.85rem;color:var(--muted-foreground)">
            <span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:.85rem;color:var(--muted-foreground)">
            <span>Shipping</span>
            <span style="color:${shipping === 0 ? '#16a34a' : 'var(--muted-foreground)'}">
              ${shipping === 0 ? 'FREE ✓' : '₹' + shipping}
            </span>
          </div>
          ${shipping > 0 ? `<p style="font-size:.72rem;color:var(--muted-foreground);margin:.2rem 0 0">Add ₹${(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString('en-IN')} more for free shipping</p>` : ''}
          <div style="display:flex;justify-content:space-between;font-size:1rem;font-weight:700;color:var(--foreground);border-top:1px solid var(--border);padding-top:.6rem;margin-top:.2rem">
            <span>Total</span><span>₹${total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <p id="co-error" style="color:#dc2626;font-size:.8rem;margin:.75rem 0 0;display:none"></p>

        <button id="co-pay-btn" onclick="handlePayment()" style="width:100%;margin-top:1rem;background:var(--primary);color:white;border:none;padding:.9rem;border-radius:.75rem;font-size:.95rem;font-weight:600;cursor:pointer;font-family:var(--font-sans);display:flex;align-items:center;justify-content:center;gap:.5rem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
          Pay ₹${total.toLocaleString('en-IN')} via UPI
        </button>

        <p style="text-align:center;font-size:.72rem;color:var(--muted-foreground);margin:.75rem 0 0">
          Powered by Razorpay · Google Pay, PhonePe & Paytm accepted
        </p>
      </div>`;
    return;
  }

  // ── BAG VIEW ──
  if (footerEl) footerEl.style.display = 'block';
  document.getElementById('cartTotal').textContent = '₹' + subtotal.toLocaleString('en-IN');

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" class="cart-item-img" onerror="this.style.display='none'">
      <div class="cart-item-info">
        <p class="cart-item-cat">${item.cat}</p>
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</p>
        <div class="cart-item-qty">
          <button onclick="changeQty('${item.name}',-1)" class="qty-btn">−</button>
          <span class="qty-num">${item.qty}</span>
          <button onclick="changeQty('${item.name}',1)" class="qty-btn">+</button>
        </div>
      </div>
      <button onclick="removeFromCart('${item.name}')" class="cart-item-remove" aria-label="Remove">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
  `).join('');

  // Shipping note in footer
  const note = document.querySelector('.cart-note');
  if (note) {
    note.innerHTML = shipping === 0
      ? '🎉 Free shipping applied! Handcrafted &amp; shipped in 5–7 days.'
      : `Add ₹${(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString('en-IN')} more for free shipping · ₹${SHIPPING_CHARGE} shipping charge applies`;
  }

  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.textContent = `Proceed to Checkout — ₹${total.toLocaleString('en-IN')}`;
    checkoutBtn.onclick = () => showCartView('checkout');
  }
}

function inputStyle() {
  return 'width:100%;box-sizing:border-box;padding:.65rem .75rem;border:1px solid var(--border);border-radius:.625rem;font-size:.875rem;font-family:var(--font-sans);background:var(--card);color:var(--foreground);outline:none;';
}

// ── PAYMENT ──
async function handlePayment() {
  // Validate fields
  const name    = document.getElementById('co-name')?.value.trim();
  const phone   = document.getElementById('co-phone')?.value.trim();
  const address = document.getElementById('co-address')?.value.trim();
  const city    = document.getElementById('co-city')?.value.trim();
  const pin     = document.getElementById('co-pin')?.value.trim();
  const state   = document.getElementById('co-state')?.value.trim();
  const errEl   = document.getElementById('co-error');

  if (!name || !phone || !address || !city || !pin || !state) {
    errEl.textContent = 'Please fill in all fields.';
    errEl.style.display = 'block';
    return;
  }
  if (!/^\d{10}$/.test(phone)) {
    errEl.textContent = 'Please enter a valid 10-digit phone number.';
    errEl.style.display = 'block';
    return;
  }
  if (!/^\d{6}$/.test(pin)) {
    errEl.textContent = 'Please enter a valid 6-digit pincode.';
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';

  const btn = document.getElementById('co-pay-btn');
  btn.textContent = 'Creating order...';
  btn.disabled = true;

  const total = getTotal();

  try {
    // Call our serverless function
    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total * 100 }) // convert to paise
    });
    const data = await res.json();
    if (!data.orderId) throw new Error('No order ID');

    // Save all details BEFORE opening Razorpay (DOM may change after)
    const orderDetails = { name, phone, address, city, pin, state };
    const orderCart = JSON.parse(JSON.stringify(cart)); // deep copy
    const orderTotal = total;
    const orderShipping = getShipping();
    const orderSubtotal = getSubtotal();

    // Open Razorpay
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: 'INR',
      name: 'Doriyana',
      description: 'Handmade Crochet Order',
      image: 'images/logo.jpg',
      order_id: data.orderId,
      prefill: { name, contact: phone },
      config: {
        display: {
          blocks: {
            upi: { name: 'Pay via UPI', instruments: [
              { method: 'upi', apps: ['google_pay', 'phonepe', 'paytm'] }
            ]},
          },
          sequence: ['block.upi'],
          preferences: { show_default_blocks: false }
        }
      },
      theme: { color: '#5A2050' },
      handler: function(response) {
        const lines = orderCart.map(i => `• ${i.name} x${i.qty} — ₹${(i.price*i.qty).toLocaleString('en-IN')}`).join('\n');
        const orderSummary = `${lines}\n\nSubtotal: ₹${orderSubtotal.toLocaleString('en-IN')}\nShipping: ${orderShipping === 0 ? 'FREE' : '₹' + orderShipping}\nTotal: ₹${orderTotal.toLocaleString('en-IN')}`;

        // Send email to Khushi via EmailJS
        emailjs.init('jDKoMfZLuiGZL_AKC');
        emailjs.send('service_xk6m9ir', 'template_ci4l9z9', {
          order_id: response.razorpay_payment_id,
          order_details: orderSummary,
          customer_name: orderDetails.name,
          address: `${orderDetails.address}, ${orderDetails.city}, ${orderDetails.state} - ${orderDetails.pin}`,
          phone: orderDetails.phone,
          payment_id: response.razorpay_payment_id,
          total: orderTotal.toLocaleString('en-IN')
        }).catch(err => console.error('EmailJS error:', err));

        cart = [];
        saveCart();
        saveCart();
        showCartView('success');
      },
      modal: {
        ondismiss: function() {
          btn.textContent = `Pay ₹${total.toLocaleString('en-IN')} via UPI`;
          btn.disabled = false;
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();

  } catch(err) {
    console.error(err);
    errEl.textContent = 'Something went wrong. Please try again.';
    errEl.style.display = 'block';
    btn.textContent = `Pay ₹${total.toLocaleString('en-IN')} via UPI`;
    btn.disabled = false;
  }
}

// ── OPEN / CLOSE ──
function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartBackdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartBackdrop').classList.remove('open');
  document.body.style.overflow = '';
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  const cartToggle = document.getElementById('cartToggle');
  if (cartToggle) cartToggle.addEventListener('click', openCart);
});
