document.addEventListener('DOMContentLoaded', function () {
  // Get modal element
  var modal = document.getElementById('authModal')

  // Get header buttons that open the modal
  var headerLoginBtn = document.querySelector('.auth-buttons .login-btn')
  var headerSignupBtn = document.querySelector('.auth-buttons .signup-btn')

  // Get the <span> element that closes the modal
  var closeBtn = document.querySelector('.modal .close-button')

  // Get form elements
  var loginForm = document.getElementById('loginForm')
  var signupForm = document.getElementById('signupForm')

  // Get form switching links
  var showSignupLink = document.getElementById('showSignup')
  var showLoginLink = document.getElementById('showLogin')

  // Function to open modal and show specific form
  function openModal(formToShow) {
    modal.style.display = 'block'
    if (formToShow === 'login') {
      loginForm.style.display = 'block'
      signupForm.style.display = 'none'
    } else if (formToShow === 'signup') {
      loginForm.style.display = 'none'
      signupForm.style.display = 'block'
    }
  }

  // When the user clicks the header Login button, open the modal to the login form
  if (headerLoginBtn) {
    headerLoginBtn.onclick = function (e) {
      e.preventDefault() // Prevent default button behavior if it's a submit or link
      openModal('login')
    }
  }

  // When the user clicks the header Sign Up button, open the modal to the signup form
  if (headerSignupBtn) {
    headerSignupBtn.onclick = function (e) {
      e.preventDefault()
      openModal('signup')
    }
  }

  // When the user clicks on <span> (x), close the modal
  if (closeBtn) {
    closeBtn.onclick = function () {
      modal.style.display = 'none'
    }
  }

  // When the user clicks the "Sign Up" link in the login form, switch to signup form
  if (showSignupLink) {
    showSignupLink.onclick = function (e) {
      e.preventDefault()
      loginForm.style.display = 'none'
      signupForm.style.display = 'block'
    }
  }

  // When the user clicks the "Login" link in the signup form, switch to login form
  if (showLoginLink) {
    showLoginLink.onclick = function (e) {
      e.preventDefault()
      signupForm.style.display = 'none'
      loginForm.style.display = 'block'
    }
  }

  // When the user clicks anywhere outside of the modal content, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = 'none'
    }
  }

  // Prevent form submission for demo purposes
  var forms = document.querySelectorAll('.auth-form form')
  forms.forEach(function (form) {
    form.onsubmit = function (e) {
      // Nếu là form admin thì không alert demo nữa
      if (form.closest('#adminLoginForm')) return
      e.preventDefault()
      // alert('Form submitted (demo)!')
      // In a real application, you would handle form submission here (e.g., AJAX request)
      modal.style.display = 'none' // Optionally close modal on submit
    }
  })
})
