// Biến toàn cục kiểm soát việc đóng modal
window.isLoginProcessing = false;

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

  // Function to open modal with animation
  function openModal(formToShow) {
    // Hiển thị modal
    modal.style.display = 'block'

    // Thêm class để kích hoạt animation
    setTimeout(function() {
      modal.classList.add('modal-active')

      // Hiển thị form tương ứng với animation
      if (formToShow === 'login') {
        loginForm.style.display = 'block'
        signupForm.style.display = 'none'
        loginForm.classList.add('form-active')

        // Focus vào trường đầu tiên sau khi animation hoàn tất
        setTimeout(function() {
          loginForm.querySelector('input[type="text"]').focus()
        }, 300)
      } else if (formToShow === 'signup') {
        loginForm.style.display = 'none'
        signupForm.style.display = 'block'
        signupForm.classList.add('form-active')

        // Focus vào trường đầu tiên sau khi animation hoàn tất
        setTimeout(function() {
          signupForm.querySelector('input[type="text"]').focus()
        }, 300)
      }
    }, 10)
  }

  // Function to close modal with animation
  function closeModal() {
    // Thêm class để kích hoạt animation đóng
    modal.classList.remove('modal-active')

    // Đợi animation hoàn tất rồi mới ẩn modal
    setTimeout(function() {
      modal.style.display = 'none'
      // Xóa class active khỏi forms
      loginForm.classList.remove('form-active')
      signupForm.classList.remove('form-active')
    }, 300)
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
      // Chỉ đóng modal khi không trong quá trình đăng nhập
      if (!window.isLoginProcessing) {
        closeModal()
      }
    }
  }

  // Function to switch between forms with animation
  function switchForm(fromForm, toForm) {
    // Thêm class để kích hoạt animation ẩn
    fromForm.classList.add('form-hiding')

    // Đợi animation ẩn hoàn tất
    setTimeout(function() {
      fromForm.style.display = 'none'
      fromForm.classList.remove('form-active')
      fromForm.classList.remove('form-hiding')

      // Hiển thị form mới
      toForm.style.display = 'block'

      // Kích hoạt animation hiển thị
      setTimeout(function() {
        toForm.classList.add('form-active')

        // Focus vào trường đầu tiên
        toForm.querySelector('input[type="text"]').focus()
      }, 10)
    }, 200)
  }

  // When the user clicks the "Sign Up" link in the login form, switch to signup form
  if (showSignupLink) {
    showSignupLink.onclick = function (e) {
      e.preventDefault()
      switchForm(loginForm, signupForm)
    }
  }

  // When the user clicks the "Login" link in the signup form, switch to login form
  if (showLoginLink) {
    showLoginLink.onclick = function (e) {
      e.preventDefault()
      switchForm(signupForm, loginForm)
    }
  }

  // When the user clicks anywhere outside of the modal content, close it
  window.onclick = function (event) {
    // Chỉ đóng modal khi không trong quá trình đăng nhập
    if (event.target == modal && !window.isLoginProcessing) {
      closeModal()
    }
  }

  // Thêm hiệu ứng cho input fields
  var inputFields = document.querySelectorAll('.auth-form input')
  inputFields.forEach(function(input) {
    // Thêm class khi focus
    input.addEventListener('focus', function() {
      this.parentNode.classList.add('input-focused')
    })

    // Xóa class khi blur nếu không có giá trị
    input.addEventListener('blur', function() {
      if (!this.value) {
        this.parentNode.classList.remove('input-focused')
    }
    })

    // Kiểm tra nếu đã có giá trị (ví dụ: autofill)
    if (input.value) {
      input.parentNode.classList.add('input-focused')
  }
  })

  // Chỉ xử lý form đăng ký (form không có v-model của Vue)
  var signupFormEl = document.querySelector('#signupForm form')
  if (signupFormEl) {
    // Loại bỏ bất kỳ event handler nào đã được thêm trước đó
    var signupFormClone = signupFormEl.cloneNode(true);
    signupFormEl.parentNode.replaceChild(signupFormClone, signupFormEl);
    signupFormEl = signupFormClone;

    // Thêm sự kiện submit mới
    signupFormEl.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Hiển thị hiệu ứng loading khi submit
      var submitBtn = this.querySelector('.submit-btn')
      submitBtn.innerHTML = '<span class="loading-spinner"></span> Đang xử lý...'
      submitBtn.disabled = true

      // Giả lập xử lý form
      setTimeout(function() {
        // Đóng modal sau khi xử lý
        closeModal()

        // Khôi phục nút submit
        submitBtn.innerHTML = 'Đăng ký'
        submitBtn.disabled = false
      }, 1500)

      // Ngăn chặn bất kỳ hành động submit mặc định nào
      return false;
    });

    // Cũng xử lý cho nút submit
    var registerBtn = signupFormEl.querySelector('.submit-btn');
    if (registerBtn) {
      registerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        // Trigger sự kiện submit của form
        var submitEvent = new Event('submit', {bubbles: true, cancelable: true});
        signupFormEl.dispatchEvent(submitEvent);
      });
    }
  }
})
