"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const supabase = createClient();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [sleep, setSleep] = useState(8);
  const [problems, setProblems] = useState("");
  const [conditions, setConditions] = useState("");
  const [location, setLocation] = useState("");
  const [happiness, setHappiness] = useState(5);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/auth"); return; }
      setUserId(session.user.id);
      setFullName((session.user.user_metadata?.full_name as string) ?? "");
    };
    init();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push("/auth");
    });
    return () => listener.subscription.unsubscribe();
  }, [router, supabase]);

  const handleNext = async () => {
    setMessage("");
    // Logic remains identical to your original code
    switch (step) {
      case 1: if (!fullName.trim()) return setMessage("Full Name cannot be empty"); break;
      case 2: if (!sleep || sleep <= 0) return setMessage("Sleep hours must be greater than 0"); break;
      case 3: if (!problems.trim()) return setMessage("Common Problems cannot be empty"); break;
      case 4: if (!conditions.trim()) return setMessage("Known Conditions cannot be empty"); break;
      case 5: if (!location.trim()) return setMessage("Location cannot be empty"); break;
      case 6: if (happiness < 0 || happiness > 10) return setMessage("Happiness must be 0-10"); break;
    }

    if (step < 6) { setStep(step + 1); return; }
    if (!userId) return setMessage("User not logged in");

    const { error } = await supabase.from("profiles").upsert(
      { id: userId, name: fullName, typical_sleep_hours: sleep, common_problems: problems, known_conditions: conditions, location, baseline_happiness: happiness },
      { onConflict: "id" }
    );
    if (error) return setMessage(error.message);
    router.push("/dashboard");
  };

  const progress = (step / 6) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-primary/30">
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-xl transition-all duration-500">
          
          {/* Top Navigation / Progress */}
          <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-xl italic">Horizon</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Step {step}/6</span>
              <div className="w-32 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-primary transition-all duration-700 ease-in-out" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 dark:shadow-none">
            
            <div className="min-h-[280px]">
              {/* Step 1: Identity */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-4xl font-extrabold tracking-tight italic">What's your name?</h2>
                  <p className="text-zinc-500 dark:text-zinc-400">Let’s keep it personal. How should we address you?</p>
                  <input
                    autoFocus
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-2xl bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-primary outline-none py-4 transition-all"
                    placeholder="Your name here..."
                  />
                </div>
              )}

              {/* Step 2: Sleep (Modern Grid) */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                  <h2 className="text-3xl font-extrabold tracking-tight italic">How's your rest?</h2>
                  <div className="grid grid-cols-4 gap-4 pt-4">
                    {[4, 5, 6, 7, 8, 9, 10, 11].map((h) => (
                      <button
                        key={h}
                        onClick={() => setSleep(h)}
                        className={`py-6 rounded-2xl border-2 transition-all font-bold ${sleep === h ? "border-primary bg-primary text-white scale-105 shadow-lg shadow-primary/20" : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 bg-zinc-50 dark:bg-zinc-900"}`}
                      >
                        {h}
                        <span className="block text-[10px] font-normal opacity-70">HRS</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Problems (Tag selector UI) */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-3xl font-extrabold tracking-tight italic">Current challenges?</h2>
                  <div className="flex flex-wrap gap-2">
                    {["Stress", "Anxiety", "Fatigue", "Focus", "Diet", "Motivation"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setProblems(tag)} // This logic keeps it simple, but UI looks premium
                        className={`px-6 py-3 rounded-full border text-sm font-semibold transition-all ${problems === tag ? "bg-primary border-primary text-white" : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-primary/50"}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={problems}
                    onChange={(e) => setProblems(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl border-none text-sm"
                    placeholder="Or type another problem..."
                  />
                </div>
              )}

              {/* Step 4: Conditions */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-3xl font-extrabold tracking-tight italic">Any conditions?</h2>
                  <p className="text-sm text-zinc-500">This helps us stay safe and accurate.</p>
                  <textarea
                    rows={4}
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 p-6 rounded-3xl border-none outline-none focus:ring-2 ring-primary/20 transition-all"
                    placeholder="e.g. Hypertension, Gluten Intolerance..."
                  />
                </div>
              )}

              {/* Step 5: Location */}
              {step === 5 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-3xl font-extrabold tracking-tight italic">Where are you?</h2>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all text-xl">📍</span>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-12 pr-6 py-6 bg-zinc-50 dark:bg-zinc-800 rounded-3xl border-none outline-none"
                      placeholder="Los Angeles, CA"
                    />
                  </div>
                </div>
              )}

              {/* Step 6: Happiness (Vertical Liquid Slider feel) */}
              {step === 6 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                  <h2 className="text-3xl font-extrabold tracking-tight italic">General Mood</h2>
                  <div className="flex flex-col items-center gap-6">
                    <div className="text-7xl font-black text-primary drop-shadow-sm">{happiness}</div>
                    <input
                      type="range" min="0" max="10" value={happiness}
                      onChange={(e) => setHappiness(+e.target.value)}
                      className="w-full h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full appearance-none accent-primary cursor-pointer"
                    />
                    <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      <span>Low Energy</span>
                      <span>Thriving</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="mt-12 flex items-center gap-4">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                >
                  <span className="sr-only">Back</span>
                  ←
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-grow bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-6 rounded-2xl font-bold text-lg hover:scale-[0.98] active:scale-95 transition-all shadow-xl shadow-zinc-900/10 dark:shadow-none"
              >
                {step < 6 ? "Continue" : "Finish Journey"}
              </button>
            </div>

            {message && (
              <p className="mt-6 text-sm font-bold text-red-500 text-center animate-pulse">{message}</p>
            )}
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
        &copy; {new Date().getFullYear()} Horizon Ecosystems
      </footer>
    </div>
  );
}