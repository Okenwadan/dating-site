const form = 
document.getElementById('loginform');
form.addEventListener('submit', function (e)
{
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const storedEmail = localStorage.getItem('userEmail')
    const storedPassword = localStorage.getItem('userPassword')
if (email === storedEmail && password === storedPassword) {
    alert('Welcome back, ${email}!');
    // You can redirect to a dashboard page here
}
else{alert('Invalid email or Password')}
localStorage.setItem("isLoggedIn", "true");
localStorage.setItem("username", "name");
window.location.href="home.html"
});