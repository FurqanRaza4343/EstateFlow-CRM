import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User,
  CheckCircle2,
  Github
} from 'lucide-react';
import insforge from '../lib/insforge';
import { UserProfile } from '../types';
import ShaderBackground from './ShaderBackground';
import SpecularButton from './SpecularButton';
import TextType from './TextType';

interface OnboardingAuthProps {
  lang?: 'en' | 'ur' | 'roman-urdu';
  onCompleteAuth: (user: UserProfile) => void;
}

type AuthView = 'login' | 'signup' | 'verify' | 'forgot-password' | 'reset-password' | 'loading';

export default function OnboardingAuth({ lang = 'en', onCompleteAuth }: OnboardingAuthProps) {
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
    Promise.race([
      insforge.database.from('agencies').select('id, name'),
      new Promise(resolve => setTimeout(() => resolve({ data: null, error: 'timeout' }), 4000))
    ]).then((result: any) => {
      if (result?.data) setAgencies(result.data);
    }).catch(() => {});
  }, []);

  // Auto-detect existing session on mount — always show welcome page first
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const checkSession = async () => {
      try {
        const { data, error } = await insforge.auth.getCurrentUser();
        if (cancelled || error || !data?.user) return;
        const authUser = data.user;
        const email = authUser.email || '';
        const { data: profile } = await insforge.database
          .from('profiles')
          .select('*')
          .eq('user_id', authUser.id)
          .maybeSingle();
        if (cancelled) return;
        // Wait for welcome typing animation to play first sentence
        timer = setTimeout(() => {
          if (!cancelled) {
            onCompleteAuth({
              id: profile?.id || authUser.id,
              organizationId: profile?.agency_id || agencies[0]?.id || '',
              name: profile?.name || authUser.raw_user_meta_data?.name || email.split('@')[0] || 'User',
              email,
              role: profile?.role || 'Admin / Business Owner',
              phone: profile?.phone || '',
              avatarSeed: profile?.avatar_seed || 'user',
            });
          }
        }, 3500);
      } catch (err) {
        console.error('[OnboardingAuth] Session check error:', err);
      }
    };
    checkSession();
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

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
        const userId = data.user?.id;
        const { data: existingProfile } = await insforge.database
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        let profile = existingProfile;
        if (!profile) {
          const { data: byEmail } = await insforge.database
            .from('profiles')
            .select('*')
            .eq('email', email)
            .maybeSingle();
          if (byEmail) {
            await insforge.database.from('profiles').update({ user_id: userId }).eq('id', byEmail.id);
            profile = { ...byEmail, user_id: userId };
          } else if (agencies.length > 0) {
            const { data: newP } = await insforge.database.from('profiles').insert([{
              user_id: userId,
              agency_id: agencies[0].id,
              name: fullName,
              email,
              role: 'Admin / Business Owner',
              phone: '',
            }]).select().single();
            if (newP) profile = newP;
          }
        }
        onCompleteAuth({
          id: profile?.id || userId,
          organizationId: profile?.agency_id || agencies[0]?.id || '',
          name: fullName || profile?.name || email.split('@')[0],
          email,
          role: profile?.role || 'Admin / Business Owner',
          phone: profile?.phone || '',
          avatarSeed: profile?.avatar_seed || 'user',
        });
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
      const { data, error } = await insforge.auth.verifyEmail({ email, otp });

      if (error) throw error;

      setSuccessMsg('Email verified! Signing you in...');
      const userId = data.user?.id;
      const { data: existingProfile } = await insforge.database
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      let profile = existingProfile;
      if (!profile) {
        const { data: byEmail } = await insforge.database
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();
        if (byEmail) {
          await insforge.database.from('profiles').update({ user_id: userId }).eq('id', byEmail.id);
          profile = { ...byEmail, user_id: userId };
        } else if (agencies.length > 0) {
          const { data: newP } = await insforge.database.from('profiles').insert([{
            user_id: userId,
            agency_id: agencies[0].id,
            name: fullName,
            email,
            role: 'Admin / Business Owner',
            phone: '',
          }]).select().single();
          if (newP) profile = newP;
        }
      }
      onCompleteAuth({
        id: profile?.id || userId,
        organizationId: profile?.agency_id || agencies[0]?.id || '',
        name: fullName || profile?.name || email.split('@')[0],
        email,
        role: profile?.role || 'Admin / Business Owner',
        phone: profile?.phone || '',
        avatarSeed: profile?.avatar_seed || 'user',
      });
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
      const { data, error } = await insforge.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.statusCode === 403) {
          setSuccessMsg('Email not verified. Check your inbox.');
          setView('verify');
        } else {
          throw error;
        }
        return;
      }

      setSuccessMsg('Login successful! Entering dashboard...');
      const { data: currentUser } = await insforge.auth.getCurrentUser();
      if (currentUser?.user) {
        const userId = currentUser.user.id;
        const email = currentUser.user.email || '';
        const { data: profile } = await insforge.database
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        let resolved = profile;
        if (!resolved) {
          const { data: byEmail } = await insforge.database
            .from('profiles')
            .select('*')
            .eq('email', email)
            .maybeSingle();
          if (byEmail) {
            await insforge.database.from('profiles').update({ user_id: userId }).eq('id', byEmail.id);
            resolved = { ...byEmail, user_id: userId };
          }
        }
        onCompleteAuth({
          id: resolved?.id || userId,
          organizationId: resolved?.agency_id || agencies[0]?.id || '',
          name: resolved?.name || email.split('@')[0],
          email,
          role: resolved?.role || 'Admin / Business Owner',
          phone: resolved?.phone || '',
          avatarSeed: resolved?.avatar_seed || 'user',
        });
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

    const result = await insforge.auth.signInWithOAuth(provider, {
      redirectTo: window.location.origin,
    });

    if (result.error) {
      setLoading(false);
      const msg = result.error.message || `${provider} login failed.`;
      console.error(`[OAuth] ${provider} error:`, msg, result.error);
      setErrorMsg(`${provider}: ${msg}`);
      return;
    }

    // If no redirect happened (server mode / skipBrowserRedirect), reset loading
    if (result.data?.url) {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await insforge.auth.sendResetPasswordEmail({
        email,
        redirectTo: window.location.origin,
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
      const { data: exchangeData, error: exchangeError } = await insforge.auth.exchangeResetPasswordToken({
        email,
        code: otp,
      });

      if (exchangeError) throw exchangeError;

      const { error: resetError } = await insforge.auth.resetPassword({
        newPassword,
        otp: exchangeData.token,
      });

      if (resetError) throw resetError;

      setSuccessMsg('Password reset successfully!');
      setTimeout(() => setView('login'), 2000);
    } catch (err: any) {
      setErrorMsg(err.errors?.[0]?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'loading') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
      <ShaderBackground />
      <div className="w-full max-w-md rounded-3xl overflow-hidden flex flex-col justify-between p-6 sm:p-8 z-20 relative my-6" style={{ background: 'var(--bg-surface)' }}>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold tracking-tight text-white" style={{ fontSize: '12px', background: 'var(--color-accent)' }}>
            EF
          </div>
          <p className="text-[10px] font-medium mt-3 tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Welcome to</p>
          <div className="mt-1.5 min-h-[40px] flex items-center justify-center">
            <TextType
              text={[
                "EstateFlow \u2014 Your Intelligent CRM Partner",
                "Streamline. Sell. Succeed.",
                "Your All-in-One Management Solution",
                "Real Estate CRM, Reinvented",
              ]}
              as="h2"
              typingSpeed={60}
              deletingSpeed={25}
              pauseDuration={2500}
              initialDelay={500}
              showCursor={true}
              cursorCharacter="|"
              cursorBlinkDuration={0.5}
              className="text-[16px] font-bold leading-tight"
            />
          </div>
          <style>{`
            .text-type {
              color: var(--color-accent);
              line-height: 1.3;
            }
            .text-type__cursor {
              color: var(--color-accent);
              font-weight: 100;
            }
          `}</style>
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
              <SpecularButton
                type="submit"
                size="md"
                disabled={loading}
                fullWidth
                baseColor="#ff5f03"
                lineColor="#ffffff"
                intensity={1.2}
                followMouse={true}
                proximity={200}
              >
                {loading ? 'Creating Account...' : 'Create Free Account'}
              </SpecularButton>
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
              <SpecularButton
                type="submit"
                size="md"
                disabled={loading}
                fullWidth
                baseColor="#ff5f03"
                lineColor="#ffffff"
                intensity={1.2}
                followMouse={true}
                proximity={200}
              >
                {loading ? 'Signing In...' : 'Log In to System'}
              </SpecularButton>
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
              <SpecularButton
                type="submit"
                size="md"
                disabled={loading}
                fullWidth
                baseColor="#ff5f03"
                lineColor="#ffffff"
                intensity={1.2}
                followMouse={true}
                proximity={200}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </SpecularButton>
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
              <SpecularButton
                type="submit"
                size="md"
                disabled={loading}
                fullWidth
                baseColor="#ff5f03"
                lineColor="#ffffff"
                intensity={1.2}
                followMouse={true}
                proximity={200}
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </SpecularButton>
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
              <SpecularButton
                type="submit"
                size="md"
                disabled={loading}
                fullWidth
                baseColor="#ff5f03"
                lineColor="#ffffff"
                intensity={1.2}
                followMouse={true}
                proximity={200}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </SpecularButton>
            </form>
          )}

          {(view === 'login' || view === 'signup') && (
            <>
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t" style={{ borderColor: 'var(--border-light)' }}></div>
                <span className="flex-shrink mx-3 text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Or Securely Connect</span>
                <div className="flex-grow border-t" style={{ borderColor: 'var(--border-light)' }}></div>
              </div>

              <SpecularButton
                type="button"
                size="md"
                fullWidth
                disabled={loading}
                onClick={() => handleOAuth('google')}
                baseColor="#1a1a2e"
                lineColor="#ffffff"
                intensity={1}
                followMouse={true}
                proximity={200}
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.6-4.53-5.35-4.53z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Continue with Google</span>
              </SpecularButton>
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
        Powered by InsForge • EstateFlow Real Estate CRM Platform
      </div>
    </div>
  );
}
