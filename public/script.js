document.addEventListener('DOMContentLoaded', () => {
  const passwordInputs = document.querySelectorAll('.password-input');
const togglePasswordButtons = document.querySelectorAll('.toggle-password-button');

togglePasswordButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    const passwordInput = passwordInputs[index];
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
  });
});
});