"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import { useRouter } from "next/navigation";
import { Activity, Brain, Rocket, PenLine, Sparkles } from "lucide-react";
import LoadingHorizon from "@/components/LoadingHorizon";
import Computer from "@/app/components/lottie/computer";

// --- INTERFACE (Updated to match all DB columns) ---
interface JournalEntry {
  [key: string]: any; // Allows dynamic access to all columns
  date: string;
  mood: number;
  daily_summary?: string;
}

const InfoCard = ({ title, icon: Icon, children, className = "" }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-card/40 backdrop-blur-md border border-border/50 rounded-[2rem] p-6 ${className}`}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><Icon size={20} /></div>
      <h3 className="font-bold text-lg tracking-tight">{title}</h3>
    </div>
    <div className="space-y-2">{children}</div>
  </motion.div>
);

const DataRow = ({ label, value }: { label: string; value: any }) => {
  if (value === null || value === undefined || value === "") return null;
  // Format arrays (like exercise) into comma-separated strings
  const displayValue = Array.isArray(value) ? value.join(", ") : value;
  
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/5 last:border-0">
      <span className="text-sm text-muted-foreground capitalize">{label.replace(/_/g, " ")}</span>
      <span className="text-sm font-semibold text-foreground text-right ml-4">{displayValue}</span>
    </div>
  );
};

export default function JournalHistoryPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [journalEntry, setJournalEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMoved, setIsMoved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      else router.push("/auth");
    };
    getUser();
  }, [router, supabase]);

  useEffect(() => {
    if (!userId || !selectedDate) { 
        setJournalEntry(null); 
        setIsMoved(false);
        return; 
    }

    const fetchEntry = async () => {
      setLoading(true);
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      
      const { data } = await supabase
        .from("journals")
        .select("*") // Fetches all columns automatically
        .eq("user_id", userId)
        .eq("date", formattedDate)
        .single();

      setJournalEntry(data as JournalEntry);
      setLoading(false);
      setIsMoved(true);
    };

    fetchEntry();
  }, [selectedDate, userId, supabase]);

  if (!userId) return <div className="h-screen flex items-center justify-center"><LoadingHorizon/></div>;

  return (
    <LayoutGroup>
      <div className="min-h-screen bg-background text-foreground pb-20 overflow-hidden">
        <header className="pt-20 pb-12 text-center px-4">
            <motion.h1 layout className="text-4xl md:text-5xl font-black tracking-tight mb-3">Journal History</motion.h1>
            <motion.p layout className="text-muted-foreground">Select a date to unlock your past insights.</motion.p>
        </header>

        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            layout
            transition={{ type: "spring", stiffness: 150, damping: 25 }}
            className={`flex flex-col lg:flex-row gap-12 ${!isMoved ? "items-center justify-center" : "items-start"}`}
          >
            {/* SIDEBAR / CENTERED CALENDAR */}
            <motion.aside layout className="flex flex-col items-center flex-shrink-0 w-full lg:w-auto">
              <motion.div 
                layout
                layoutId="calendar-box"
                animate={{ scale: isMoved ? 1 : 1.05 }}
                className="bg-card border border-border p-4 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-xl z-20 relative w-fit mx-auto"
              >
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={{ after: new Date() }}
                  className="modern-day-picker"
                />
                
                <AnimatePresence>
                    {loading && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center rounded-[2.5rem] md:rounded-[3rem] z-30"
                        >
                            <LoadingHorizon />
                        </motion.div>
                    )}
                </AnimatePresence>
              </motion.div>

              <AnimatePresence>
                {isMoved && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 0.3, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="hidden lg:block mt-10"
                  >
                    <Computer size={280} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.aside>

            {/* CONTENT AREA */}
            <AnimatePresence mode="popLayout">
              {isMoved && !loading && (
                <motion.main 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="flex-1 w-full"
                >
                  {journalEntry ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                             <h2 className="text-3xl md:text-4xl font-black text-blue-500">
                                {format(new Date(journalEntry.date + "T12:00:00"), "MMMM d, yyyy")}
                             </h2>
                        </div>
                        
                        <InfoCard title="Mental Health" icon={Brain}>
                            <DataRow label="Mood Score" value={`${journalEntry.mood}/10`} />
                            <DataRow label="Stress Level" value={`${journalEntry.stress_level}/10`} />
                            <DataRow label="Overthinking" value={`${journalEntry.overthinking}/10`} />
                            <DataRow label="Negative Thoughts" value={journalEntry.negative_thoughts} />
                        </InfoCard>

                        <InfoCard title="Physical & Routine" icon={Activity}>
                            <DataRow label="Sleep" value={`${journalEntry.sleep_hours}h (${journalEntry.sleep_quality})`} />
                            <DataRow label="Exercise" value={journalEntry.exercise} />
                            <DataRow label="Caffeine" value={journalEntry.caffeine_intake} />
                            <DataRow label="Diet" value={journalEntry.diet_status} />
                        </InfoCard>

                        <InfoCard title="Work & Focus" icon={Rocket}>
                            <DataRow label="Productivity" value={`${journalEntry.productivity}/10`} />
                            <DataRow label="VS Yesterday" value={journalEntry.productivity_comparison} />
                            <DataRow label="Screen (Work)" value={`${journalEntry.screen_work}h`} />
                            <DataRow label="Screen (Ent.)" value={`${journalEntry.screen_entertainment}h`} />
                        </InfoCard>

                        <InfoCard title="Context" icon={Sparkles}>
                            <DataRow label="Special Day" value={journalEntry.special_day} />
                            <DataRow label="Social Time" value={journalEntry.social_time} />
                            <DataRow label="Time Outdoors" value={journalEntry.time_outdoors} />
                            <DataRow label="Deal Breaker" value={journalEntry.deal_breaker} />
                        </InfoCard>

                        <InfoCard title="Daily Summary" icon={PenLine} className="md:col-span-2">
                            <p className="text-lg italic font-medium leading-relaxed">
                                "{journalEntry.daily_summary || "No summary written for this day."}"
                            </p>
                            {journalEntry.main_challenges && (
                                <div className="mt-4 pt-4 border-t border-border/10">
                                    <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Main Challenge</span>
                                    <p className="text-sm text-muted-foreground mt-1">{journalEntry.main_challenges}</p>
                                </div>
                            )}
                        </InfoCard>
                    </div>
                  ) : (
                    <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-[3rem]">
                      <p className="text-muted-foreground text-lg">No record found for this date.</p>
                      <button onClick={() => setSelectedDate(undefined)} className="mt-4 text-blue-500 font-bold">Pick another</button>
                    </div>
                  )}
                </motion.main>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        .modern-day-picker {
            --rdp-cell-size: 50px;
            --rdp-accent-color: #3b82f6;
            --rdp-background-color: #3b82f615;
            margin: 0;
        }
        /* MOBILE FIX: Reduce size so it doesn't cut off */
        @media (max-width: 640px) {
            .modern-day-picker {
                --rdp-cell-size: 38px; 
            }
        }
        .rdp-day_selected { font-weight: 800; border-radius: 12px !important; }
        .rdp-button:hover:not([disabled]) { border-radius: 12px; background-color: rgba(59, 130, 246, 0.05); }
      `}</style>
    </LayoutGroup>
  );
}