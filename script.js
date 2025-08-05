// --- Product Selection and Visual Update Logic ---

const selectedProducts = JSON.parse(localStorage.getItem("selectedProducts")) || [];
const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
const selectedProductsList = document.getElementById("selectedProductsList");
const generateRoutineBtn = document.getElementById("generateRoutine");
const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const productsContainer = document.getElementById("productsContainer");

// Create search box
const searchInput = document.createElement("input");
searchInput.setAttribute("type", "text");
searchInput.setAttribute("placeholder", "Search products by name or brand...");
searchInput.setAttribute("id", "productSearch");
searchInput.style.margin = "0 0 20px 0";
searchInput.style.padding = "12px";
searchInput.style.width = "100%";
searchInput.style.fontSize = "16px";
document.querySelector(".search-section").appendChild(searchInput);

let allProducts = [];

function renderSelectedProducts() {
  selectedProductsList.innerHTML = selectedProducts
    .map(
      (product) => `
      <div class="selected-item" data-id="${product.id}">
        ${product.name} <button class="remove-product" data-id="${product.id}">&times;</button>
      </div>`
    )
    .join("");
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
}

function toggleProductSelection(product) {
  const index = selectedProducts.findIndex((p) => p.id === product.id);
  if (index >= 0) {
    selectedProducts.splice(index, 1);
  } else {
    selectedProducts.push(product);
  }
  renderSelectedProducts();
  highlightSelectedCards();
}

function highlightSelectedCards() {
  document.querySelectorAll(".product-card").forEach((card) => {
    const id = parseInt(card.dataset.id);
    const selected = selectedProducts.find((p) => p.id === id);
    card.classList.toggle("selected", !!selected);
  });
}

function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => `
      <div class="product-card" data-id="${product.id}">
        <img src="${product.image}" alt="${product.name}">
        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.brand}</p>
        </div>
      </div>`
    )
    .join("");

  document.querySelectorAll(".product-card").forEach((card) => {
    const id = parseInt(card.dataset.id);
    const product = allProducts.find((p) => p.id === id);
    card.addEventListener("click", (e) => {
      if (e.target.closest(".product-info") || e.target.tagName === "IMG") {
        showModal(product);
      } else {
        toggleProductSelection(product);
      }
    });
  });

  highlightSelectedCards();
}

selectedProductsList.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-product")) {
    const id = parseInt(e.target.dataset.id);
    const index = selectedProducts.findIndex((p) => p.id === id);
    if (index >= 0) {
      selectedProducts.splice(index, 1);
      renderSelectedProducts();
      highlightSelectedCards();
    }
  }
});

async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  allProducts = data.products;
}

document.getElementById("categoryFilter").addEventListener("change", () => {
  const selectedCategory = categoryFilter.value;
  const filtered = allProducts.filter((p) => p.category === selectedCategory);
  displayProducts(filtered);
});

searchInput.addEventListener("input", () => {
  const search = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;
  const filtered = allProducts.filter((p) => {
    return (
      (!selectedCategory || p.category === selectedCategory) &&
      (p.name.toLowerCase().includes(search) || p.brand.toLowerCase().includes(search))
    );
  });
  displayProducts(filtered);
});

renderSelectedProducts();
loadProducts().then(() => displayProducts([]));

// RTL toggle
const rtlBtn = document.createElement("button");
rtlBtn.textContent = "Toggle RTL";
rtlBtn.style.margin = "20px 0";
rtlBtn.style.padding = "10px";
rtlBtn.style.fontWeight = "bold";
document.querySelector(".site-header").appendChild(rtlBtn);

rtlBtn.addEventListener("click", () => {
  const dir = document.documentElement.getAttribute("dir") === "rtl" ? "ltr" : "rtl";
  document.documentElement.setAttribute("dir", dir);
});

