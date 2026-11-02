/* Foodies Restaurant — menu, search, filters, cart, localStorage */
"use strict";

const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    category: "Burgers",
    price: 650,
    description: "Juicy beef patty, melted cheese, crisp lettuce, and our house sauce.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    badge: "Bestseller"
  },
  {
    id: 2,
    name: "Chicken Pizza",
    category: "Pizza",
    price: 1200,
    description: "Tender chicken, mozzarella, fresh herbs, and a rich tomato base.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    badge: "Fan favorite"
  },
  {
    id: 3,
    name: "Creamy Chicken Pasta",
    category: "Pasta",
    price: 850,
    description: "Silky cream sauce, grilled chicken, parmesan, and fresh herbs.",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    name: "Golden French Fries",
    category: "Sides",
    price: 300,
    description: "Crispy golden potato fries served with our signature dip.",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 5,
    name: "Chocolate Shake",
    category: "Drinks",
    price: 400,
    description: "A thick chocolate milkshake finished with a chocolate drizzle.",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 6,
    name: "Grilled Chicken Sandwich",
    category: "Sandwiches",
    price: 550,
    description: "Grilled chicken, crunchy lettuce, tomato, and creamy house sauce.",
    image: "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 7,
    name: "Margherita Pizza",
    category: "Pizza",
    price: 950,
    description: "A classic mix of tomato, mozzarella, basil, and a crisp crust.",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 8,
    name: "Garden Salad",
    category: "Sides",
    price: 450,
    description: "Fresh greens, juicy tomatoes, cucumber, and a lemon dressing.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 9,
    name: "Strawberry Cheesecake",
    category: "Desserts",
    price: 500,
    description: "Creamy cheesecake with strawberry topping and a buttery base.",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80",
    badge: "Sweet pick"
  }
];

const STORAGE_KEY = "foodiesRestaurantCartV1";
const DELIVERY_FEE = 150;
const CURRENCY = "Rs.";

const elements = {
  categoryFilters: document.getElementById("categoryFilters"),
  menuSearch: document.getElementById("menuSearch"),
  foodGrid: document.getElementById("foodGrid"),
  menuStatus: document.getElementById("menuStatus"),
  emptyState: document.getElementById("emptyState"),
  resetFiltersButton: document.getElementById("resetFiltersButton"),
  headerCartCount: document.getElementById("headerCartCount"),
  openCartButton: document.getElementById("openCartButton"),
  closeCartButton: document.getElementById("closeCartButton"),
  cartDrawer: document.getElementById("cartDrawer"),
  cartOverlay: document.getElementById("cartOverlay"),
  cartItems: document.getElementById("cartItems"),
  cartEmpty: document.getElementById("cartEmpty"),
  cartSummary: document.getElementById("cartSummary"),
  drawerCartCount: document.getElementById("drawerCartCount"),
  cartSubtotal: document.getElementById("cartSubtotal"),
  deliveryFee: document.getElementById("deliveryFee"),
  cartTotal: document.getElementById("cartTotal"),
  browseMenuButton: document.getElementById("browseMenuButton"),
  checkoutButton: document.getElementById("checkoutButton"),
  checkoutModal: document.getElementById("checkoutModal"),
  closeCheckoutButton: document.getElementById("closeCheckoutButton"),
  backToMenuButton: document.getElementById("backToMenuButton"),
  toast: document.getElementById("toast"),
  menuToggle: document.getElementById("menuToggle"),
  primaryNav: document.getElementById("primaryNav"),
  contactForm: document.getElementById("contactForm"),
  contactFeedback: document.getElementById("contactFeedback"),
  currentYear: document.getElementById("currentYear")
};

let activeCategory = "All";
let searchTerm = "";
let cart = loadCart();
let toastTimer;

function formatPrice(amount) {
  return `${CURRENCY} ${new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0
  }).format(amount)}`;
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return [];
    // Keep only valid menu IDs and positive integer quantities.
    return saved
      .filter(item => menuItems.some(food => food.id === Number(item.id)))
      .map(item => ({
        id: Number(item.id),
        quantity: Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1)))
      }));
  } catch (error) {
    console.warn("Could not load the saved cart:", error);
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.warn("Could not save the cart in this browser:", error);
    showToast("Your browser could not save the cart.");
  }
}

