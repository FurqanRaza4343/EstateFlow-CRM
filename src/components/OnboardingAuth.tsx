import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Mail,
  Lock,
  User,
  CheckCircle2,
  Github
} from 'lucide-react';
import { useUser, useSignIn, useSignUp } from '@clerk/clerk-react';
import insforge from '../lib/insforge';
import { UserProfile } from '../types';
import ShaderBackground from './ShaderBackground';
import TextRollButton from './TextRollButton';

interface OnboardingAuthProps {
  lang?: 'en' | 'ur' | 'roman-urdu';
  onCompleteAuth: (user: UserProfile) => void;
}

const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: "Automatic Lead Allocation",
    description: "Instantly distribute incoming webhook or manual leads to your sales agents using round-robin algorithms.",
    icon: Users,
    color: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-950/60 text-emerald-400 border border-emerald-900/40"
  },
  {
    id: 2,
    title: "White-Label Customization",
    description: "Fully customize the CRM with your own agency logos, localized currency formats, and regional property units.",
    icon: Award,
    color: "from-indigo-500 to-blue-600",
    iconBg: "bg-indigo-950/60 text-indigo-400 border border-indigo-900/40"
  },
  {
    id: 3,
    title: "Gemini AI Co-Pilot",
    description: "Speak or type natural voice commands to draft social posts, allocate schedules, and take instant voice notes.",
    icon: Sparkles,
    color: "from-purple-500 to-pink-600",
    iconBg: "bg-purple-950/60 text-purple-400 border border-purple-900/40"
  }
];

type AuthView = 'login' | 'signup' | 'verify' | 'forgot-password' | 'reset-password';

