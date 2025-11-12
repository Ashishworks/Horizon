// app/journal/history/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// --- INTERFACE (No changes) ---
interface JournalEntry {
    date: string;
    mood: number;
    sleep_quality?: string;
    sleep_hours?: number;
    exercise: string[];
    deal_breaker?: string;
    productivity?: number;
    productivity_comparison?: 'Better' | 'Same' | 'Worse';
    overthinking?: number;
    special_day?: string;
    stress_level?: number;
    diet_status?: 'Okaish' | 'Good' | 'Bad';
    stress_triggers?: string;
    main_challenges?: string;
    daily_summary?: string;
    social_time?: 'Decent' | 'Less' | 'Zero';
    negative_thoughts?: 'Yes' | 'No';
    negative_thoughts_detail?: string;
    screen_work?: number;
    screen_entertainment?: number;
    caffeine_intake?: string;
    time_outdoors?: string;
}

// --- HELPER CARD COMPONENT (CHANGED) ---
const InfoCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <motion.div
        // Use theme variables
        className="bg-card text-card-foreground rounded-xl shadow p-6"
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
    >
        <h3 className="text-xl font-bold mb-4 text-blue-500">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </motion.div>
);

// --- HELPER DATA ROW COMPONENT (CHANGED) ---
const DataRow = ({ label, value }: { label: string, value: React.ReactNode }) => {
    if (!value) return null; // Don't render if value is empty
    return (
        <div>
            {/* Use theme variables */}
            <strong className="text-muted-foreground">{label}:</strong>
            <span className="ml-2 text-foreground">{value}</span>
        </div>
    );
};