function getCartQuantity() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function getSubtotal() {
  return cart.reduce((total, item) => {
    const food = menuItems.find(menuItem => menuItem.id === item.id);
    return total + (food ? food.price * item.quantity : 0);
  }, 0);
}

function renderCategories() {
  const categories = ["All", ...new Set(menuItems.map(item => item.category))];
  elements.categoryFilters.innerHTML = categories.map(category => `
    <button
      class="category-button ${category === activeCategory ? "active" : ""}"
      type="button"
      data-category="${escapeHTML(category)}"
      aria-pressed="${category === activeCategory}"
    >${escapeHTML(category)}</button>
  `).join("");
}

function getFilteredItems() {
  return menuItems.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const searchableText = `${item.name} ${item.category} ${item.description}`.toLowerCase();
    return matchesCategory && searchableText.includes(searchTerm.toLowerCase().trim());
  });
}

function renderMenu() {
  const filteredItems = getFilteredItems();
  elements.foodGrid.innerHTML = filteredItems.map(item => `
    <article class="food-card">
      <div class="food-image-wrap">
        <img class="food-image" src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" loading="lazy">
        <span class="food-category">${escapeHTML(item.badge || item.category)}</span>
      </div>
      <div class="food-card-content">
        <div class="food-card-top">
          <h3>${escapeHTML(item.name)}</h3>
          <span class="food-price">${formatPrice(item.price)}</span>
        </div>
        <p class="food-description">${escapeHTML(item.description)}</p>
        <button class="add-button" type="button" data-add-to-cart="${item.id}">
          <span class="add-plus" aria-hidden="true">+</span> Add to order
        </button>
      </div>
    </article>
  `).join("");

  elements.emptyState.classList.toggle("hidden", filteredItems.length > 0);
  elements.foodGrid.classList.toggle("hidden", filteredItems.length === 0);
  elements.menuStatus.textContent = `Showing ${filteredItems.length} of ${menuItems.length} menu items`;
}

function addToCart(id) {
  const food = menuItems.find(item => item.id === Number(id));
  if (!food) return;

  const existing = cart.find(item => item.id === food.id);
  if (existing) {
    if (existing.quantity >= 99) {
      showToast("Maximum quantity is 99 per item.");
      return;
    }
    existing.quantity += 1;
  } else {
    cart.push({ id: food.id, quantity: 1 });
  }

  saveCart();
  renderCart();
  showToast(`${food.name} added to your order.`);
}

function updateQuantity(id, change) {
  const item = cart.find(cartItem => cartItem.id === Number(id));
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    cart = cart.filter(cartItem => cartItem.id !== Number(id));
  } else if (item.quantity > 99) {
    item.quantity = 99;
    showToast("Maximum quantity is 99 per item.");
  }

  saveCart();
  renderCart();
}

function removeFromCart(id) {
  const food = menuItems.find(item => item.id === Number(id));
  cart = cart.filter(item => item.id !== Number(id));
  saveCart();
  renderCart();
  if (food) showToast(`${food.name} removed from your order.`);
}

function renderCart() {
  const itemCount = getCartQuantity();
  const subtotal = getSubtotal();
  const delivery = subtotal > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  elements.headerCartCount.textContent = itemCount;
  elements.drawerCartCount.textContent = `(${itemCount})`;
  elements.cartSubtotal.textContent = formatPrice(subtotal);
  elements.deliveryFee.textContent = formatPrice(delivery);
  elements.cartTotal.textContent = formatPrice(total);

  elements.cartEmpty.classList.toggle("visible", cart.length === 0);
  elements.cartItems.classList.toggle("hidden", cart.length === 0);
  elements.cartSummary.classList.toggle("hidden", cart.length === 0);

  elements.cartItems.innerHTML = cart.map(cartItem => {
    const food = menuItems.find(item => item.id === cartItem.id);
    if (!food) return "";
    return `
      <article class="cart-item">
        <img src="${escapeHTML(food.image)}" alt="" loading="lazy">
        <div>
          <p class="cart-item-name">${escapeHTML(food.name)}</p>
          <span class="cart-item-price">${formatPrice(food.price * cartItem.quantity)}</span>
          <div class="quantity-control" aria-label="Quantity for ${escapeHTML(food.name)}">
            <button type="button" data-quantity-change="-1" data-id="${food.id}" aria-label="Decrease ${escapeHTML(food.name)} quantity">−</button>
            <span>${cartItem.quantity}</span>
            <button type="button" data-quantity-change="1" data-id="${food.id}" aria-label="Increase ${escapeHTML(food.name)} quantity">+</button>
          </div>
        </div>
        <button class="remove-item" type="button" data-remove-item="${food.id}" aria-label="Remove ${escapeHTML(food.name)}">×</button>
      </article>
    `;
  }).join("");
}

