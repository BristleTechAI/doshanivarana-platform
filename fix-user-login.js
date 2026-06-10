const fs = require('fs');

let content = fs.readFileSync('user-app/app/login.tsx', 'utf8');

if (!content.includes('useAuth')) {
  content = content.replace(
    "import { safeStorage } from '../src/old_app/lib/storage';",
    "import { safeStorage } from '../src/old_app/lib/storage';\nimport { useAuth } from '../src/contexts/AuthContext';"
  );
}

const oldComponentStart = `export default function LoginScreen() {
  const router = useRouter();`;

const newComponentStart = `export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();`;

content = content.replace(oldComponentStart, newComponentStart);

const oldVerifyOtp = `  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      setError(t('login.errorOtp'));
      return;
    }
    setError('');
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Save logged in user session
      safeStorage.setItem('doshanivarana_logged_in_user', JSON.stringify({ mobile: \`+91 \${mobileNumber}\` }));
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof Event === 'function') {
        window.dispatchEvent(new Event('doshanivarana_bookings_updated'));
      }
      // Go to setup screen (Deity Selection)
      router.replace('/setup');
    }, 1000);
  };`;

const newVerifyOtp = `  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError(t('login.errorOtp'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(mobileNumber, otp);
      safeStorage.setItem('doshanivarana_logged_in_user', JSON.stringify({ mobile: \`+91 \${mobileNumber}\` }));
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof Event === 'function') {
        window.dispatchEvent(new Event('doshanivarana_bookings_updated'));
      }
      router.replace('/setup');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };`;

content = content.replace(oldVerifyOtp, newVerifyOtp);

fs.writeFileSync('user-app/app/login.tsx', content);
console.log('Fixed user-app login.tsx');
