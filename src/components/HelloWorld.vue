<script setup>
document.addEventListener('DOMContentLoaded', function () {
    // Get modal element
    var modal = document.getElementById('authModal');

    // Get header buttons that open the modal
    var headerLoginBtn = document.querySelector('.auth-buttons .login-btn');
    var headerSignupBtn = document.querySelector('.auth-buttons .signup-btn');

    // Get the <span> element that closes the modal
    var closeBtn = document.querySelector('.modal .close-button');

    // Get form elements
    var loginForm = document.getElementById('loginForm');
    var signupForm = document.getElementById('signupForm');

    // Get form switching links
    var showSignupLink = document.getElementById('showSignup');
    var showLoginLink = document.getElementById('showLogin');

    // Function to open modal and show specific form
    function openModal(formToShow) {
        modal.style.display = 'block';
        if (formToShow === 'login') {
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
        } else if (formToShow === 'signup') {
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
        }
    }

    // When the user clicks the header Login button, open the modal to the login form
    if (headerLoginBtn) {
        headerLoginBtn.onclick = function (e) {
            e.preventDefault(); // Prevent default button behavior if it's a submit or link
            openModal('login');
        }
    }

    // When the user clicks the header Sign Up button, open the modal to the signup form
    if (headerSignupBtn) {
        headerSignupBtn.onclick = function (e) {
            e.preventDefault();
            openModal('signup');
        }
    }

    // When the user clicks on <span> (x), close the modal
    if (closeBtn) {
        closeBtn.onclick = function () {
            modal.style.display = 'none';
        }
    }

    // When the user clicks the "Sign Up" link in the login form, switch to signup form
    if (showSignupLink) {
        showSignupLink.onclick = function (e) {
            e.preventDefault();
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
        }
    }

    // When the user clicks the "Login" link in the signup form, switch to login form
    if (showLoginLink) {
        showLoginLink.onclick = function (e) {
            e.preventDefault();
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
        }
    }

    // When the user clicks anywhere outside of the modal content, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    // Prevent form submission for demo purposes
    var forms = document.querySelectorAll('.auth-form form');
    forms.forEach(function(form) {
        form.onsubmit = function(e) {
            e.preventDefault();
            alert('Form submitted (demo)!');
            // In a real application, you would handle form submission here (e.g., AJAX request)
            modal.style.display = 'none'; // Optionally close modal on submit
        }
    });
});
</script>

<template>
  <header>
      <nav class="navbar">
        <div class="logo">
          <a href="#">BookingLogo</a>
        </div>
        <ul class="nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">Bookings</a></li>
          <li><a href="#">Services</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
        <div class="auth-buttons">
          <button class="btn login-btn">Login</button>
          <button class="btn signup-btn">Sign Up</button>
        </div>
      </nav>
    </header>

    <!-- The Modal -->
    <div id="authModal" class="modal">
      <!-- Modal content -->
      <div class="modal-content">
        <span class="close-button">&times;</span>
        <div class="form-container">
          <!-- Login Form -->
          <div id="loginForm" class="auth-form">
            <h2>Login</h2>
            <form>
              <div class="input-group">
                <label for="loginEmail">Email</label>
                <input
                  type="email"
                  id="loginEmail"
                  name="loginEmail"
                  required
                />
              </div>
              <div class="input-group">
                <label for="loginPassword">Password</label>
                <input
                  type="password"
                  id="loginPassword"
                  name="loginPassword"
                  required
                />
              </div>
              <button type="submit" class="btn submit-btn">Login</button>
            </form>
            <p class="form-switcher">
              Don't have an account? <a href="#" id="showSignup">Sign Up</a>
            </p>
          </div>

          <!-- Signup Form -->
          <div id="signupForm" class="auth-form" style="display: none">
            <h2>Sign Up</h2>
            <form>
              <div class="input-group">
                <label for="signupName">Full Name</label>
                <input type="text" id="signupName" name="signupName" required />
              </div>
              <div class="input-group">
                <label for="signupEmail">Email</label>
                <input
                  type="email"
                  id="signupEmail"
                  name="signupEmail"
                  required
                />
              </div>
              <div class="input-group">
                <label for="signupPassword">Password</label>
                <input
                  type="password"
                  id="signupPassword"
                  name="signupPassword"
                  required
                />
              </div>
              <div class="input-group">
                <label for="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                />
              </div>
              <button type="submit" class="btn submit-btn">Sign Up</button>
            </form>
            <p class="form-switcher">
              Already have an account? <a href="#" id="showLogin">Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped>
