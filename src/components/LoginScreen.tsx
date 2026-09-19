import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, signInAsSilas } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('silasvinicius.dev@gmail.com');
  const [password, setPassword] = useState('SilasFinance2026!');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('E-mail ou senha incorretos. Verifique suas credenciais ou use o botão de Acesso Rápido.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado. Por favor, faça login.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter no mínimo 6 caracteres.');
      } else {
        setError(err.message || 'Erro ao processar autenticação.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Digite seu e-mail para recuperar a senha.');
      return;
    }
    try {
      await resetPassword(email);
      setSuccessMsg('E-mail de recuperação enviado com sucesso!');
    } catch (err: any) {
      setError('Erro ao enviar e-mail de recuperação.');
    }
  };

  const handleQuickLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signInAsSilas();
    } catch (err: any) {
      setError('Erro no login rápido. Tente com o Google abaixo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a10] flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-blue-600/10 blur-[130px] rounded-full" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[400px] bg-indigo-600/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-xl shadow-blue-600/25 mb-4 border border-blue-400/20">
            <span className="text-2xl font-bold tracking-tight text-white">S</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            SILAS FINANCE
          </h1>
          <p className="text-sm text-slate-400 mt-1.5 font-normal">
            Controle financeiro pessoal e empresarial
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          <div className="flex items-center justify-between pb-5 border-b border-slate-800/60 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isSignUp ? 'Criar sua conta' : 'Acesso ao Sistema'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isSignUp ? 'Preencha os dados abaixo' : 'Entre com seu e-mail e senha'}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              PostgreSQL
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="email-input">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-[#161c2d] border border-slate-700/70 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300" htmlFor="password-input">
                  Senha
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••••••••"
                  className="w-full bg-[#161c2d] border border-slate-700/70 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'CRIAR CONTA' : 'ENTRAR'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0f1422] px-3 text-slate-500 font-medium tracking-wider">
                ou acesso direto
              </span>
            </div>
          </div>

          {/* Quick Access for Silas */}
          <button
            type="button"
            onClick={handleQuickLogin}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-900/40 to-indigo-900/40 hover:from-blue-900/60 hover:to-indigo-900/60 border border-blue-700/40 text-blue-200 text-xs font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer mb-3"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Entrar como Silas Vinícius (Acesso Imediato)
          </button>

          {/* Google Auth Button */}
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={isSubmitting}
            className="w-full bg-[#161c2d] hover:bg-[#1c2438] border border-slate-700/60 text-slate-200 text-xs font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continuar com o Google
          </button>

          {/* Toggle between Login and Signup */}
          <div className="mt-6 pt-5 border-t border-slate-800/60 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccessMsg(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              {isSignUp ? (
                <>
                  Já possui uma conta? <span className="text-blue-400 font-semibold">Faça Login</span>
                </>
              ) : (
                <>
                  Primeiro acesso? <span className="text-blue-400 font-semibold">Cadastre-se aqui</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6 font-mono">
          SILAS FINANCE • PostgreSQL & Cloud SQL
        </p>
      </div>
    </div>
  );
};
