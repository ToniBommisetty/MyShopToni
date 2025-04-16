// Select elements for user interaction

let userIcon = document.querySelector('#user-icon');
let user = document.querySelector('.user');






userIcon.addEventListener('click', () => {
    user.classList.toggle('active');
});


// Function to show the registration form
function showRegister() {
    document.getElementById("uregister").style.display = "block";
    document.getElementById("lgn-btn").style.display = "none";
}

// Function to show the login form
function showLogin() {
    document.getElementById("uregister").style.display = "none";
    document.getElementById("lgn-btn").style.display = "block";
}





