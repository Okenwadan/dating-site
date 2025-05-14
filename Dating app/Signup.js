const signupForm = 
document.getElementById('signupForm')
.addEventListener('submit', function (e)
{
    e.preventDefault();
     const name = document.getElementById('fullName').value;
    const email = document.getElementById('signupupEmail').value;
    const password = document.getElementById('signuppassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    if (password !== confirm) {
        alert('passwords do no not match nwokem!'); return;
    }
    localStorage.setItem('userName', document.getElementById('fullName').value)
    localStorage.setItem('userEmail', email)
    localStorage.setItem('userPassword', password)
    // For now, simulate sign-up success
    alert('Welcome, ${name}! Your acccount has been created.');
    window.location.href = 'profile.html'; // redirect to profile
});