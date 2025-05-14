const profileForm = 
document.getElementById('profileform');
profileform.addEventListener('submit', function (e)
{
    e.preventDefault();
    const gender = document.getElementById('Gender').value;
    let age = 18;
    if (age >= 18) {
     alert("You are an adult.");
    } else {
     alert("You are a minor.");}
    const bio = document.getElementById('bio').value;
    // Save to localStorage (or backend later)
    localStorage.setItem('userGender', gender)
    localStorage.setItem('userAge', age)
    localStorage.setItem('userBio', bio)
    // For now, simulate sign-up success
    alert('Profile saved! Now redirecting to Homepage');
}
);