/* General body styling */
body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; /* Modern font stack */
  margin: 0;
  padding: 0;
  /* Subtle gradient background */
  background-image: linear-gradient(to top, #f3e7e9 0%, #e3eeff 100%);
  color: #333;
  line-height: 1.6;
}

/* Header styling */
header {
  background-color: #ffffff; /* Slightly off-white for a softer look */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05); /* Softer shadow */
  padding: 1em 0;
  border-bottom: 3px solid #007bff; /* Accent border */
}

/* Navigation bar styling */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2em;
}

/* Logo styling */
.logo a {
  text-decoration: none;
  color: #0056b3; /* Darker blue for logo */
  font-size: 2em; /* Slightly larger logo */
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1); /* Subtle text shadow */
}

/* Navigation links styling */
.nav-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
}

.nav-links li {
  margin-left: 2.5em; /* Increased spacing */
}

.nav-links a {
  text-decoration: none;
  color: #4a4a4a; /* Darker grey for better readability */
  font-size: 1.1em;
  font-weight: 500; /* Slightly bolder */
  padding: 0.5em 0;
  position: relative; /* For ::after pseudo-element */
  transition: color 0.3s ease, border-bottom-color 0.3s ease;
}

.nav-links a::after {
  content: "";
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -5px; /* Adjust as needed */
  left: 50%;
  transform: translateX(-50%);
  background-color: #007bff;
  transition: width 0.3s ease;
}

.nav-links a:hover {
  color: #007bff;
}

.nav-links a:hover::after {
  width: 100%;
}

/* Authentication buttons styling */
.auth-buttons .btn {
  padding: 0.7em 1.8em; /* Adjusted padding */
  border: none;
  border-radius: 25px; /* More rounded buttons */
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: all 0.3s ease; /* Smooth transition for all properties */
  margin-left: 1em;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.login-btn {
  background-color: transparent;
  color: #007bff;
  border: 2px solid #007bff;
}

.login-btn:hover {
  background-color: #007bff;
  color: #fff;
  transform: translateY(-2px); /* Slight lift on hover */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.signup-btn {
  background-color: #007bff;
  color: #fff;
  border: 2px solid #007bff;
}

.signup-btn:hover {
  background-color: #0056b3;
  border-color: #0056b3;
  color: #fff;
  transform: translateY(-2px); /* Slight lift on hover */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Responsive adjustments (example for smaller screens) */
@media (max-width: 768px) {
  .nav-links {
    display: none; /* Hide links on small screens, can be replaced with a hamburger menu */
  }
  .navbar {
    flex-direction: column;
  }
  .logo {
    margin-bottom: 1em;
  }
  .auth-buttons {
    margin-top: 1em;
  }
}

/* Modal Styling */
.modal {
  display: none; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 1000; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgba(0, 0, 0, 0.6); /* Black w/ opacity */
  padding-top: 60px; /* Location of the box */
}

.modal-content {
  background-color: #fefefe;
  margin: 5% auto; /* 5% from the top and centered */
  padding: 30px;
  border: 1px solid #888;
  width: 90%; /* Could be more or less, depending on screen size */
  max-width: 500px; /* Maximum width */
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    top: -300px;
    opacity: 0;
  }
  to {
    top: 0;
    opacity: 1;
  } /* Adjust top if padding-top changes in .modal */
}

.close-button {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  position: absolute;
  top: 10px;
  right: 20px;
}

.close-button:hover,
.close-button:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

/* Form Container & Individual Forms */
.form-container h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
  font-size: 1.8em;
}

.auth-form .input-group {
  margin-bottom: 20px;
}

.auth-form label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.auth-form input[type="text"],
.auth-form input[type="email"],
.auth-form input[type="password"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box; /* So padding doesn't affect width */
  font-size: 1em;
}

.auth-form input[type="text"]:focus,
.auth-form input[type="email"]:focus,
.auth-form input[type="password"]:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.25);
}

.auth-form .submit-btn {
  background-color: #007bff;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
  font-weight: 600;
  width: 100%;
  transition: background-color 0.3s ease;
  margin-top: 10px;
}

.auth-form .submit-btn:hover {
  background-color: #0056b3;
}

.form-switcher {
  text-align: center;
  margin-top: 20px;
  font-size: 0.95em;
}

.form-switcher a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.form-switcher a:hover {
  text-decoration: underline;
}

</style>