// Modal
const modal = document.createElement("div");
modal.id = "productModal";
modal.style.position = "fixed";
modal.style.top = 0;
modal.style.left = 0;
modal.style.width = "100%";
modal.style.height = "100%";
modal.style.background = "rgba(0,0,0,0.6)";
modal.style.display = "none";
modal.style.justifyContent = "center";
modal.style.alignItems = "center";
modal.style.zIndex = 1000;
modal.innerHTML = `
  <div style="background:#fff; padding:24px; max-width:500px; border-radius:8px; position:relative;">
    <button id="closeModal" style="position:absolute; top:10px; right:10px; font-size:18px; border:none; background:none; cursor:pointer;">&times;</button>
    <h3 id="modalTitle"></h3>
    <p id="modalBrand" style="font-weight:bold"></p>
    <p id="modalDesc" style="margin-top:12px;"></p>
  </div>
`;
document.body.appendChild(modal);

document.getElementById("closeModal").addEventListener("click", () => {
  modal.style.display = "none";
});

function showModal(product) {
  document.getElementById("modalTitle").textContent = product.name;
  document.getElementById("modalBrand").textContent = product.brand;
  document.getElementById("modalDesc").textContent = product.description;
  modal.style.display = "flex";
}

// Spinner
const spinner = document.createElement("div");
spinner.innerHTML = "<div class='spinner'>Thinking...</div>";
spinner.style.textAlign = "center";
spinner.style.marginTop = "10px";
spinner.style.display = "none";
chatWindow.appendChild(spinner);

// Clear All Button
const clearBtn = document.createElement("button");
clearBtn.textContent = "Clear All Selected";
clearBtn.style.marginTop = "10px";
clearBtn.style.padding = "10px";
clearBtn.style.backgroundColor = "#ff003b";
clearBtn.style.color = "#fff";
clearBtn.style.border = "none";
clearBtn.style.borderRadius = "6px";
clearBtn.style.cursor = "pointer";
document.querySelector(".selected-products").appendChild(clearBtn);

clearBtn.addEventListener("click", () => {
  selectedProducts.length = 0;
  renderSelectedProducts();
  highlightSelectedCards();
});

// Chat Memory
function renderChatHistory() {
  chatWindow.innerHTML = "";
  chatHistory.forEach((msg) => {
    const div = document.createElement("div");
    div.className = `chat-message ${msg.role}`;
    div.textContent = msg.content;
    chatWindow.appendChild(div);
  });
}

function saveChat(role, content) {
  chatHistory.push({ role, content });
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

function appendMessage(role, content) {
  const div = document.createElement("div");
  div.className = `chat-message ${role}`;
  div.textContent = content;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  saveChat(role, content);
}

renderChatHistory();

// Routine Button
generateRoutineBtn.addEventListener("click", async () => {
  if (selectedProducts.length === 0) return;

  const payload = {
    messages: [
      {
        role: "system",
        content:
          "You are a friendly skincare expert who helps users build routines using only the selected products. Explain the routine clearly and concisely, step-by-step."
      },
      {
        role: "user",
        content: `Create a skincare or beauty routine using these products:\n${selectedProducts.map(p => `- ${p.name} (${p.brand}): ${p.description}`).join("\n")}`
      }
    ]
  };

  appendMessage("user", "Generate routine for selected products...");
  spinner.style.display = "block";

  try {
    const res = await fetch("https://chatbot-worker.ftobiolotu.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    appendMessage("ai", result.reply || "[No reply received]");
  } catch (err) {
    appendMessage("error", `Error: ${err.message}`);
  } finally {
    spinner.style.display = "none";
  }
});

// Chat form
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = userInput.value.trim();
  if (!input) return;
  appendMessage("user", input);
  userInput.value = "";
  spinner.style.display = "block";

  const messages = chatHistory.map(msg => ({ role: msg.role, content: msg.content })).slice(-10);
  messages.unshift({ role: "system", content: "You are a helpful L'Oréal routine advisor." });
  messages.push({ role: "user", content: input });

  try {
    const res = await fetch("https://chatbot-worker.ftobiolotu.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const result = await res.json();
    appendMessage("ai", result.reply || "[No reply]");
  } catch (err) {
    appendMessage("error", `Error: ${err.message}`);
  } finally {
    spinner.style.display = "none";
  }
});
// --- End of Product Selection and Visual Update Logic ---