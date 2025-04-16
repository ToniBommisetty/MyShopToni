// DOM Content Loaded Event
document.addEventListener("DOMContentLoaded", function() {
    // ======================
    // UI Elements & Variables
    // ======================
    const registerBtn = document.getElementById("register-btn");
    const loginBtn = document.getElementById("login-btn");
    const goToRegisterBtn = document.getElementById("go-to-register");
    const goToLoginBtn = document.getElementById("go-to-login");
    const goToForgotBtn = document.getElementById("go-to-forgot");
    const backToLoginBtn = document.getElementById("back-to-login");
    const userIcon = document.getElementById("user-icon");
    const logoutBtn = document.getElementById("logout-btn");
    
    const registerForm = document.getElementById("uregister");
    const loginForm = document.getElementById("login-page");
    const forgotForm = document.getElementById("forgot-page");
    const searchBox = document.querySelector('.search-box');
    const cart = document.querySelector('.cart');
    const navbar = document.querySelector('.navbar');
    const checkoutModal = document.getElementById("checkoutModal");
    const placeOrderBtn = document.getElementById("placeOrderBtn");

    // ======================
    // Initialize Application
    // ======================
    function initApp() {
        // Hide all forms initially
        if (loginForm) loginForm.style.display = "none";
        if (registerForm) registerForm.style.display = "none";
        if (forgotForm) forgotForm.style.display = "none";

        // Initialize localStorage
        if (!localStorage.getItem('userOrders')) {
            localStorage.setItem('userOrders', JSON.stringify([]));
        }
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify([]));
        }

        // Check user session
        checkUserSession();
    }

    // ======================
    // User Session Management
    // ======================
    function checkUserSession() {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const userNameElement = document.getElementById('user-name');
        
        if (user && userNameElement) {
            userNameElement.textContent = `${user.firstname} ${user.surname}`;
        }
    }

    // ======================
    // Form Handling
    // ======================
    function showForm(formToShow, ...formsToHide) {
        formToShow.style.display = "block";
        formsToHide.forEach(form => {
            if (form) form.style.display = "none";
        });
    }

    // User icon click handler
    if (userIcon) {
        userIcon.addEventListener("click", function() {
            if (loginForm && loginForm.style.display === "none") {
                showForm(loginForm, registerForm, forgotForm);
            } else if (loginForm) {
                loginForm.style.display = "none";
            }
        });
    }

    // Form navigation
    if (goToRegisterBtn) {
        goToRegisterBtn.addEventListener("click", (e) => {
            e.preventDefault();
            showForm(registerForm, loginForm, forgotForm);
        });
    }

    if (goToLoginBtn) {
        goToLoginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            showForm(loginForm, registerForm, forgotForm);
        });
    }

    if (backToLoginBtn) {
        backToLoginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            showForm(loginForm, forgotForm, registerForm);
        });
    }

    if (goToForgotBtn) {
        goToForgotBtn.addEventListener("click", (e) => {
            e.preventDefault();
            showForm(forgotForm, loginForm, registerForm);
        });
    }

    // ======================
    // Authentication
    // ======================
    // Registration
    if (registerBtn) {
        registerBtn.addEventListener("click", async function() {
            const formData = {
                firstname: document.querySelector('#uregister input[name="firstname"]').value.trim(),
                surname: document.querySelector('#uregister input[name="surname"]').value.trim(),
                mobile: document.querySelector('#uregister input[name="mobile"]').value.trim(),
                email: document.querySelector('#uregister input[name="email"]').value.trim(),
                password: document.querySelector('#uregister input[name="password"]').value,
                confirmPassword: document.querySelector('#uregister input[name="confirm_password"]').value
            };

            // Validation
            if (!Object.values(formData).every(Boolean)) {
                alert("Please fill in all fields.");
                return;
            }

            if (!/^\d{10}$/.test(formData.mobile)) {
                alert("Please enter a valid 10-digit mobile number.");
                return;
            }

            if (!/\S+@\S+\.\S+/.test(formData.email)) {
                alert("Please enter a valid email address.");
                return;
            }

            if (formData.password.length < 6) {
                alert("Password must be at least 6 characters long.");
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            try {
                const response = await fetch('http://localhost:5500/register', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(formData)
                });
              
                let data;
                try {
                  data = await response.json();
                } catch (err) {
                  throw new Error("Invalid JSON response from server.");
                }
              
                if (response.ok) {
                  alert("Registration successful! You can now log in.");
                  showForm(loginForm, registerForm, forgotForm);
                } else {
                  throw new Error(data.message || "Registration failed");
                }
              } catch (error) {
                console.error("Registration Error:", error);
                alert(error.message || "Registration failed. Please try again.");
              }
        });
    }

    // Login
    loginBtn.addEventListener("click", async function () {
        const email = document.querySelector('#login-page input[name="email"]').value.trim();
        const password = document.querySelector('#login-page input[name="password"]').value;

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        try {
            const response = await fetch('http://localhost:5500/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
                // Store user in sessionStorage
                const user = await fetch(`http://localhost:5500/get-user?email=${email}`);
                const userData = await user.json();
                sessionStorage.setItem('user', JSON.stringify(userData));
            
                // Redirect
                window.location.href = data.redirectUrl || "frontpage.html";
            } else {
                alert(data.message || "Login failed. Please check your credentials.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong. Please try again.");
        }
    });
    
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function() {
            sessionStorage.removeItem('user');
            window.location.href = "frontpage.html";
        });
    }

    // ======================
    // Cart & Checkout System
    // ======================
    // Add to cart functionality
    document.querySelectorAll('.bx-cart-alt').forEach(icon => {
        icon.addEventListener('click', function() {
            const productBox = this.closest('.box');
            const product = {
                id: productBox.getAttribute('data-id') || Date.now().toString(),
                name: productBox.querySelector('h2').textContent,
                price: parseFloat(productBox.querySelector('span').textContent.replace('$', '')),
                image: productBox.querySelector('img').src
            };

            addToCart(product);
            alert(`${product.name} added to cart!`);
        });
    });

    function addToCart(product) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            product.quantity = 1;
            cart.push(product);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    }

    function updateCartUI() {
        const cartContainer = document.querySelector('.cart');
        if (!cartContainer) return;

        // Clear existing items (except checkout button)
        const existingItems = cartContainer.querySelectorAll('.box');
        existingItems.forEach(item => item.remove());

        // Add current cart items
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'box';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="text">
                    <h3>${item.name}</h3>
                    <span data-unit-price="${item.price}">$${(item.price * item.quantity).toFixed(2)}</span>
                    <div class="quantity">
                        <button class="decrease">−</button>
                        <span class="count">${item.quantity}</span>
                        <button class="increase">+</button>
                    </div>
                </div>
                <i class='bx bxs-trash'></i>
            `;
            cartContainer.insertBefore(cartItem, cartContainer.querySelector('.checkout-btn'));
        });

        // Update cart count
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        }
    }

    // Checkout system
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
            if (cartItems.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            
            updateOrderSummary();
            checkoutModal.style.display = 'block';
        });
    }

    function updateOrderSummary() {
        const orderItems = document.getElementById('orderItems');
        const subtotalElement = document.getElementById('subtotal');
        const shippingElement = document.getElementById('shipping');
        const totalElement = document.getElementById('total');
        
        if (!orderItems || !subtotalElement || !shippingElement || !totalElement) return;
        
        orderItems.innerHTML = '';
        
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = 5.00;
        const total = subtotal + shipping;
        
        // Add items to summary
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'summary-item';
            itemElement.innerHTML = `
                <span>${item.name} (x${item.quantity})</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            `;
            orderItems.appendChild(itemElement);
        });
        
        // Update totals
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        shippingElement.textContent = `$${shipping.toFixed(2)}`;
        totalElement.textContent = `$${total.toFixed(2)}`;
    }

    // Place order
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener("click", async () => {
            const fullName = document.getElementById("fullName").value;
            const email = document.getElementById("email").value;
            const phone = document.getElementById("phone").value;
            const address = document.getElementById("address").value;
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
            if (!fullName || !email || !phone || !address || cart.length === 0) {
                alert("Please fill in all fields and make sure the cart is not empty.");
                return;
            }
    
            const orderPayload = {
                username: fullName,
                email,
                phone,
                address,
                items: cart
            };
    
            try {
                const res = await fetch("http://localhost:5500/placeOrder", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(orderPayload)
                });
    
                const result = await res.json();
                if (res.ok) {
                    alert("Order placed successfully!");
                    localStorage.removeItem('cart');
                    document.getElementById("checkoutModal").style.display = "none";
                    // Optionally update UI
                } else {
                    alert(result.message || "Failed to place order.");
                }
            } catch (err) {
                console.error("Error placing order:", err);
                alert("Failed to place order due to a network/server error.");
            }
        });
    }

    // ======================
    // UI Interactions
    // ======================
    // Search toggle
    document.querySelector('#search-icon')?.addEventListener('click', () => {
        searchBox.classList.toggle('active');
        cart.classList.remove('active');
        navbar.classList.remove('active');
    });

    // Cart toggle
    document.querySelector('#cart-icon')?.addEventListener('click', () => {
        cart.classList.toggle('active');
        searchBox.classList.remove('active');
        navbar.classList.remove('active');
        updateCartUI();
    });

    // Menu toggle
    document.querySelector('#menu-icon')?.addEventListener('click', () => {
        navbar.classList.toggle('active');
        searchBox.classList.remove('active');
        cart.classList.remove('active');
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            checkoutModal.style.display = 'none';
        }
    });

    // Initialize Swiper for product carousel
    const swiper = new Swiper('.new-arrival', {
        loop: true,
        slidesPerView: 3,
        spaceBetween: 20,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
    });

    // Initialize the application
    initApp();
});
// ======= Account Page Logic =======
document.addEventListener("DOMContentLoaded", async () => {
    const sessionUser = JSON.parse(sessionStorage.getItem("user"));
    if (!sessionUser || !sessionUser._id) return;
  
    try {
      const res = await fetch(`http://localhost:5500/api/user/${sessionUser._id}`);
      const data = await res.json();
  
      if (res.ok && data) {
        document.getElementById('username').value = data.username || '';
        document.getElementById('fullname').value = `${data.firstname || ''} ${data.surname || ''}`;
        document.getElementById('email').value = data.email || '';
        document.getElementById('bio').value = data.bio || '';
        document.getElementById('birthday').value = data.birthday || '';
        document.getElementById('country').value = data.country || '';
        document.getElementById('twitter').value = data.twitter || '';
        document.getElementById('linkedIn').value = data.linkedIn || '';
        document.getElementById('profileImage').src = data.profilePic || 'https://bootdey.com/img/Content/avatar/avatar1.png';
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  });
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (user && document.getElementById('username')) {
    document.getElementById('username').value = user.username || user.email.split('@')[0];
    document.getElementById('fullname').value = `${user.firstname} ${user.surname}`;
    document.getElementById('email').value = user.email;
  }
});

