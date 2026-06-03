// Inside submitAll click handler, after gathering userData:
try {
    const profileData = {
        firstName: userData.name.split(' ')[0],
        lastName: userData.name.split(' ').slice(1).join(' '),
        name: userData.name,
        age: userData.age,
        location: userData.location,
        phone: userData.phone,
        bio: userData.bio,
        interests: userData.interests,
        profession: document.getElementById('regProfession').value.trim(),
        income: document.getElementById('regIncome').value.trim(),
        netWorth: document.getElementById('regNetWorth').value.trim(),
        avatar: userData.avatar,
        plan: userData.plan
    };
    await registerUser(userData.email, userData.password, profileData);
    showToast(`✨ Welcome to the Circle, ${userData.name.split(' ')[0]}!`);
    setTimeout(() => { window.location.href = 'index.html?redirect=dashboard.html'; }, 2000);
} catch (error) {
    if (error.code === 'auth/email-already-in-use') {
        showToast('📧 This email is already registered.');
    } else {
        showToast('❌ Registration failed: ' + error.message);
    }
}