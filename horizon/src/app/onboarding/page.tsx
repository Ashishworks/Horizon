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
  const [sleep, setSleep] = useState(7);
  const [problems, setProblems] = useState("");
  const [conditions, setConditions] = useState("");
  const [location, setLocation] = useState("");
  const [happiness, setHappiness] = useState(5); // baseline_happiness (default 5/10)
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!session) {
      router.push("/auth");
    } else {
      setFullName(session.user?.user_metadata?.full_name || "");
    }
  }, [session]);

  const handleNext = async () => {
    if (!session) return setMessage("User not logged in");

    if (step < 6) { // Now we have 6 steps
      setStep(step + 1);
    } else {
      // Submit all data for the current logged-in user
      const { error } = await supabase.from("profiles").insert({
        id: session.user.id,
        email: session.user.email,
        name: fullName,
        typical_sleep_hours: sleep,
        common_problems: problems,
        known_conditions: conditions,
        location,
        baseline_happiness: happiness, // ✅ new field
      });
      if (error) return setMessage(error.message);

      router.push("/dashboard");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Onboarding ({step}/6)</h2>

      {step === 1 && (
        <div>
          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full mb-4 p-2 border rounded placeholder-gray-400"
          />
        </div>
      )}

      {step === 2 && (
        <div>
          <label>Typical Sleep Hours</label>
          <input
            type="number"
            value={sleep}
            onChange={e => setSleep(+e.target.value)}
            className="w-full mb-4 p-2 border rounded placeholder-gray-400"
          />
        </div>
      )}

      {step === 3 && (
        <div>
          <label>Common Problems</label>
          <input
            type="text"
            value={problems}
            onChange={e => setProblems(e.target.value)}
            className="w-full mb-4 p-2 border rounded placeholder-gray-400"
          />
        </div>
      )}

      {step === 4 && (
        <div>
          <label>Known Conditions</label>
          <input
            type="text"
            value={conditions}
            onChange={e => setConditions(e.target.value)}
            className="w-full mb-4 p-2 border rounded placeholder-gray-400"
          />
        </div>
      )}

      {step === 5 && (
        <div>
          <label>Location</label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full mb-4 p-2 border rounded placeholder-gray-400"
          />
        </div>
      )}

      {step === 6 && (
        <div>
          <label>
            Scale your average happiness level on an average day ({happiness}/10)
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={happiness}
            onChange={e => setHappiness(+e.target.value)}
            className="w-full mb-4"
          />
        </div>
      )}

      <button
        onClick={handleNext}
        className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
      >
        {step < 6 ? "Next" : "Finish"}
      </button>

      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}
