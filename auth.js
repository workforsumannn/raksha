// ==========================================
// RAKSHA — Auth & User Management
// ==========================================

window.currentUser = null;
window.currentProfile = null;

async function checkSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    window.currentUser = session.user;
    await loadProfile(session.user.id);
  }
  return session;
}

async function loadProfile(userId) {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (!error && data) window.currentProfile = data;
}

async function signUp(email, password, fullName, phone) {
  const { data, error } = await supabaseClient.auth.signUp({
    email, password,
    options: { data: { full_name: fullName, phone: phone } }
  });
  if (error) throw error;
  return data;
}

async function signIn(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  window.currentUser = data.user;
  await loadProfile(data.user.id);
  return data;
}

async function signOut() {
  await supabaseClient.auth.signOut();
  window.currentUser = null;
  window.currentProfile = null;
  showToast('👋 Logged out');
  setTimeout(() => location.href = 'index.html', 1000);
}

// Auth Modal
function openAuthModal() {
  document.getElementById('authModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeAuthModal(e) {
  if (e && e.target !== document.getElementById('authModal')) return;
  document.getElementById('authModal').classList.remove('active');
  document.body.style.overflow = '';
}
function switchAuthTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const tabLogin = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');
  if (tab === 'login') {
    loginForm.style.display = 'block'; signupForm.style.display = 'none';
    tabLogin.classList.add('active'); tabSignup.classList.remove('active');
  } else {
    loginForm.style.display = 'none'; signupForm.style.display = 'block';
    tabSignup.classList.add('active'); tabLogin.classList.remove('active');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('loginSubmit');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
  try {
    await signIn(
      document.getElementById('loginEmail').value,
      document.getElementById('loginPassword').value
    );
    closeAuthModal();
    showToast('✅ Welcome back!');
    setTimeout(() => location.href = 'dashboard.html', 1000);
  } catch (err) {
    showToast('❌ ' + err.message);
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const btn = document.getElementById('signupSubmit');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
  try {
    await signUp(
      document.getElementById('signupEmail').value,
      document.getElementById('signupPassword').value,
      document.getElementById('signupName').value,
      document.getElementById('signupPhone').value
    );
    showToast('✅ Account created! Signing in...');
    await signIn(
      document.getElementById('signupEmail').value,
      document.getElementById('signupPassword').value
    );
    closeAuthModal();
    setTimeout(() => location.href = 'dashboard.html', 1200);
  } catch (err) {
    showToast('❌ ' + err.message);
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
  }
}

// Toast
let toastTimeout;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

// Keyboard
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const authModal = document.getElementById('authModal');
    if (authModal) authModal.classList.remove('active');
    document.body.style.overflow = '';
  }
});