// --- 2x2 JOURNAL DISPLAY COMPONENT (CHANGED) ---
function JournalDisplay({ entry }: { entry: JournalEntry }) {
    const displayDate = new Date(entry.date + 'T12:00:00');

    return (
        <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6" // 2x2 Grid on medium screens+
            initial="hidden"
            animate="visible"
            variants={{
                visible: { transition: { staggerChildren: 0.1 } } // Animates cards one by one
            }}
        >
            {/* Use theme variables */}
            <h2 className="text-3xl font-bold mb-2 text-foreground md:col-span-2"> 
                {/* Title spans both columns */}
                Journal for {format(displayDate, 'MMMM d, yyyy')}
            </h2>

            {/* Card 1: Mental Check-in */}
            <InfoCard title="Mental Check-in">
                <DataRow label="Mood" value={`${entry.mood} / 10`} />
                <DataRow label="Overthinking" value={`${entry.overthinking} / 5`} />
                <DataRow label="Stress Level" value={`${entry.stress_level} / 10`} />
                <DataRow label="Stress Triggers" value={entry.stress_triggers} />
                <DataRow label="Negative Thoughts" value={entry.negative_thoughts === 'Yes' ? (entry.negative_thoughts_detail || 'Yes') : 'No'} />
            </InfoCard>

            {/* Card 2: Health & Activity */}
            <InfoCard title="Health & Activity">
                <DataRow label="Sleep Quality" value={entry.sleep_quality} />
                <DataRow label="Sleep Hours" value={entry.sleep_hours} />
                <DataRow label="Diet Status" value={entry.diet_status} />
                <DataRow label="Caffeine Intake" value={entry.caffeine_intake} />
                <DataRow label="Time Outdoors" value={entry.time_outdoors} />
                {entry.exercise && entry.exercise.length > 0 && (
                    <div>
                        {/* Use theme variables */}
                        <strong className="text-muted-foreground">Exercise:</strong>
                        <ul className="list-disc list-inside ml-4 mt-1">
                            {entry.exercise.map((ex) => (
                                <li key={ex}>{ex}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </InfoCard>

            {/* Card 3: Productivity & Events */}
            <InfoCard title="Productivity & Events">
                <DataRow label="Productivity" value={`${entry.productivity} / 10`} />
                <DataRow label="Comparison" value={entry.productivity_comparison} />
                <DataRow label="Social Time" value={entry.social_time} />
                <DataRow label="Screen (Work)" value={entry.screen_work ? `${entry.screen_work} hours` : null} />
                <DataRow label="Screen (Fun)" value={entry.screen_entertainment ? `${entry.screen_entertainment} hours` : null} />
                <DataRow label="Main Challenges" value={entry.main_challenges} />
            </InfoCard>

            {/* Card 4: Daily Reflection */}
            <InfoCard title="Daily Reflection">
                <DataRow label="Special Day" value={entry.special_day} />
                <DataRow label="Deal Breaker" value={entry.deal_breaker} />
                <DataRow label="Daily Summary" value={
                    // Use theme variables
                    <p className="italic text-muted-foreground">{entry.daily_summary}</p>
                } />
            </InfoCard>

        </motion.div>
    );
}

// --- MAIN PAGE COMPONENT (Responsive Layout) ---
export default function JournalHistoryPage() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [journalEntry, setJournalEntry] = useState<JournalEntry | null>(null);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const supabase = createClientComponentClient();
    const router = useRouter();
    
    // --- HOOKS (No changes) ---
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                setUserId(user.id);
            } else {
                toast.error('Please log in to view your history.');
                router.push('/auth');
            }
        };
        getUser();
    }, [supabase, router]); // <-- Add router to the dependency array

    
    useEffect(() => {
        if (!userId || !selectedDate) {
            setJournalEntry(null); 
            return;
        }

        const fetchJournalEntry = async () => {
            setLoading(true);
            setJournalEntry(null); 
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');

            try {
                const { data, error } = await supabase
                    .from('journals')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('date', formattedDate)
                    .single(); 

                if (error) console.warn('No journal entry found for this date.');
                if (data) setJournalEntry(data);
                
            } catch (err) {
                if (err instanceof Error) {
                    console.error('Error fetching journal:', err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchJournalEntry();
    }, [selectedDate, userId, supabase]);

    if (!userId) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                
                <p className="text-foreground text-lg animate-pulse">
                    Loading History...
                </p>
            </div>
        );
    }
    // --- NEW RESPONSIVE RENDER (CHANGED) ---
    return (
        <LayoutGroup>
            {/* Use theme variables */}
            <div className="min-h-screen bg-background text-foreground flex flex-col">
                
                <h1 className="text-3xl font-bold pt-16 pb-6 mt-8 text-center flex-shrink-0">
                    Journal History
                </h1>

                {/* This is the new responsive layout container */}
                <div className="w-full max-w-7xl mx-auto flex-grow flex flex-col md:flex-row p-4 md:p-6">
                    
                    {/* 1. CALENDAR COLUMN (No changes) */}
                    <motion.div 
                        layout // <-- This is the magic! It animates the layout change.
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        // On mobile: full width. On desktop: 1/4 width.
                        className={`w-full ${selectedDate ? 'md:w-1/4 md:items-start' : 'md:w-full md:items-center'} flex-shrink-0 flex items-center justify-center`}
                    >
                        {/* Sticky container for desktop */}
                        <div className="md:sticky md:top-24">
                            <motion.div 
                                layoutId="calendar-wrapper" // Shares this ID
                                animate={{ scale: selectedDate ? 1.0 : 1.2 }}
                                className="w-fit"
                            >
                                <DayPicker
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    // Use theme variables
                                    className="text-foreground"
                                    disabled={{ after: new Date() }}
                                    fixedWeeks
                                />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* 2. INFO COLUMN (No changes) */}
                    <div className={`w-full md:w-3/4 flex-grow md:pl-8 ${selectedDate ? 'block' : 'hidden'}`}>
                        {/* This makes the info panel scrollable on desktop */}
                        <div className="w-full md:pb-32">
                            <AnimatePresence mode="wait">
                                {loading && (
                                    <motion.p 
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        // Use theme variables
                                        className="text-center text-muted-foreground pt-10"
                                    >
                                        Loading...
                                    </motion.p>
                                )}
                                
                                {!loading && !journalEntry && selectedDate && (
                                    <motion.p
                                        key="no-entry"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        // Use theme variables
                                        className="text-center text-muted-foreground pt-10"
                                    >
                                        No journal entry found for {format(selectedDate, 'MMMM d, yyyy')}.
                                    </motion.p>
                                )}
                                
                                {!loading && journalEntry && (
                                    <JournalDisplay key={journalEntry.date} entry={journalEntry} />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                
                </div>
            </div>
        </LayoutGroup>
    );
}