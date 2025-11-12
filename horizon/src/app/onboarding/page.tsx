"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

export default function OnboardingPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [sleep, setSleep] = useState(8);
  const [problems, setProblems] = useState("");
  const [conditions, setConditions] = useState("");
  const [location, setLocation] = useState("");
  const [happiness, setHappiness] = useState(5);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!session) {
      router.push("/auth");
    } else {
      setFullName(session.user?.user_metadata?.full_name || "");
    }
  }, [session, router]);

  const handleNext = async () => {
    setMessage(""); // Clear previous messages

    // Validation
    switch (step) {
      case 1:
        if (!fullName.trim()) return setMessage("Full Name cannot be empty");
        break;
      case 2:
        if (!sleep || sleep <= 0) return setMessage("Sleep hours must be greater than 0");
        break;
      case 3:
        if (!problems.trim()) return setMessage("Common Problems cannot be empty");
        break;
      case 4:
        if (!conditions.trim()) return setMessage("Known Conditions cannot be empty");
        break;
      case 5:
        if (!location.trim()) return setMessage("Location cannot be empty");
        break;
      case 6:
        if (happiness < 0 || happiness > 10) return setMessage("Happiness must be 0-10");
        break;
    }

    if (step < 6) {
      setStep(step + 1);
    } else {
      if (!session) return setMessage("User not logged in");

      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: session.user.id,
            name: fullName,
            typical_sleep_hours: sleep,
            common_problems: problems,
            known_conditions: conditions,
            location,
            baseline_happiness: happiness,
          },
          { onConflict: "id" }
        );

      if (error) return setMessage(error.message);

      router.push("/dashboard");
    }
  };

  return (
    // Replaced page background
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow flex items-center justify-center">
        {/* Replaced card and text colors */}
        <div className="w-full max-w-md p-6 border rounded-lg shadow-lg bg-card text-card-foreground">
          <h2 className="text-2xl font-bold mb-4 text-center">Onboarding ({step}/6)</h2>

          {step === 1 && (
            <div>
              <label className="block mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                // Replaced input colors
                className="w-full mb-4 p-2 border rounded bg-input placeholder:text-muted-foreground"
                placeholder="Enter your full name"
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block mb-2">Typical Sleep Hours</label>
              <input
                type="number"
                value={sleep}
                onChange={(e) => setSleep(+e.target.value)}
                // Replaced input colors
                className="w-full mb-4 p-2 border rounded bg-input placeholder:text-muted-foreground"
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="block mb-2">Common Problems</label>
              <input
                type="text"
                value={problems}
                onChange={(e) => setProblems(e.target.value)}
                // Replaced input colors
                className="w-full mb-4 p-2 border rounded bg-input placeholder:text-muted-foreground"
                placeholder="Enter any common problems"
              />
            </div>
          )}

          {step === 4 && (
            <div>
              <label className="block mb-2">Known Conditions</label>
              <input
                type="text"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                // Replaced input colors
                className="w-full mb-4 p-2 border rounded bg-input placeholder:text-muted-foreground"
                placeholder="Enter any known conditions"
              />
            </div>
          )}

          {step === 5 && (
            <div>
              <label className="block mb-2">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                // Replaced input colors
                className="w-full mb-4 p-2 border rounded bg-input placeholder:text-muted-foreground"
                placeholder="Enter your location"
              />
            </div>
          )}

          {step === 6 && (
            <div>
              <label className="block mb-2">
                Scale your average happiness level ({happiness}/10)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={happiness}
                onChange={(e) => setHappiness(+e.target.value)}
                // Added accent-primary for slider color
                className="w-full mb-4 accent-primary"
              />
            </div>
          )}

          <button
            onClick={handleNext}
            // Replaced button colors
            className="w-full bg-primary text-primary-foreground py-2 rounded hover:bg-primary/90"
          >
            {step < 6 ? "Next" : "Finish"}
          </button>

          {/* Replaced error text color */}
          {message && <p className="mt-4 text-destructive text-center">{message}</p>}
        </div>
      </main>
      {/* Themed the inline footer */}
      <footer className="p-4 text-center text-muted-foreground border-t border-border">
        &copy; {new Date().getFullYear()} Horizon
      </footer>
    </div>
  );
}