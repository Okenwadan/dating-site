// Initialize Firebase (already done in index.html)
// const firebaseConfig = { ... };
// firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();
// const rtdb = firebase.database();

// Splash screen heartbeat logic
window.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        var splash = document.getElementById('splash');
        var authApp = document.getElementById('authApp');
        if (splash) splash.style.display = 'none';
        if (authApp) authApp.style.display = 'block';
    }, 1800);
});

// Auth toggle logic
const showLogin = document.getElementById('showLogin');
const showSignup = document.getElementById('showSignup');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
showLogin.onclick = function() {
    showLogin.classList.add('active');
    showSignup.classList.remove('active');
    loginForm.style.display = '';
    signupForm.style.display = 'none';
};
showSignup.onclick = function() {
    showSignup.classList.add('active');
    showLogin.classList.remove('active');
    loginForm.style.display = 'none';
    signupForm.style.display = '';
};

// Profile photo preview logic
const signupPhoto = document.getElementById('signupPhoto');
const signupPhotoPreview = document.getElementById('signupPhotoPreview');
let uploadedPhotoFile = null;
signupPhoto.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        uploadedPhotoFile = file;
        const reader = new FileReader();
        reader.onload = function(evt) {
            signupPhotoPreview.src = evt.target.result;
            signupPhotoPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// --- Firebase Signup ---
signupForm.onsubmit = async function(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const bio = document.getElementById('signupBio').value;
    const interests = document.getElementById('signupInterests').value;
    const phone = document.getElementById('signupPhone').value;
    const year = parseInt(document.getElementById('dobYear').value);
    const month = parseInt(document.getElementById('dobMonth').value);
    const day = parseInt(document.getElementById('dobDay').value);
    const dob = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    if (age < 20) {
        alert('You are not eligible. You must be at least 20 years old.');
        return;
    }
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
        alert('Please enter a valid email address.');
        return;
    }
    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }
    try {
        // Create user in Firebase Auth
        const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = result.user;
        let avatarUrl = '';
        if (uploadedPhotoFile) {
            // Upload to Firebase Storage
            const storageRef = firebase.storage().ref();
            const avatarRef = storageRef.child('avatars/' + user.uid + '_' + uploadedPhotoFile.name);
            await avatarRef.put(uploadedPhotoFile);
            avatarUrl = await avatarRef.getDownloadURL();
        }
        // Save profile to Firestore
        await db.collection('users').doc(user.uid).set({
            name,
            email,
            bio,
            interests,
            phone,
            dob: dob.toISOString().split('T')[0],
            avatar: avatarUrl,
            status: 'Online'
        });
        // Save to localStorage for chat.html
        localStorage.setItem('currentUser', JSON.stringify({
            name,
            email,
            bio,
            interests,
            phone,
            dob: dob.toISOString().split('T')[0],
            avatar: avatarUrl,
            status: 'Online',
            uid: user.uid
        }));
        window.location.href = 'chat.html';
    } catch (err) {
        alert('Signup failed: ' + err.message);
    }
};

// --- Firebase Login ---
loginForm.onsubmit = async function(e) {
    e.preventDefault();
    const name = document.getElementById('loginName').value;
    const password = document.getElementById('loginPassword').value;
    try {
        // Find user by name in Firestore
        const usersSnap = await db.collection('users').where('name', '==', name).get();
        if (usersSnap.empty) {
            alert('No user found with that name.');
            return;
        }
        const userDoc = usersSnap.docs[0];
        const userData = userDoc.data();
        // Login with email and password
        await firebase.auth().signInWithEmailAndPassword(userData.email, password);
        // Save to localStorage for chat.html
        localStorage.setItem('currentUser', JSON.stringify({
            ...userData,
            uid: userDoc.id
        }));
        window.location.href = 'chat.html';
    } catch (err) {
        alert('Login failed: ' + err.message);
    }
};

// --- Google and Facebook Login ---
const signupGmailBtn = document.getElementById('signupGmailBtn');
const signupFacebookBtn = document.getElementById('signupFacebookBtn');

