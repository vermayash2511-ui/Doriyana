// ── CART STATE ──
let cart = JSON.parse(localStorage.getItem('doriyana_cart') || '[]');

function saveCart() {
  localStorage.setItem('doriyana_cart', JSON.stringify(cart));
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

// ── RENDER ──
function renderCart() {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  // Count badge
  const badge = document.getElementById('cartCount');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  const itemsEl = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmpty');
  const footerEl = document.getElementById('cartFooter');
  const totalEl = document.getElementById('cartTotal');
  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'flex';
    if (footerEl) footerEl.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (footerEl) footerEl.style.display = 'block';
  if (totalEl) totalEl.textContent = '₹' + total.toLocaleString('en-IN');

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

  // Checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.onclick = () => {
      const lines = cart.map(i => `• ${i.name} x${i.qty} — ₹${(i.price*i.qty).toLocaleString('en-IN')}`).join('\n');
      const msg = encodeURIComponent(`Hi Khushi! 🌸 I'd like to order from Doriyana:\n\n${lines}\n\nTotal: ₹${total.toLocaleString('en-IN')}\n\nCould you confirm availability and share payment details? Thank you!`);
      
      window.open(`https://wa.me/918619697628?text=${msg}`, '_blank');
    };
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
