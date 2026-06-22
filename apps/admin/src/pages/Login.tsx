import { useState } from 'react';
import { Plane, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export function Login() {
  const { signIn } = useAuth();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('+91');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const sendOtp = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await api.sendOtp(phone.trim());
      setHint(`Code sent to ${res.phoneMasked}. (Dev: check the API server console.)`);
      setStep('code');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await api.verifyOtp(phone.trim(), code.trim());
      if (res.user.role !== 'ADMIN') {
        setError('This account is not an administrator.');
        return;
      }
      signIn(res.user, res.tokens);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Plane className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold">CarryMate</p>
            <p className="text-xs text-muted-foreground">Admin sign in</p>
          </div>
        </div>

        {step === 'phone' ? (
          <div className="space-y-4">
            <label className="block text-sm font-medium">Phone number</label>
            <input
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+9198XXXXXXXX"
              autoFocus
            />
            <button
              onClick={sendOtp}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send code
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-sm font-medium">Verification code</label>
            <input
              className="w-full rounded-lg border bg-background px-3 py-2 text-center text-lg tracking-[0.4em] outline-none focus:ring-2 focus:ring-ring"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
              inputMode="numeric"
              autoFocus
            />
            <button
              onClick={verify}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Verify & sign in
            </button>
            <button
              onClick={() => setStep('phone')}
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              Use a different number
            </button>
          </div>
        )}

        {hint && <p className="mt-4 rounded-lg bg-muted p-2 text-xs text-muted-foreground">{hint}</p>}
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