// Google Login
signupGmailBtn.onclick = async function(e) {
    e.preventDefault();
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;
        // Check if user profile exists in Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            // New user, create profile
            await db.collection('users').doc(user.uid).set({
                name: user.displayName || '',
                email: user.email,
                bio: '',
                interests: '',
                phone: user.phoneNumber || '',
                dob: '',
                avatar: user.photoURL || '',
                status: 'Online'
            });
        }
        // Save to localStorage
        const userData = (await db.collection('users').doc(user.uid).get()).data();
        localStorage.setItem('currentUser', JSON.stringify({ ...userData, uid: user.uid }));
        window.location.href = 'chat.html';
    } catch (err) {
        alert('Google login failed: ' + err.message);
    }
};

// Facebook Login
signupFacebookBtn.onclick = async function(e) {
    e.preventDefault();
    const provider = new firebase.auth.FacebookAuthProvider();
    try {
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;
        // Check if user profile exists in Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            // New user, create profile
            await db.collection('users').doc(user.uid).set({
                name: user.displayName || '',
                email: user.email,
                bio: '',
                interests: '',
                phone: user.phoneNumber || '',
                dob: '',
                avatar: user.photoURL || '',
                status: 'Online'
            });
        }
        // Save to localStorage
        const userData = (await db.collection('users').doc(user.uid).get()).data();
        localStorage.setItem('currentUser', JSON.stringify({ ...userData, uid: user.uid }));
        window.location.href = 'chat.html';
    } catch (err) {
        alert('Facebook login failed: ' + err.message);
    }
};

// Populate DOB dropdowns
(function() {
    const yearSelect = document.getElementById('dobYear');
    const monthSelect = document.getElementById('dobMonth');
    const daySelect = document.getElementById('dobDay');
    if (yearSelect && monthSelect && daySelect) {
        const now = new Date();
        const thisYear = now.getFullYear();
        for (let y = thisYear; y >= 1900; y--) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            yearSelect.appendChild(opt);
        }
        for (let m = 1; m <= 12; m++) {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m;
            monthSelect.appendChild(opt);
        }
        function updateDays() {
            const year = parseInt(yearSelect.value);
            const month = parseInt(monthSelect.value);
            const daysInMonth = new Date(year, month, 0).getDate();
            daySelect.innerHTML = '';
            for (let d = 1; d <= daysInMonth; d++) {
                const opt = document.createElement('option');
                opt.value = d;
                opt.textContent = d;
                daySelect.appendChild(opt);
            }
        }
        yearSelect.onchange = monthSelect.onchange = updateDays;
        yearSelect.value = thisYear - 20;
        monthSelect.value = 1;
        updateDays();
    }
})();

// Logout feature
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.onclick = function() {
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('splash').style.display = 'flex';
    setTimeout(function() {
        document.getElementById('splash').style.display = 'none';
        document.getElementById('authApp').style.display = 'block';
    }, 1800);
};

// Render profiles (excluding current user)
const profilesDiv = document.getElementById('profiles');
function renderProfiles() {
    profilesDiv.innerHTML = '';
    users.filter(u => u !== currentUser).forEach((profile, idx) => {
        const card = document.createElement('div');
        card.className = 'profile-card';
        card.innerHTML = `
            <h3>${profile.name}</h3>
            <p>${profile.bio}</p>
            <p><strong>Interests:</strong> ${profile.interests}</p>
            <p><strong>Phone:</strong> ${profile.phone || ''}</p>
            <div class="actions">
                <button class="like" onclick="alert('You liked ${profile.name}!')">Like</button>
                <button onclick="alert('You skipped ${profile.name}.')">Skip</button>
            </div>
        `;
        profilesDiv.appendChild(card);
    });
}

// Forgot password logic
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
forgotPasswordLink.onclick = async function(e) {
    e.preventDefault();
    const email = prompt('Enter your email address to reset your password:');
    if (!email) return;
    try {
        await firebase.auth().sendPasswordResetEmail(email);
        alert('Password reset email sent! Please check your inbox.');
    } catch (err) {
        alert('Error: ' + err.message);
    }
};
