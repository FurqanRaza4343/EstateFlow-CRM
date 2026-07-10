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
  ArrowRight,
  CheckCircle2,
  Github
} from 'lucide-react';
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
    let cancelled = false;
    let retries = 0;
    const MAX_RETRIES = 8;
    const RETRY_MS = 600;

    const checkExistingSession = async () => {
      while (retries < MAX_RETRIES && !cancelled) {
        try {
          const { data, error } = await insforge.auth.getCurrentUser();
          if (!cancelled && !error && data?.user) {
            const { data: profile } = await insforge.database
              .from('profiles')
              .select('*')
              .eq('user_id', data.user.id)
              .maybeSingle();
            if (!cancelled) {
              const userProfile = mapToUserProfile(data.user, profile);
              onCompleteAuth(userProfile);
            }
            return;
          }
        } catch {
          // SDK might still be exchanging OAuth code
        }
        retries++;
        if (retries < MAX_RETRIES && !cancelled) {
          await new Promise(r => setTimeout(r, RETRY_MS));
        }
      }
    };
    checkExistingSession();
    return () => { cancelled = true; };
  }, []);

  const handleNextSlide = () => {
    setActiveSlide(prev => (prev + 1) % ONBOARDING_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide(prev => (prev - 1 + ONBOARDING_SLIDES.length) % ONBOARDING_SLIDES.length);
  };

  const mapToUserProfile = (authUser: any, profile: any): UserProfile => {
    return {
      id: profile?.id || authUser.id,
      organizationId: profile?.agency_id || agencies[0]?.id || 'org-estateflow-1',
      name: profile?.name || authUser.profile?.name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || '',
      role: profile?.role || 'Admin / Business Owner',
      phone: profile?.phone || '',
      avatarSeed: profile?.avatar_seed || 'user',
    };
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
      const { data, error } = await insforge.auth.signUp({
        email,
        password,
        name: fullName,
        redirectTo: window.location.origin,
      });

      if (error) throw error;

      if (data?.requireEmailVerification) {
        setSuccessMsg('Account created! Please check your email for the verification code.');
        setView('verify');
      } else if (data?.accessToken) {
        setSuccessMsg('Account created successfully!');
        const { data: profile } = await insforge.database
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .maybeSingle();
        const userProfile = mapToUserProfile(data.user, profile);
        setTimeout(() => onCompleteAuth(userProfile), 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await insforge.auth.verifyEmail({
        email,
        otp,
      });

      if (error) throw error;

      setSuccessMsg('Email verified! Signing you in...');
      const { data: profile } = await insforge.database
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle();
      const userProfile = mapToUserProfile(data.user, profile);
      setTimeout(() => onCompleteAuth(userProfile), 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Check your code.');
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
      const { data, error } = await insforge.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.statusCode === 403) {
          setSuccessMsg('Email not verified. Check your inbox for the verification code.');
          setView('verify');
          return;
        }
        throw error;
      }

      setSuccessMsg('Login successful! Entering dashboard...');
      const { data: profile } = await insforge.database
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle();
      const userProfile = mapToUserProfile(data.user, profile);
      setTimeout(() => onCompleteAuth(userProfile), 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await insforge.auth.signInWithOAuth(provider, {
        redirectTo: window.location.origin,
      });
    } catch (err: any) {
      setErrorMsg(err.message || `${provider} login failed.`);
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await insforge.auth.sendResetPasswordEmail({ email });
      setSuccessMsg('Password reset code sent to your email!');
      setView('reset-password');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data } = await insforge.auth.exchangeResetPasswordToken({ email, code: otp });
      await insforge.auth.resetPassword({ newPassword, otp: data.token });
      setSuccessMsg('Password reset successfully! You can now login.');
      setTimeout(() => setView('login'), 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Password reset failed.');
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

        {/* Slides */}
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

        {/* Auth View */}
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

          {/* Sign Up Form */}
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

          {/* Login Form */}
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

          {/* Verify Email Form */}
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
              <button type="button" onClick={() => insforge.auth.resendVerificationEmail({ email, redirectTo: window.location.origin })} className="text-[11px] font-medium block w-full text-center cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                Resend Code
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
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

          {/* Reset Password Form */}
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

          {/* OAuth + Toggle - only on login/signup */}
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

          {/* DEMO MODE */}
          {(view === 'login' || view === 'signup') && (
            <div className="pt-4 mt-2" style={{ borderTop: '1px solid var(--border-light)' }}>
              <button
                type="button"
                onClick={() => {
                  const demoUser: UserProfile = {
                    id: 'user-demo-1',
                    organizationId: 'org-estateflow-1',
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

          {/* Mode Toggle */}
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
        Powered by InsForge • EstateFlow Real Estate CRM Platform
      </div>
    </div>
  );
}
