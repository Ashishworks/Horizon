'use client';


import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { format } from 'date-fns';
import ElasticSlider from '@/app/components/ui/ElasticSlider';
import { RiEmotionSadFill, RiEmotionHappyFill } from 'react-icons/ri';
import FrostGlassScrollButton from '@/app/components/ui/FrostGlassScrollButton';
import { MutatingDots } from 'react-loader-spinner';
import Noise from '@/app/components/ui/noise';
import RotatingText from '@/components/RotatingText';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import LoadingHorizon from '@/components/LoadingHorizon';

// Interface for the journal entry data
interface JournalEntry {
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

// Constants
const exerciseOptions = ['Running', 'Gym', 'Cycling', 'Freeform', 'Other'];
const stepTitles = [
    ' Mental Check-in',
    ' Health & Activity',
    ' Productivity & Events',
    ' Daily Reflection',
];

export default function JournalPage() {
    // --- STATE AND REFS ---
    const [entry, setEntry] = useState<JournalEntry>({
        mood: 5,
        exercise: [],
    });
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const totalSteps = 4;
    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const supabase = createClient();
    const [isDragging, setIsDragging] = useState(false);


    // --- AUTH CHECK ---
    useEffect(() => {
        const checkUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push('/auth'); // <-- ❗️ IMPORTANT: Update '/login'
            } else {
                setUserId(user.id);
            }
        };

        checkUser();
    }, [router, supabase]);

    // --- HANDLERS ---
    const handleChange = <K extends keyof JournalEntry>(
        field: K,
        value: JournalEntry[K]
    ) => {
        setEntry((prev) => ({ ...prev, [field]: value }));
    };

    const handleMultiSelect = (field: 'exercise', value: string) => {
        setEntry((prev) => {
            const current = prev[field] as string[];
            if (current.includes(value)) {
                if (value === 'Other') {
                    return {
                        ...prev,
                        [field]: current.filter((v) => v !== 'Other' && !v.startsWith('Other:')),
                    };
                }
                return { ...prev, [field]: current.filter((v) => v !== value) };
            } else {
                if (value === 'Other') {
                    return { ...prev, [field]: [...current, 'Other', 'Other: '] };
                }
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    const handleOtherExerciseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(
            'exercise',
            entry.exercise.map((ex) =>
                ex.startsWith('Other:') ? `Other: ${e.target.value}` : ex
            )
        );
    };


    // --- NAVIGATION ---
    const nextStep = () => {
        setCurrentStep((prev) => {
            const newStep = Math.min(prev + 1, totalSteps);
            if (scrollRef.current)
                scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            return newStep;
        });
    };

    const prevStep = () => {
        setCurrentStep((prev) => {
            const newStep = Math.max(prev - 1, 1);
            if (scrollRef.current)
                scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            return newStep;
        });
    };

    // --- SUBMIT ---
    const handleSubmit = async () => {
        // 1. Validation Check (Immediate Warning)
        if (!entry.mood) {
            toast.warning("Hold up!", {
                description: "Please select your mood before submitting."
            });
            return;
        }

        if (!userId) {
            toast.error("Session expired", {
                description: "Please log in again."
            });
            router.push("/auth");
            return;
        }

        // 2. The Submission Promise
        const saveEntry = async () => {
            const today = format(new Date(), "yyyy-MM-dd");
            const exercisesToSave = entry.exercise
                ? entry.exercise.filter((ex) => ex !== "Other" && ex.trim() !== "Other:")
                : [];

            const res = await fetch("/api/journal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...entry,
                    date: today,
                    exercise: exercisesToSave.length ? exercisesToSave : null,
                }),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to save journal");
            }

            return res.json();
        };

        // 3. Trigger the Toast
        toast.promise(saveEntry(), {
            loading: 'Saving your journey...',
            success: (data) => {
                // Optional: redirect or reset form here
                // router.push("/dashboard");
                return `Journal saved for ${format(new Date(), "MMMM do")}!`;
            },
            error: (err) => err.message,
        });
    };



    // --- RENDER ---

    if (!userId) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <LoadingHorizon />
            </div>
        );
    }

    return (
        <div className="relative z-0 h-screen py-10 px-4 bg-background text-foreground flex flex-col items-center overflow-hidden">
            <Toaster position="top-center"
                toastOptions={{
                    // 'w-full' ensures the inner container stretches so text can center
                    className: "flex flex-row items-center justify-center text-center w-full",
                }} offset={80} expand />


            {/* Background Noise Layer */}
            <div className="fixed inset-0 -z-10 opacity-[0.15] pointer-events-none">
                <Noise patternAlpha={60} />
            </div>
            <motion.h1
                layout
                transition={{ duration: 0.4 }}
                className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mt-8 mb-8 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-center"
            >
                <span className="text-foreground/90">Capture Your</span>

                <div className="relative inline-flex items-center">
                    <RotatingText
                        texts={['Journey', 'Moments', 'Feelings!', 'Thoughts']}
                        mainClassName="relative px-3 sm:px-4 py-1.5 sm:py-2 
                           bg-primary text-primary-foreground 
                           overflow-hidden justify-center rounded-2xl 
                           shadow-lg shadow-primary/20"
                        staggerFrom={"last"}
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "-100%", opacity: 0 }}
                        staggerDuration={0.025}
                        splitLevelClassName="overflow-hidden"
                        rotationInterval={2000}
                    />
                </div>
            </motion.h1>



            {/* Card Container */}
            <div className="w-full max-w-4xl bg-card p-8 rounded-xl shadow flex flex-col flex-1 overflow-hidden border border-border animate-candle-glow">

                {/* Stepper */}
                <div className="relative mb-6 w-full max-w-md mx-auto space-y-3">
                    {/* Compact Header */}
                    <div className="flex items-end justify-between px-1">
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/50">
                                Current Progress
                            </p>
                            <h2 className="text-lg font-semibold tracking-tight text-foreground">
                                {stepTitles[currentStep - 1]}
                            </h2>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-light tracking-tighter text-primary">
                                {Math.round((currentStep / totalSteps) * 100)}%
                            </span>
                        </div>
                    </div>

                    {/* Slim Progress Track */}
                    <div className="relative h-2 w-full">
                        {/* Outer Track */}
                        <div className="absolute inset-0 rounded-full border border-primary/10 bg-muted/20 backdrop-blur-md" />

                        {/* Progress Fill */}
                        <div
                            className="relative h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        >
                            {/* Subtle Lead Glow */}
                            <div className="absolute right-0 top-0 h-full w-2 rounded-full bg-white/30 blur-[2px]" />

                            {/* Shimmer */}
                            <div className="absolute inset-0 overflow-hidden rounded-full">
                                <div className="h-full w-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            </div>
                        </div>

                        {/* Small Follower Dot */}
                        <div
                            className="absolute -bottom-3 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
                            style={{ left: `${(currentStep / totalSteps) * 100}%`, transform: 'translateX(-50%)' }}
                        >
                            <div className="h-0.5 w-0.5 rounded-full bg-primary/30" />
                        </div>
                    </div>
                </div>

                {/* Step Content (Scrollable Area) */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto pr-4 -mr-4 hide-scrollbar relative px-4"
                >
                    {/* === STEP 1 === */}
                    {currentStep === 1 && (
                        <div className="space-y-8">
                            <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-[3rem] border border-border/50 bg-card/20 p-8 md:p-12 backdrop-blur-2xl">
                                {/* Ambient Mood Glow (Optional: Dynamic background color based on mood value) */}
                                <div
                                    className="absolute inset-0 -z-10 opacity-10 transition-colors duration-700 blur-[100px]"
                                    style={{
                                        backgroundColor: (entry.mood || 5) > 5 ? '#facc15' : '#60a5fa'
                                    }}
                                />

                                <div className="flex flex-col items-center space-y-8">
                                    {/* Header Section */}
                                    <div className="text-center space-y-2">
                                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary/60">
                                            Overall Mood <span className="text-destructive">*</span>
                                        </h3>
                                        <div className="flex flex-col items-center">
                                            {/* Dynamic Mood Label */}
                                            <motion.span
                                                key={entry.mood}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-4xl md:text-5xl font-black tracking-tighter text-foreground"
                                            >
                                                {entry.mood <= 2 && "Tough Day"}
                                                {entry.mood > 2 && entry.mood <= 4 && "Feeling Low"}
                                                {entry.mood > 4 && entry.mood <= 6 && "Doing Okay"}
                                                {entry.mood > 6 && entry.mood <= 8 && "Pretty Good"}
                                                {entry.mood > 8 && "Feeling Great!"}
                                            </motion.span>
                                            <span className="mt-2 text-xs font-medium text-muted-foreground/60">
                                                Level {entry.mood || 1} of 10
                                            </span>
                                        </div>
                                    </div>

                                    {/* Slider Container */}
                                    <div className="w-full max-w-2xl px-4 py-6">
                                        <ElasticSlider
                                            startingValue={1}
                                            defaultValue={entry.mood}
                                            maxValue={10}
                                            isStepped
                                            stepSize={1}
                                            leftIcon={
                                                <div className="group relative">
                                                    <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md transition-all group-hover:scale-150" />
                                                    <RiEmotionSadFill size={32} className="relative text-blue-400 drop-shadow-sm" />
                                                </div>
                                            }
                                            rightIcon={
                                                <div className="group relative">
                                                    <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-md transition-all group-hover:scale-150" />
                                                    <RiEmotionHappyFill size={32} className="relative text-yellow-400 drop-shadow-sm" />
                                                </div>
                                            }
                                            onValueChange={(value) => handleChange('mood', value)}
                                        />
                                    </div>

                                    {/* Modern Progress Track Labels */}
                                    <div className="flex w-full max-w-2xl justify-between px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                                        <span>Exhausted</span>
                                        <span>Balanced</span>
                                        <span>Radiant</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="block font-semibold text-foreground">
                                        Overthinking Status
                                    </label>
                                    {/* Dynamic Badge */}
                                    <span
                                        className={`text-sm font-bold px-3 py-1 rounded-md border transition-all duration-300 ${(entry.overthinking ?? 0) > 7
                                            ? 'bg-destructive/10 text-destructive border-destructive/20 shadow-[0_0_10px_rgba(255,0,0,0.1)]'
                                            : (entry.overthinking ?? 0) >= 4
                                                ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_10px_rgba(255,255,0,0.1)]'
                                                : 'bg-primary/10 text-primary border-primary/20'
                                            }`}
                                    >
                                        {entry.overthinking ?? 0} / 10
                                    </span>
                                </div>

                                <div className="relative h-10 flex items-center group">
                                    {/* Track Background */}
                                    <div className="absolute w-full h-2 bg-muted rounded-full" />

                                    {/* Active Colored Track */}
                                    <motion.div
                                        className="absolute h-2 rounded-full"
                                        initial={false}
                                        animate={{
                                            width: `${((entry.overthinking ?? 0) / 10) * 100}%`,
                                            backgroundColor:
                                                (entry.overthinking ?? 0) > 7 ? 'var(--destructive)' :
                                                    (entry.overthinking ?? 0) >= 4 ? '#eab308' :
                                                        'var(--primary)'
                                        }}
                                        style={{
                                            boxShadow: (entry.overthinking ?? 0) > 7
                                                ? '0 0 15px oklch(0.704 0.191 22.216 / 0.4)'
                                                : (entry.overthinking ?? 0) >= 4
                                                    ? '0 0 15px rgba(234, 179, 8, 0.3)'
                                                    : '0 0 15px oklch(0.72 0.2 145 / 0.4)'
                                        }}
                                    />

                                    {/* Invisible Real Input */}
                                    <input
                                        type="range"
                                        min={0}
                                        max={10}
                                        step={1}
                                        value={entry.overthinking ?? 0}
                                        onMouseDown={() => setIsDragging(true)}
                                        onMouseUp={() => setIsDragging(false)}
                                        onTouchStart={() => setIsDragging(true)}
                                        onTouchEnd={() => setIsDragging(false)}
                                        onChange={(e) => handleChange('overthinking', +e.target.value)}
                                        className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                                    />

                                    {/* Visual Thumb */}
                                    <motion.div
                                        className="absolute w-6 h-6 bg-background border-2 rounded-full shadow-xl z-10 pointer-events-none flex items-center justify-center"
                                        initial={false}
                                        animate={{
                                            left: `calc(${((entry.overthinking ?? 0) / 10) * 100}% - 12px)`,
                                            borderColor:
                                                (entry.overthinking ?? 0) > 7 ? 'var(--destructive)' :
                                                    (entry.overthinking ?? 0) >= 4 ? '#eab308' :
                                                        'var(--primary)',
                                            scale: isDragging ? 1.25 : 1
                                        }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <div
                                            className={`w-2 h-2 rounded-full transition-colors duration-300 ${(entry.overthinking ?? 0) > 7 ? 'bg-destructive animate-pulse' :
                                                (entry.overthinking ?? 0) >= 4 ? 'bg-yellow-500' :
                                                    'bg-primary'
                                                }`}
                                        />
                                    </motion.div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="block font-semibold text-foreground">
                                        Stress Level
                                    </label>
                                    <span
                                        className={`text-sm font-bold px-3 py-1 rounded-md border transition-all duration-300 ${(entry.stress_level ?? 0) > 7
                                            ? 'bg-destructive/10 text-destructive border-destructive/20 shadow-[0_0_10px_rgba(255,0,0,0.1)]'
                                            : (entry.stress_level ?? 0) >= 4
                                                ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_10px_rgba(255,255,0,0.1)]'
                                                : 'bg-primary/10 text-primary border-primary/20'
                                            }`}
                                    >
                                        {entry.stress_level ?? 0} / 10
                                    </span>
                                </div>

                                <div className="relative h-10 flex items-center group">
                                    <div className="absolute w-full h-2 bg-muted rounded-full" />

                                    {/* Active Track with 3-way color logic */}
                                    <motion.div
                                        className="absolute h-2 rounded-full"
                                        initial={false}
                                        animate={{
                                            width: `${((entry.stress_level ?? 0) / 10) * 100}%`,
                                            backgroundColor:
                                                (entry.stress_level ?? 0) > 7 ? 'var(--destructive)' :
                                                    (entry.stress_level ?? 0) >= 4 ? '#eab308' : // Tailwind Yellow-500
                                                        'var(--primary)'
                                        }}
                                        style={{
                                            boxShadow: (entry.stress_level ?? 0) > 7
                                                ? '0 0 15px oklch(0.704 0.191 22.216 / 0.4)'
                                                : (entry.stress_level ?? 0) >= 4
                                                    ? '0 0 15px rgba(234, 179, 8, 0.3)'
                                                    : '0 0 15px oklch(0.72 0.2 145 / 0.4)'
                                        }}
                                    />

                                    <input
                                        type="range"
                                        min={0}
                                        max={10}
                                        step={1}
                                        value={entry.stress_level ?? 0}
                                        onMouseDown={() => setIsDragging(true)}
                                        onMouseUp={() => setIsDragging(false)}
                                        onTouchStart={() => setIsDragging(true)}
                                        onTouchEnd={() => setIsDragging(false)}
                                        onChange={(e) => handleChange('stress_level', +e.target.value)}
                                        className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                                    />

                                    {/* Custom Visual Thumb */}
                                    <motion.div
                                        className="absolute w-6 h-6 bg-background border-2 rounded-full shadow-xl z-10 pointer-events-none flex items-center justify-center"
                                        initial={false}
                                        animate={{
                                            left: `calc(${((entry.stress_level ?? 0) / 10) * 100}% - 12px)`,
                                            borderColor:
                                                (entry.stress_level ?? 0) > 7 ? 'var(--destructive)' :
                                                    (entry.stress_level ?? 0) >= 4 ? '#eab308' :
                                                        'var(--primary)',
                                            scale: isDragging ? 1.25 : 1
                                        }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <div
                                            className={`w-2 h-2 rounded-full transition-colors duration-300 ${(entry.stress_level ?? 0) > 7 ? 'bg-destructive animate-pulse' :
                                                (entry.stress_level ?? 0) >= 4 ? 'bg-yellow-500' :
                                                    'bg-primary'
                                                }`}
                                        />
                                    </motion.div>
                                </div>
                            </div>

                            <div className="group relative space-y-3 rounded-3xl border border-border/50 bg-card/30 p-6 backdrop-blur-md transition-all hover:border-destructive/30">
                                {/* Header Section */}
                                <div className="flex items-center justify-between px-1">
                                    <div className="space-y-1">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-destructive/80">
                                            Stress Triggers
                                        </h3>
                                        <p className="text-[11px] text-muted-foreground">Identify what weighed on you today</p>
                                    </div>
                                </div>

                                {/* Smart Quick-Add Tags */}
                                <div className="flex flex-wrap gap-2 py-1">
                                    {['Work', 'Deadlines', 'Social', 'Sleep', 'Health'].map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => {
                                                const current = (entry.stress_triggers || '').trim();

                                                // Regex to find the tag at the very end of the string, with optional " xN"
                                                const regex = new RegExp(`${tag}(?: x(\\d+))?$`);
                                                const match = current.match(regex);

                                                if (match) {
                                                    // If tag found at end, increment count (default to 1 + 1 = 2)
                                                    const count = match[1] ? parseInt(match[1], 10) : 1;
                                                    const updatedValue = current.replace(regex, `${tag} x${count + 1}`);
                                                    handleChange('stress_triggers', updatedValue);
                                                } else {
                                                    // If tag not at end, append with comma if field isn't empty
                                                    const newValue = current ? `${current}, ${tag}` : tag;
                                                    handleChange('stress_triggers', newValue);
                                                }
                                            }}
                                            className="rounded-full border border-border bg-background/50 px-3 py-1 text-[10px] font-medium text-muted-foreground transition-all hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive active:scale-95"
                                        >
                                            + {tag}
                                        </button>
                                    ))}
                                </div>

                                {/* Textarea Container */}
                                <div className="relative">
                                    <textarea
                                        value={entry.stress_triggers || ''}
                                        onChange={(e) => handleChange('stress_triggers', e.target.value)}
                                        placeholder="What triggered stress today?"
                                        className="min-h-[120px] w-full resize-none rounded-2xl border border-border bg-background/50 p-5 
                     text-sm leading-relaxed text-foreground shadow-sm
                     placeholder:text-muted-foreground/40
                     focus:bg-background focus:outline-none focus:ring-2 focus:ring-destructive/20 focus:border-destructive/40
                     transition-all duration-300 group-hover:shadow-md"
                                    ></textarea>

                                    {/* Subtle Icon Indicator */}
                                    <div className="absolute top-4 right-4 text-destructive/20 group-focus-within:text-destructive/40 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="M20 12h2" /><path d="m19.07 4.93-1.41 1.41" /><path d="M15.93 15.93 17.34 17.34" /><path d="M8.07 15.93 6.66 17.34" /><path d="M12 8a4 4 0 1 1 0 8" /><path d="M12 20v2" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full max-w-4xl mx-auto p-6">
                                <motion.div
                                    layout
                                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                    className={`flex flex-col md:flex-row items-center justify-center gap-10 min-h-[200px] rounded-[2.5rem] bg-card/20 p-8 backdrop-blur-xl border border-border/40 ${entry.negative_thoughts === 'Yes' ? 'md:justify-between' : 'justify-center'
                                        }`}
                                >
                                    {/* Left Side: Question & Toggle */}
                                    <motion.div
                                        layout
                                        className={`flex flex-col items-center space-y-6 text-center transition-all duration-500 ${entry.negative_thoughts === 'Yes' ? 'w-full md:w-[45%] md:items-start md:text-left' : 'w-full max-w-md'
                                            }`}
                                    >
                                        <div className="space-y-2">
                                            <label className="block text-lg md:text-xl font-bold tracking-tight text-foreground/90">
                                                Did you have any negative thoughts today?
                                            </label>
                                            <p className="text-sm text-muted-foreground/70 font-medium leading-relaxed">
                                                Be honest with yourself—it's a safe space.
                                            </p>
                                        </div>

                                        {/* Modern Neumorphic Toggle */}
                                        <div className="relative flex p-1.5 bg-background/60 rounded-2xl border border-border/50 w-full max-w-[220px] shadow-inner">
                                            {(['No', 'Yes'] as const).map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => handleChange('negative_thoughts', option)}
                                                    className={`relative flex-1 py-2.5 text-xs font-black uppercase tracking-widest transition-all z-10 
              ${entry.negative_thoughts === option ? 'text-primary-foreground' : 'text-muted-foreground/60 hover:text-foreground'}`}
                                                >
                                                    <span className="relative z-20">{option}</span>
                                                    {entry.negative_thoughts === option && (
                                                        <motion.div
                                                            layoutId="activeTabNegativeModern"
                                                            className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20"
                                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                        />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* Right Side: Expandable Textarea */}
                                    <AnimatePresence mode="wait">
                                        {entry.negative_thoughts === 'Yes' && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
                                                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                                exit={{ opacity: 0, x: 40, filter: "blur(10px)" }}
                                                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                                                className="w-full md:w-[55%]"
                                            >
                                                <div className="relative group">
                                                    {/* Soft decorative glow behind textarea */}
                                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-primary/5 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />

                                                    <textarea
                                                        value={entry.negative_thoughts_detail || ''}
                                                        onChange={(e) => handleChange('negative_thoughts_detail', e.target.value)}
                                                        placeholder="What was on your mind? Letting it out helps..."
                                                        className="relative w-full p-6 bg-background/40 border border-border rounded-[2rem] h-44
                text-sm leading-relaxed text-foreground placeholder:italic placeholder:text-muted-foreground/30
                focus:bg-background/80 focus:ring-0 focus:border-primary/30 
                focus:outline-none resize-none transition-all duration-300"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </div>
                        </div>
                    )}

                    {/* === STEP 2 === */}
                    {currentStep === 2 && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-stretch">
                                {/* --- Sleep Quality Section --- */}
                                <div className="flex flex-col items-center justify-between p-6 rounded-2xl bg-input/20 border border-border/50 h-full">
                                    <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-6">
                                        Sleep Quality
                                    </label>

                                    {/* Pill Selection */}
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        {[
                                            { label: 'Poor', emoji: '😫' },
                                            { label: 'Okay', emoji: '😐' },
                                            { label: 'Good', emoji: '😊' },
                                            { label: 'Deep', emoji: '😴' }].map((item) => {
                                                const isSelected = entry.sleep_quality === item.label;
                                                return (
                                                    <motion.button
                                                        key={item.label}
                                                        type="button"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleChange('sleep_quality', item.label)}
                                                        className={`px-4 py-2 rounded-full border text-sm font-bold transition-all duration-300 ${isSelected
                                                            ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                                                            : 'bg-background/50 border-border text-muted-foreground hover:border-muted-foreground/40'
                                                            }`}
                                                    >

                                                        {item.label}
                                                    </motion.button>
                                                );
                                            })}
                                    </div>

                                    <div className="mt-6 text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-50">
                                        Select your sleep vibe
                                    </div>
                                </div>

                                {/* --- Hours Slept Section --- */}
                                <div className="flex flex-col items-center justify-between p-6 rounded-2xl bg-input/20 border border-border/50 h-full">
                                    <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-6">
                                        Hours Slept
                                    </label>

                                    {/* Big Number Display */}
                                    <div className="text-4xl font-black text-primary mb-2">
                                        {entry.sleep_hours ?? 0} <span className="text-sm font-bold text-muted-foreground">hrs</span>
                                    </div>

                                    {/* Number Slider - STEP SET TO 1 TO FIX INTEGER ERROR */}
                                    <div className="w-full max-w-[240px] mb-8">
                                        <input
                                            type="range"
                                            min="0"
                                            max="12"
                                            step="1"
                                            value={entry.sleep_hours ?? 0}
                                            onChange={(e) => {
                                                // Ensure we send a whole integer to Supabase
                                                const val = parseInt(e.target.value, 10) || 0;
                                                handleChange('sleep_hours', val);
                                            }}
                                            className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <div className="flex justify-between mt-3 px-1">
                                            <span className="text-[10px] text-muted-foreground font-bold italic">0h</span>
                                            <span className="text-[10px] text-muted-foreground font-bold italic">12h</span>
                                        </div>
                                    </div>

                                    <div className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                                        {(entry.sleep_hours ?? 0) >= 7 ? 'Good Rest' : 'Need More'}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-stretch">
                                {/* --- Exercise Section --- */}
                                <div className="flex flex-col items-center justify-between p-6 rounded-2xl bg-input/20 border border-border/50">
                                    <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-6">
                                        Exercise
                                    </label>

                                    {/* 3-2 Layout using Flexbox for easier centering */}
                                    <div className="flex flex-wrap gap-3 justify-center w-full max-w-[340px]">
                                        {exerciseOptions.map((option, index) => {
                                            const isSelected = entry.exercise.includes(option);
                                            return (
                                                <motion.button
                                                    key={option}
                                                    type="button"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleMultiSelect('exercise', option)}
                                                    className={`px-6 py-2 rounded-full border text-sm font-bold transition-all duration-300 whitespace-nowrap ${isSelected
                                                        ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_15px_oklch(0.72_0.2_145_/_0.4)]'
                                                        : 'bg-background/50 border-border text-muted-foreground hover:border-muted-foreground/40'
                                                        }`}
                                                >
                                                    {option}
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    {entry.exercise.includes('Other') && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="mt-6 w-full max-w-[240px]"
                                        >
                                            <input
                                                type="text"
                                                placeholder="Other details..."
                                                value={entry.exercise.find((e) => e.startsWith('Other:'))?.replace('Other: ', '') || ''}
                                                onChange={handleOtherExerciseChange}
                                                className="w-full p-2 text-sm border rounded-xl bg-background border-border text-foreground text-center focus:ring-2 focus:ring-primary/40 focus:outline-none"
                                            />
                                        </motion.div>
                                    )}
                                </div>

                                {/* --- Diet Status Section --- */}
                                <div className="flex flex-col items-center justify-between p-6 rounded-2xl bg-input/20 border border-border/50">
                                    <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-6">
                                        Diet Status
                                    </label>

                                    <div className="flex p-1.5 bg-background/50 border border-border rounded-2xl w-full max-w-[260px]">
                                        {(['Good', 'Okaish', 'Bad'] as const).map((status) => {
                                            const isSelected = entry.diet_status === status;
                                            return (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() => handleChange('diet_status', status)}
                                                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center ${isSelected
                                                        ? status === 'Good'
                                                            ? 'bg-primary text-primary-foreground'
                                                            : status === 'Bad'
                                                                ? 'bg-destructive text-destructive-foreground'
                                                                : 'bg-yellow-500 text-white'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {/* Spacer to keep heights consistent with the Exercise card */}
                                    <div className="h-10" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-stretch">
                                {/* --- Caffeine Section --- */}
                                <div className="flex flex-col items-center justify-between p-6 rounded-2xl bg-input/20 border border-border/50 h-full">
                                    <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-6">
                                        Caffeine Intake
                                    </label>

                                    <div className="flex gap-4 mb-6">
                                        {[
                                            { label: 'Coffee', icon: '☕' },
                                            { label: 'Tea', icon: '🍵' },
                                            { label: 'Energy Drink', icon: '⚡' },
                                        ].map((item) => (
                                            <motion.button
                                                key={item.label}
                                                type="button"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => {
                                                    const current = entry.caffeine_intake || "";
                                                    const regex = new RegExp(`(\\d+)\\s*${item.label}`, "i");
                                                    const match = current.match(regex);

                                                    if (match) {
                                                        const count = parseInt(match[1]) + 1;
                                                        const newValue = current.replace(regex, `${count} ${item.label}`);
                                                        handleChange('caffeine_intake', newValue);
                                                    } else {
                                                        const prefix = current ? `${current}, ` : "";
                                                        handleChange('caffeine_intake', `${prefix}1 ${item.label}`);
                                                    }
                                                }}
                                                className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-background/50 border border-border hover:border-primary/50 transition-colors"
                                            >
                                                <span className="text-xl">{item.icon}</span>
                                                <span className="text-[10px] mt-1 font-medium opacity-60">{item.label}</span>
                                            </motion.button>
                                        ))}
                                    </div>

                                    <div className="w-full max-w-[280px] relative">
                                        <input
                                            type="text"
                                            placeholder="Details (e.g., 2 cups)"
                                            value={entry.caffeine_intake || ''}
                                            onChange={(e) => handleChange('caffeine_intake', e.target.value)}
                                            className="w-full p-3 text-sm border rounded-xl bg-background border-border text-foreground text-center focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all"
                                        />
                                        {entry.caffeine_intake && (
                                            <button
                                                onClick={() => handleChange('caffeine_intake', '')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* --- Outdoors Section --- */}
                                <div className="flex flex-col items-center justify-between p-6 rounded-2xl bg-input/20 border border-border/50 h-full">
                                    <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-6">
                                        Time Spent Outdoors
                                    </label>

                                    <div className="text-3xl font-black text-primary mb-2">
                                        {entry.time_outdoors ?? '0 mins'}
                                    </div>

                                    <div className="w-full max-w-[240px] mb-8">
                                        <input
                                            type="range"
                                            min="0"
                                            max="300"
                                            step="15"
                                            value={parseInt(entry.time_outdoors ?? '0') || 0}
                                            onChange={(e) => {
                                                const mins = e.target.value;
                                                const currentStr = entry.time_outdoors ?? "";
                                                const tagsMatch = currentStr.match(/\(.*\)/);
                                                const tags = tagsMatch ? ` ${tagsMatch[0]}` : "";
                                                handleChange('time_outdoors', `${mins} mins${tags}`);
                                            }}
                                            className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <div className="flex justify-between mt-3 px-1">
                                            <span className="text-[10px] text-muted-foreground font-bold italic text-primary/60">INDOOR</span>
                                            <span className="text-[10px] text-muted-foreground font-bold italic text-primary/60">5 HOURS</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {['Walk', 'Sunlight', 'Nature'].map((tag) => {
                                            const isSelected = entry.time_outdoors?.includes(tag) ?? false;
                                            return (
                                                <button
                                                    key={tag}
                                                    type="button"
                                                    onClick={() => {
                                                        const currentStr = entry.time_outdoors ?? "0 mins";
                                                        const mins = parseInt(currentStr) || 0;
                                                        let updatedStr: string;
                                                        if (isSelected) {
                                                            updatedStr = currentStr.replace(tag, "").replace(/\(\s+\)/g, "").replace(/\s+/g, " ").trim();
                                                            if (!updatedStr.includes('mins')) updatedStr = `${mins} mins ${updatedStr}`;
                                                        } else {
                                                            if (currentStr.includes('(')) {
                                                                updatedStr = currentStr.replace(')', ` ${tag})`);
                                                            } else {
                                                                updatedStr = `${mins} mins (${tag})`;
                                                            }
                                                        }
                                                        handleChange('time_outdoors', updatedStr.trim());
                                                    }}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all duration-300 ${isSelected
                                                        ? 'bg-primary text-primary-foreground border-transparent shadow-lg'
                                                        : 'bg-background/50 text-muted-foreground border border-border hover:border-muted-foreground/50'
                                                        }`}
                                                >
                                                    {tag}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === STEP 3 === */}
                    {currentStep === 3 && (
                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="block font-semibold text-foreground">
                                            Productivity Scale
                                        </label>
                                        <span className="text-sm font-bold px-3 py-1 bg-primary/10 text-primary rounded-md border border-primary/20 shadow-sm">
                                            {entry.productivity ?? 5} / 10
                                        </span>
                                    </div>

                                    <div className="relative h-10 flex items-center group">
                                        {/* Track Background - Uses your CSS --muted variable */}
                                        <div className="absolute w-full h-2 bg-muted rounded-full" />

                                        {/* Active Track (Green Glow) */}
                                        <motion.div
                                            className="absolute h-2 bg-primary rounded-full"
                                            initial={false}
                                            animate={{
                                                width: `${((entry.productivity ?? 5) / 10) * 100}%`
                                            }}
                                            style={{
                                                boxShadow: '0 0 12px oklch(0.65 0.18 145 / 0.3)'
                                            }}
                                        />

                                        <input
                                            type="range"
                                            min={0}
                                            max={10}
                                            step={1}
                                            value={entry.productivity ?? 5}
                                            onMouseDown={() => setIsDragging(true)}
                                            onMouseUp={() => setIsDragging(false)}
                                            onTouchStart={() => setIsDragging(true)}
                                            onTouchEnd={() => setIsDragging(false)}
                                            onChange={(e) => handleChange('productivity', +e.target.value)}
                                            className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                                        />

                                        {/* Visual Thumb - Uses your CSS --background variable */}
                                        <motion.div
                                            className="absolute w-6 h-6 bg-background border-2 border-primary rounded-full shadow-lg z-10 pointer-events-none flex items-center justify-center"
                                            initial={false}
                                            animate={{
                                                left: `calc(${((entry.productivity ?? 5) / 10) * 100}% - 12px)`,
                                                scale: isDragging ? 1.2 : 1
                                            }}
                                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        >
                                            <div className="w-2 h-2 bg-primary rounded-full opacity-80" />
                                        </motion.div>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <label className="block text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                        Productivity vs Yesterday
                                    </label>

                                    <div className="grid grid-cols-3 p-1 w-full bg-muted/30 rounded-2xl border border-border/40 backdrop-blur-md">
                                        {(['Better', 'Same', 'Worse'] as const).map((option) => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => handleChange('productivity_comparison', option)}
                                                className={`
          relative flex items-center justify-center py-2.5 text-sm font-semibold transition-all duration-200 rounded-xl
          ${entry.productivity_comparison === option
                                                        ? 'bg-background text-primary shadow-sm ring-1 ring-border'
                                                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}
        `}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                    Social Connection
                                </label>

                                <div className="grid grid-cols-3 p-1 w-full bg-muted/30 rounded-2xl border border-border/40 backdrop-blur-md">
                                    {(['Decent', 'Less', 'Zero'] as const).map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => handleChange('social_time', option)}
                                            className={`
          flex items-center justify-center py-2.5 text-sm font-semibold transition-all duration-200 rounded-xl
          ${entry.social_time === option
                                                    ? 'bg-background text-primary shadow-sm ring-1 ring-border'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}
        `}
                                        >
                                            {option === 'Decent' ? 'Decent' : option === 'Less' ? 'Minimal' : 'None'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6 rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
                                {/* Header Section */}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Screen Time</h3>
                                        <p className="text-xs text-muted-foreground">Log your daily digital consumption</p>
                                    </div>
                                    <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-tight text-secondary-foreground">
                                        Optional
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {/* Work Screen Time Card */}
                                    <div className="group relative flex flex-col items-center justify-center rounded-2xl border border-border bg-background p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                                        <label className="mb-3 text-[10px] font-black uppercase tracking-tighter text-muted-foreground transition-colors group-hover:text-primary">
                                            For Work
                                        </label>

                                        <div className="relative flex items-center gap-2">
                                            <input
                                                type="number"
                                                min={0}
                                                max={24}
                                                value={entry.screen_work ?? ''}
                                                onChange={(e) => handleChange('screen_work', +e.target.value)}
                                                placeholder="0"
                                                className="w-16 bg-transparent text-center text-4xl font-light tracking-tighter focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <span className="text-sm font-medium text-muted-foreground">hrs</span>
                                        </div>

                                        {/* Visual Indicator Line */}
                                        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full bg-primary transition-all duration-500"
                                                style={{ width: `${Math.min(((entry.screen_work || 0) / 12) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Entertainment Screen Time Card */}
                                    <div className="group relative flex flex-col items-center justify-center rounded-2xl border border-border bg-background p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                                        <label className="mb-3 text-[10px] font-black uppercase tracking-tighter text-muted-foreground transition-colors group-hover:text-primary">
                                            Entertainment
                                        </label>

                                        <div className="relative flex items-center gap-2">
                                            <input
                                                type="number"
                                                min={0}
                                                max={24}
                                                value={entry.screen_entertainment ?? ''}
                                                onChange={(e) => handleChange('screen_entertainment', +e.target.value)}
                                                placeholder="0"
                                                className="w-16 bg-transparent text-center text-4xl font-light tracking-tighter focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <span className="text-sm font-medium text-muted-foreground">hrs</span>
                                        </div>

                                        {/* Visual Indicator Line */}
                                        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full bg-primary transition-all duration-500"
                                                style={{ width: `${Math.min(((entry.screen_entertainment || 0) / 12) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="group relative space-y-3 rounded-3xl border border-border/50 bg-card/30 p-6 backdrop-blur-md transition-all hover:border-primary/30">
                                {/* Header Section */}
                                <div className="flex items-center justify-between px-1">
                                    <div className="space-y-1">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">
                                            Main Challenges / Plans
                                        </h3>
                                        <p className="text-[11px] text-muted-foreground">Reflect on your day or map out tomorrow</p>
                                    </div>
                                    <div className="rounded-full bg-secondary/50 px-3 py-1 text-[10px] font-bold text-muted-foreground">
                                        OPTIONAL
                                    </div>
                                </div>

                                {/* Textarea Container */}
                                <div className="relative">
                                    <textarea
                                        value={entry.main_challenges || ''}
                                        onChange={(e) => handleChange('main_challenges', e.target.value)}
                                        placeholder="What's on your mind? Challenges faced or plans for tomorrow..."
                                        className="min-h-[160px] w-full resize-none rounded-2xl border border-border bg-background/50 p-5 
                 text-sm leading-relaxed text-foreground shadow-sm ring-offset-background
                 placeholder:italic placeholder:text-muted-foreground/40
                 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40
                 transition-all duration-300 group-hover:shadow-md"
                                    ></textarea>

                                    {/* Writing Mode Indicator (Bottom Right) */}
                                    <div className="absolute bottom-6 right-8 flex items-center gap-2 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Writing Mode</span>
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === STEP 4 === */}
                    {currentStep === 4 && (
                        <div className="space-y-8">
                            {/* Special Day & Deal Breaker Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Special Day */}
                                <div className="group relative flex flex-col rounded-3xl border border-border/50 bg-card/30 p-5 backdrop-blur-md transition-all hover:border-primary/30">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
                                        </div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-focus-within:text-primary transition-colors">
                                            Any Special Day?
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        value={entry.special_day || ''}
                                        onChange={(e) => handleChange('special_day', e.target.value)}
                                        placeholder="Birthday, Milestone..."
                                        className="w-full bg-transparent px-2 text-sm font-medium text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
                                    />
                                </div>

                                {/* Deal Breaker */}
                                <div className="group relative flex flex-col rounded-3xl border border-border/50 bg-card/30 p-5 backdrop-blur-md transition-all hover:border-destructive/30">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-2 rounded-xl bg-destructive/10 text-destructive">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                        </div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-focus-within:text-destructive transition-colors">
                                            Deal Breaker
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        value={entry.deal_breaker || ''}
                                        onChange={(e) => handleChange('deal_breaker', e.target.value)}
                                        placeholder="What went wrong?"
                                        className="w-full bg-transparent px-2 text-sm font-medium text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Daily Summary - The Centerpiece */}
                            <div className="group relative space-y-4 rounded-[2.5rem] border border-border/50 bg-gradient-to-b from-card/50 to-card/20 p-8 backdrop-blur-xl transition-all hover:border-primary/20">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
                                    <div className="space-y-1">
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Daily Summary</h3>
                                        <p className="text-[11px] text-muted-foreground font-medium">Capture the essence of your day in one story.</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter">
                                        {(entry.daily_summary || '').length} characters
                                    </span>
                                </div>

                                <div className="relative">
                                    <textarea
                                        value={entry.daily_summary || ''}
                                        onChange={(e) => handleChange('daily_summary', e.target.value)}
                                        placeholder="Write your day summary here..."
                                        className="min-h-[220px] w-full resize-none rounded-3xl border border-border bg-background/40 p-6 
                   text-base leading-relaxed text-foreground shadow-inner
                   placeholder:italic placeholder:text-muted-foreground/30
                   focus:bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30
                   transition-all duration-500"
                                    />

                                    {/* Decorative Focus Ring (Bottom) */}
                                    <div className="absolute bottom-6 right-8 flex items-center gap-1 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Writing Mode</span>
                                        <div className="h-1 w-1 rounded-full bg-primary animate-ping" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-8 flex justify-between relative">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="group flex items-center justify-center gap-2 rounded-2xl border border-border/60 
             bg-background/40 px-6 py-3 text-sm font-bold uppercase tracking-widest text-muted-foreground 
             backdrop-blur-sm transition-all duration-300 
             hover:bg-background/80 hover:text-foreground hover:border-border
             active:scale-95 disabled:opacity-30 disabled:pointer-events-none disabled:grayscale"
                    >
                        {/* Animated Arrow Left */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18" height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-transform duration-300 group-hover:-translate-x-1"
                        >
                            <path d="m15 18-6-6 6-6" />
                        </svg>

                        <span>Back</span>
                    </button>

                    {/* Scroll helper button */}
                    <div className="absolute left-1/2 -translate-x-1/2 z-20">
                        <FrostGlassScrollButton
                            containerRef={scrollRef}
                            label="Scroll to End"
                        />
                    </div>

                    {/* Show 'Next' button if not on the last step */}
                    {currentStep < totalSteps && (
                        <button
                            onClick={nextStep}
                            className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full 
               bg-primary px-5 py-2 text-[11px] font-black uppercase tracking-[0.15em] text-primary-foreground 
               shadow-md shadow-primary/20 transition-all duration-300 
               hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                            <span className="relative z-10">Next</span>

                            {/* Animated Arrow */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14" height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                            >
                                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                            </svg>
                        </button>
                    )}

                    {/* Show 'Submit' button only on the last step */}
                    {currentStep === totalSteps && (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`group relative flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-2 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300
      ${loading
                                    ? 'bg-muted text-muted-foreground/60 cursor-wait'
                                    : 'bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Saving</span>
                                </>
                            ) : (
                                <>
                                    <span className="relative z-10">Submit</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14" height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                    >
                                        <line x1="22" y1="2" x2="11" y2="13"></line>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                    </svg>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>

    );
}