function enableEdit(fieldId) {
  const input = document.getElementById(fieldId);
  input.removeAttribute('disabled');
  input.focus();

  input.addEventListener("blur", () => {
    input.setAttribute('disabled', true);
    updateUserInfo();
  }, { once: true });
}



async function saveProfile() {
    const sessionUser = JSON.parse(sessionStorage.getItem("user"));
    if (!sessionUser || !sessionUser._id) return;
  
    const payload = {
      userID: sessionUser._id,
      username: document.getElementById("username").value,
      fullname: document.getElementById("fullname").value,
      email: document.getElementById("email").value,
      bio: document.getElementById("bio").value,
      birthday: document.getElementById("birthday").value,
      country: document.getElementById("country").value,
      twitter: document.getElementById("twitter").value,
      linkedIn: document.getElementById("linkedIn").value,
      profilePic: document.getElementById("profileImage").src
    };
  
    try {
      const res = await fetch("http://localhost:5500/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
  
      const result = await res.json();
      if (res.ok && result.success) {
        alert("Profile saved!");
        // Update sessionStorage
        const updatedUser = await fetch(`http://localhost:5500/api/user/${sessionUser._id}`);
        const userData = await updatedUser.json();
        sessionStorage.setItem("user", JSON.stringify(userData));
      } else {
        alert("Failed to save.");
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Error saving profile.");
    }
  }

  
  async function saveProfile() {
    const sessionUser = JSON.parse(sessionStorage.getItem("user"));
    if (!sessionUser || !sessionUser._id) return;
  
    const payload = {
      userID: sessionUser._id,
      username: document.getElementById("username").value,
      fullname: document.getElementById("fullname").value,
      email: document.getElementById("email").value,
      bio: document.getElementById("bio").value,
      birthday: document.getElementById("birthday").value,
      country: document.getElementById("country").value,
      twitter: document.getElementById("twitter").value,
      linkedIn: document.getElementById("linkedIn").value,
      profilePic: document.getElementById("profileImage").src
    };
  
    try {
      const res = await fetch("http://localhost:5500/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
  
      const result = await res.json();
      if (res.ok && result.success) {
        alert("Profile saved!");
        // Update sessionStorage
        const updatedUser = await fetch(`http://localhost:5500/api/user/${sessionUser._id}`);
        const userData = await updatedUser.json();
        sessionStorage.setItem("user", JSON.stringify(userData));
      } else {
        alert("Failed to save.");
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Error saving profile.");
    }
  }
  

async function updateUserInfo() {
  const email = document.getElementById("email")?.value;
  const username = document.getElementById("username")?.value;
  const fullname = document.getElementById("fullname")?.value;

  if (!email || !username || !fullname) return;

  try {
    const res = await fetch("http://localhost:5500/update-account", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, fullname })
    });

    const data = await res.json();
    if (res.ok) {
      sessionStorage.setItem('user', JSON.stringify(data.user));
      alert("Account updated successfully!");
    } else {
      alert(data.message || "Update failed");
    }
  } catch (err) {
    alert("Server error during account update.");
    console.error(err);
  }
}

// ======================
// Save Changes (Account Page)
// ======================
const saveChangesBtn = document.getElementById("saveChangesBtn");
if (saveChangesBtn) {
  saveChangesBtn.addEventListener("click", async function () {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user || !user.email) {
      alert("No user logged in.");
      return;
    }

    const updates = {
      firstname: document.getElementById("firstname")?.value,
      surname: document.getElementById("surname")?.value,
      mobile: document.getElementById("mobile")?.value,
      username: document.getElementById("username")?.value
    };

    try {
      const response = await fetch("http://localhost:5500/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, updates })
      });

      const result = await response.json();
      if (response.ok) {
        alert("Profile updated successfully!");
        sessionStorage.setItem("user", JSON.stringify(result.user));
        location.reload();
      } else {
        alert(result.message || "Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("An error occurred. Try again.");
    }
  });
}