function openCart() {
  elements.cartDrawer.classList.add("open");
  elements.cartDrawer.setAttribute("aria-hidden", "false");
  elements.cartOverlay.hidden = false;
  document.body.classList.add("drawer-open");
  requestAnimationFrame(() => elements.cartOverlay.classList.add("visible"));
  elements.closeCartButton.focus();
}

function closeCart() {
  elements.cartDrawer.classList.remove("open");
  elements.cartDrawer.setAttribute("aria-hidden", "true");
  elements.cartOverlay.classList.remove("visible");
  document.body.classList.remove("drawer-open");
  window.setTimeout(() => {
    if (!elements.cartDrawer.classList.contains("open")) elements.cartOverlay.hidden = true;
  }, 260);
  elements.openCartButton.focus();
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("show"), 2500);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function resetFilters() {
  activeCategory = "All";
  searchTerm = "";
  elements.menuSearch.value = "";
  renderCategories();
  renderMenu();
}

function openCheckoutModal() {
  if (cart.length === 0) {
    showToast("Add something delicious to your order first.");
    return;
  }
  elements.checkoutModal.hidden = false;
  document.body.classList.add("modal-open");
  elements.closeCheckoutButton.focus();
}

function closeCheckoutModal() {
  elements.checkoutModal.hidden = true;
  document.body.classList.remove("modal-open");
  elements.checkoutButton.focus();
}

function closeMobileNav() {
  elements.primaryNav.classList.remove("open");
  elements.menuToggle.setAttribute("aria-expanded", "false");
  elements.menuToggle.setAttribute("aria-label", "Open navigation");
}

elements.categoryFilters.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderCategories();
  renderMenu();
});

elements.foodGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add-to-cart]");
  if (button) addToCart(button.dataset.addToCart);
});

elements.menuSearch.addEventListener("input", event => {
  searchTerm = event.target.value;
  renderMenu();
});

elements.resetFiltersButton.addEventListener("click", resetFilters);
elements.openCartButton.addEventListener("click", openCart);
elements.closeCartButton.addEventListener("click", closeCart);
elements.cartOverlay.addEventListener("click", closeCart);
elements.browseMenuButton.addEventListener("click", () => {
  closeCart();
  document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
});

elements.cartItems.addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-quantity-change]");
  const removeButton = event.target.closest("[data-remove-item]");

  if (quantityButton) {
    updateQuantity(quantityButton.dataset.id, Number(quantityButton.dataset.quantityChange));
  } else if (removeButton) {
    removeFromCart(removeButton.dataset.removeItem);
  }
});

elements.checkoutButton.addEventListener("click", openCheckoutModal);
elements.closeCheckoutButton.addEventListener("click", closeCheckoutModal);
elements.backToMenuButton.addEventListener("click", () => {
  closeCheckoutModal();
  closeCart();
  document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
});

elements.checkoutModal.addEventListener("click", event => {
  if (event.target === elements.checkoutModal) closeCheckoutModal();
});

elements.menuToggle.addEventListener("click", () => {
  const isOpen = elements.primaryNav.classList.toggle("open");
  elements.menuToggle.setAttribute("aria-expanded", String(isOpen));
  elements.menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

elements.primaryNav.addEventListener("click", event => {
  if (event.target.closest("a")) closeMobileNav();
});

document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    elements.menuSearch.focus();
    document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
  }
  if (event.key === "Escape") {
    if (!elements.checkoutModal.hidden) closeCheckoutModal();
    else if (elements.cartDrawer.classList.contains("open")) closeCart();
    else closeMobileNav();
  }
});

elements.contactForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!elements.contactForm.checkValidity()) {
    elements.contactForm.reportValidity();
    return;
  }
  elements.contactFeedback.textContent = "Thanks! This demo form is validated, but no message was sent.";
  elements.contactForm.reset();
});

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach(navLink => navLink.classList.remove("active"));
    link.classList.add("active");
  });
});

elements.currentYear.textContent = new Date().getFullYear();
renderCategories();
renderMenu();
renderCart();
