jQuery(document).ready(function () {
  jQuery("#loginForm").submit(function (event) {
    event.preventDefault();
    const username = jQuery("#loginUsername").val();
    const password = jQuery("#loginPassword").val();

    // Perform client-side validation
    if (username && password) {
      // You can make an AJAX request to the server for login
      console.log("Logged in:", username);
    } else {
      alert("Please fill in both fields.");
    }
  });

  jQuery("#registerForm").submit(function (event) {
    event.preventDefault();
    const username = jQuery("#registerUsername").val();
    const password = jQuery("#registerPassword").val();

    // Perform client-side validation
    if (username && password) {
      // You can make an AJAX request to the server for registration
      console.log("Registered:", username);
    } else {
      alert("Please fill in both fields.");
    }
  });
});