export default function OnboardingAuth({ lang = 'en', onCompleteAuth }: OnboardingAuthProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [view, setView] = useState<AuthView>('login');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [agencies, setAgencies] = useState<any[]>([]);

  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % ONBOARDING_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Promise.race([
      insforge.database.from('agencies').select('id, name'),
      new Promise(resolve => setTimeout(() => resolve({ data: null, error: 'timeout' }), 4000))
    ]).then((result: any) => {
      if (result?.data) setAgencies(result.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || '';
      const finishAuth = async () => {
        try {
          const { data: profile } = await insforge.database
            .from('profiles')
            .select('*')
            .eq('clerk_id', clerkUser.id)
            .maybeSingle();
          onCompleteAuth({
            id: profile?.id || clerkUser.id,
            organizationId: profile?.agency_id || agencies[0]?.id || '',
            name: profile?.name || clerkUser.fullName || clerkUser.firstName || email.split('@')[0] || 'User',
            email,
            role: profile?.role || 'Admin / Business Owner',
            phone: profile?.phone || '',
            avatarSeed: profile?.avatar_seed || 'user',
          });
        } catch (err) {
          console.error('[OnboardingAuth] Profile fetch failed after OAuth — proceeding with Clerk user', err);
          onCompleteAuth({
            id: clerkUser.id,
            organizationId: agencies[0]?.id || '',
            name: clerkUser.fullName || clerkUser.firstName || email.split('@')[0] || 'User',
            email,
            role: 'Admin / Business Owner',
            phone: '',
            avatarSeed: 'user',
          });
        }
      };
      finishAuth();
    }
  }, [isSignedIn, clerkUser, isLoaded]);

  const handleNextSlide = () => {
    setActiveSlide(prev => (prev + 1) % ONBOARDING_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide(prev => (prev - 1 + ONBOARDING_SLIDES.length) % ONBOARDING_SLIDES.length);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName || !email || !password) {
      setErrorMsg('Full Name, Email and Password are required.');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName: fullName,
      });

      if (result.status === 'complete') {
        await setSignUpActive({ session: result.createdSessionId });
        const { data: profile } = await insforge.database
          .from('profiles')
          .select('*')
          .eq('clerk_id', result.createdUserId)
          .maybeSingle();
        setSuccessMsg('Account created successfully!');
        onCompleteAuth({
          id: profile?.id || result.createdUserId,
          organizationId: profile?.agency_id || agencies[0]?.id || '',
          name: fullName,
          email,
          role: profile?.role || 'Admin / Business Owner',
          phone: profile?.phone || '',
          avatarSeed: profile?.avatar_seed || 'user',
        });
      } else if (result.status === 'missing_fields') {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setSuccessMsg('Account created! Please check your email for the verification code.');
        setView('verify');
      }
    } catch (err: any) {
      setErrorMsg(err.errors?.[0]?.message || err.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code: otp });

      if (result.status === 'complete') {
        await setSignUpActive({ session: result.createdSessionId });
        setSuccessMsg('Email verified! Signing you in...');
        const { data: profile } = await insforge.database
          .from('profiles')
          .select('*')
          .eq('clerk_id', result.createdUserId)
          .maybeSingle();
        onCompleteAuth({
          id: profile?.id || result.createdUserId,
          organizationId: profile?.agency_id || agencies[0]?.id || '',
          name: fullName,
          email,
          role: profile?.role || 'Admin / Business Owner',
          phone: profile?.phone || '',
          avatarSeed: profile?.avatar_seed || 'user',
        });
      }
    } catch (err: any) {
      setErrorMsg(err.errors?.[0]?.message || err.message || 'Verification failed. Check your code.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email, password });

      if (result.status === 'complete') {
        await setSignInActive({ session: result.createdSessionId });
        setSuccessMsg('Login successful! Entering dashboard...');
      } else if (result.status === 'needs_prepare') {
        setSuccessMsg('Email not verified. Check your inbox.');
        setView('verify');
      }
    } catch (err: any) {
      setErrorMsg(err.errors?.[0]?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setErrorMsg(null);
    setLoading(true);

    try {
      await signIn.authenticateWithRedirect({
        strategy: `oauth_${provider}`,
        redirectUrl: window.location.origin,
        redirectUrlComplete: window.location.origin,
      });
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.errors?.[0]?.message || `${provider} login failed.`);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setSuccessMsg('Password reset code sent to your email!');
      setView('reset-password');
    } catch (err: any) {
      setErrorMsg(err.errors?.[0]?.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: otp,
        password: newPassword,
      });

      if (result.status === 'complete') {
        await setSignInActive({ session: result.createdSessionId });
        setSuccessMsg('Password reset successfully!');
        setTimeout(() => setView('login'), 2000);
      }
    } catch (err: any) {
      setErrorMsg(err.errors?.[0]?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const SlideIcon = ONBOARDING_SLIDES[activeSlide].icon;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
      <ShaderBackground />
      <div className="w-full max-w-md rounded-3xl overflow-hidden flex flex-col justify-between p-6 sm:p-8 z-20 relative my-6" style={{ background: 'var(--bg-surface)' }}>

        <div className="flex flex-col items-center mb-6">
          <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold tracking-tight text-white" style={{ fontSize: '12px', background: 'var(--color-accent)' }}>
            EF
          </div>
          <h2 className="text-[13px] font-semibold mt-2 tracking-wide" style={{ color: 'var(--text-primary)' }}>EstateFlow</h2>
          <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>Mobile First CRM Suite</p>
        </div>

        <div className="relative rounded-2xl p-4 sm:p-5 mb-6 flex flex-col items-center text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
          <button onClick={handlePrevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition cursor-pointer" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={handleNextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition cursor-pointer" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}>
            <ChevronRight size={16} />
          </button>
          <div className={`p-3 rounded-2xl inline-flex items-center justify-center mb-3.5`} style={{ background: 'var(--border-light)', color: 'var(--color-accent)' }}>
            <SlideIcon size={22} />
          </div>
          <div className="min-h-[92px] px-6">
            <div className="space-y-1 transition-all duration-300">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{ONBOARDING_SLIDES[activeSlide].title}</h3>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{ONBOARDING_SLIDES[activeSlide].description}</p>
            </div>
          </div>
          <div className="flex justify-center gap-1.5 mt-3">
            {ONBOARDING_SLIDES.map((_, idx) => (
              <button key={idx} onClick={() => setActiveSlide(idx)} className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === idx ? 'w-4' : 'w-1.5'}`} style={{ background: activeSlide === idx ? 'var(--color-accent)' : 'var(--border-color)' }} aria-label={`Go to slide ${idx + 1}`} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="pt-2 pb-1" style={{ borderTop: '1px solid var(--border-light)' }}>
            <h4 className="text-[11px] font-medium text-center" style={{ color: 'var(--text-muted)' }}>
              {view === 'login' && 'Sign In to EstateFlow'}
              {view === 'signup' && 'Create an Administrator Account'}
              {view === 'verify' && 'Verify Your Email'}
              {view === 'forgot-password' && 'Reset Password'}
              {view === 'reset-password' && 'Set New Password'}
            </h4>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl text-[10px] font-medium leading-relaxed" style={{ background: 'rgba(244,63,94,0.1)', color: '#fb7185', border: '1px solid rgba(244,63,94,0.2)' }}>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl text-[10px] font-medium flex items-center gap-2" style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckCircle2 size={13} style={{ color: '#34d399' }} />
              <span>{successMsg}</span>
            </div>
          )}

          {view === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium block" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}><User size={14} /></span>
                  <input type="text" placeholder="e.g. Shariq Alam" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium block" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}><Mail size={14} /></span>
                  <input type="email" placeholder="name@agency.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium block" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}><Lock size={14} /></span>
                  <input type="password" placeholder="•••••••• (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} />
                </div>
              </div>
              <TextRollButton
                text={loading ? 'Creating Account...' : 'Create Free Account'}
                bgColor=""
                hoverBg=""
                textColor="text-white"
                circleBg="bg-white"
                arrowIconColor="text-gray-900"
                circleSize="w-7 h-7"
                containerPad="pl-5 pr-2 py-2.5 w-full justify-center"
                fontSize="13px"
                type="submit"
                disabled={loading}
                style={{ background: 'var(--color-accent)' }}
              />
            </form>
          )}

          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium block" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}><Mail size={14} /></span>
                  <input type="email" placeholder="name@agency.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium block" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}><Lock size={14} /></span>
                  <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} />
                </div>
              </div>
              <TextRollButton
                text={loading ? 'Signing In...' : 'Log In to System'}
                bgColor=""
                hoverBg=""
                textColor="text-white"
                circleBg="bg-white"
                arrowIconColor="text-gray-900"
                circleSize="w-7 h-7"
                containerPad="pl-5 pr-2 py-2.5 w-full justify-center"
                fontSize="13px"
                type="submit"
                disabled={loading}
                style={{ background: 'var(--color-accent)' }}
              />
              <button type="button" onClick={() => setView('forgot-password')} className="text-[11px] font-medium block mx-auto text-center w-full cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                Forgot Password?
              </button>
            </form>
          )}

          {view === 'verify' && (
            <form onSubmit={handleVerifyEmail} className="space-y-3">
              <p className="text-[11px] text-center" style={{ color: 'var(--text-secondary)' }}>Enter the 6-digit code sent to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong></p>
              <div className="space-y-1">
                <label className="text-[11px] font-medium block" style={{ color: 'var(--text-secondary)' }}>Verification Code</label>
                <input type="text" placeholder="000000" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} className="w-full rounded-xl px-4 py-2.5 text-xs text-center tracking-[8px] font-bold focus:outline-none" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} />
              </div>
              <TextRollButton
                text={loading ? 'Verifying...' : 'Verify Email'}
                bgColor=""
                hoverBg=""
                textColor="text-white"
                circleBg="bg-white"
                arrowIconColor="text-gray-900"
                circleSize="w-7 h-7"
                containerPad="pl-5 pr-2 py-2.5 w-full justify-center"
                fontSize="13px"
                type="submit"
                disabled={loading}
                style={{ background: 'var(--color-accent)' }}
              />
            </form>
          )}

          {view === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium block" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}><Mail size={14} /></span>
                  <input type="email" placeholder="name@agency.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} />
                </div>
              </div>
              <TextRollButton
                text={loading ? 'Sending...' : 'Send Reset Code'}
                bgColor=""
                hoverBg=""
                textColor="text-white"
                circleBg="bg-white"
                arrowIconColor="text-gray-900"
                circleSize="w-7 h-7"
                containerPad="pl-5 pr-2 py-2.5 w-full justify-center"
                fontSize="13px"
                type="submit"
                disabled={loading}
                style={{ background: 'var(--color-accent)' }}
              />
            </form>
          )}

          {view === 'reset-password' && (
            <form onSubmit={handleResetPassword} className="space-y-3">
              <p className="text-[11px] text-center" style={{ color: 'var(--text-secondary)' }}>Enter the code sent to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong></p>
              <input type="text" placeholder="000000" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} className="w-full rounded-xl px-4 py-2.5 text-xs text-center tracking-[8px] font-bold focus:outline-none" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}><Lock size={14} /></span>
                <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} />
              </div>
              <TextRollButton
                text={loading ? 'Resetting...' : 'Reset Password'}
                bgColor=""
                hoverBg=""
                textColor="text-white"
                circleBg="bg-white"
                arrowIconColor="text-gray-900"
                circleSize="w-7 h-7"
                containerPad="pl-5 pr-2 py-2.5 w-full justify-center"
                fontSize="13px"
                type="submit"
                disabled={loading}
                style={{ background: 'var(--color-accent)' }}
              />
            </form>
          )}

          {(view === 'login' || view === 'signup') && (
            <>
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t" style={{ borderColor: 'var(--border-light)' }}></div>
                <span className="flex-shrink mx-3 text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Or Securely Connect</span>
                <div className="flex-grow border-t" style={{ borderColor: 'var(--border-light)' }}></div>
              </div>

              <button type="button" onClick={() => handleOAuth('google')} disabled={loading} className="w-full font-medium py-3 rounded-xl text-xs flex items-center justify-center gap-2.5 transition cursor-pointer disabled:opacity-50" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}>
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.6-4.53-5.35-4.53z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button type="button" onClick={() => handleOAuth('github')} disabled={loading} className="w-full font-medium py-3 rounded-xl text-xs flex items-center justify-center gap-2.5 transition cursor-pointer disabled:opacity-50" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}>
                <Github size={16} />
                <span>Continue with GitHub</span>
              </button>
            </>
          )}

          {(view === 'login' || view === 'signup') && (
            <div className="pt-4 mt-2" style={{ borderTop: '1px solid var(--border-light)' }}>
              <button
                type="button"
                onClick={() => {
                  const demoUser: UserProfile = {
                    id: 'user-demo-1',
                    organizationId: agencies[0]?.id || '',
                    name: 'Admin User',
                    email: 'admin@estateflow.com',
                    role: 'Admin / Business Owner',
                    phone: '+92 300 1234567',
                    avatarSeed: 'demo',
                  };
                  onCompleteAuth(demoUser);
                }}
                className="w-full font-bold py-3 rounded-xl text-xs transition cursor-pointer min-touch" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}
              >
                Enter CRM Demo (Offline Mode)
              </button>
              <p className="text-[9px] text-center mt-2" style={{ color: 'var(--text-muted)' }}>InsForge server unreachable? Use demo mode to explore CRM</p>
            </div>
          )}

          <div className="text-center pt-2">
            {view === 'login' && (
              <button type="button" onClick={() => { setView('signup'); setErrorMsg(null); setSuccessMsg(null); }} className="text-[11px] font-medium transition cursor-pointer" style={{ color: 'var(--color-accent)' }}>
                Don't have an account? Sign Up
              </button>
            )}
            {view === 'signup' && (
              <button type="button" onClick={() => { setView('login'); setErrorMsg(null); setSuccessMsg(null); }} className="text-[11px] font-medium transition cursor-pointer" style={{ color: 'var(--color-accent)' }}>
                Already have an account? Log In
              </button>
            )}
            {(view === 'verify' || view === 'forgot-password' || view === 'reset-password') && (
              <button type="button" onClick={() => { setView('login'); setErrorMsg(null); setSuccessMsg(null); }} className="text-[11px] font-medium transition cursor-pointer" style={{ color: 'var(--color-accent)' }}>
                Back to Login
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-[10px] font-medium flex items-center gap-1 mt-2 z-20" style={{ color: 'var(--text-muted)' }}>
        Powered by Clerk + InsForge • EstateFlow Real Estate CRM Platform
      </div>
    </div>
  );
}
