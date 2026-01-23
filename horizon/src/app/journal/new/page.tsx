'use client';


import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { format } from 'date-fns';
import { toast, Toaster } from 'react-hot-toast';
import ElasticSlider from '@/app/components/ui/ElasticSlider';
import { RiEmotionSadFill, RiEmotionHappyFill } from 'react-icons/ri';
import FrostGlassScrollButton from '@/app/components/ui/FrostGlassScrollButton';
import { MutatingDots } from 'react-loader-spinner';
import Noise from '@/app/components/ui/noise';
import RotatingText from '@/components/RotatingText';
import { motion } from 'framer-motion';
import Face from '@/app/components/ui/face';
// or whatever source you use for the motion component

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
        const promise = (async () => {
            setLoading(true);

            if (!userId) {
                router.push("/auth");
                throw new Error("User session not found. Please log in again.");
            }

            if (!entry.mood) {
                throw new Error("Please select your mood before submitting.");
            }

            const today = format(new Date(), "yyyy-MM-dd");

            // ✅ Filter exercise
            const exercisesToSave = entry.exercise
                ? entry.exercise.filter((ex) => ex !== "Other" && ex.trim() !== "Other:")
                : [];

            // ✅ CALL API (server will: save to supabase + delete redis keys)
            const res = await fetch("/api/journal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...entry,
                    date: today,
                    exercise: exercisesToSave.length ? exercisesToSave : null,
                }),
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error || "Failed to save journal");
            }
        })();

        try {
            await toast.promise(promise, {
                loading: "Saving journal...",
                success: " Journal saved successfully!",
                error: (err) => ` Error: ${err.message || "Failed to save."}`,
            });
        } finally {
            setLoading(false);
        }
    };


    // --- RENDER ---

    if (!userId) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <MutatingDots
                    visible={true}
                    height="100"
                    width="100"
                    color="#ff0000ff"
                    secondaryColor="#4fa94d"
                    radius="12.5"
                    ariaLabel="mutating-dots-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                />
            </div>
        );
    }

    return (
        <div className="relative z-0 h-screen py-10 px-4 bg-background text-foreground flex flex-col items-center overflow-hidden">


            {/* Background Noise Layer */}
            <div className="fixed inset-0 -z-10 opacity-[0.15] pointer-events-none">
                <Noise patternAlpha={60} />
            </div>
            <Toaster position="top-center" reverseOrder={false} />

            {/* Header */}
            {/* <div className="fixed transition-all top-20 right-6 group hidden md:block">
                <Face
                    size={60}
                    color={4}
                    shadow={2}
                    mouthWidth={20}
                    mouthHeight={12}
                />
                <span className="absolute hidden top-18 right-1 group-hover:block p-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap shadow-lg ">
                    Don&apos;t touch me!
                </span>
            </div> */}
            <motion.h1
                layout
                transition={{ duration: 0.3 }}
                className="flex flex-wrap items-center justify-center mt-10 mb-8 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-center"
            >
                Capture Your
                <RotatingText
                    texts={['Journey', 'Moments', 'Feelings!', 'Thoughts',]}
                    mainClassName="px-1 sm:px-2 md:px-3 bg-white text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg ml-2 sm:ml-3 md:ml-4"
                    staggerFrom={"last"}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"

                    rotationInterval={1700}
                />
            </motion.h1>



            {/* Card Container */}
            <div className="w-full max-w-4xl bg-card p-8 rounded-xl shadow flex flex-col flex-1 overflow-hidden border border-border animate-candle-glow">

                {/* Stepper */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-center text-blue-200 dark:text-blue-200">
                        {stepTitles[currentStep - 1]}
                    </h2>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
                        <div
                            className="bg-blue-200 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Step Content (Scrollable Area) */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto pr-4 -mr-4 hide-scrollbar relative"
                >
                    {/* === STEP 1 === */}
                    {currentStep === 1 && (
                        <div className="space-y-8">
                            <div className="flex flex-col items-center w-full">
                                <label className="block font-semibold mb-3 text-center text-lg">
                                    Overall Mood <span className="text-red-500">*</span>
                                </label>
                                <div className="w-full md:w-[90%] lg:w-[95%] flex flex-col items-center">
                                    <ElasticSlider
                                        startingValue={1}
                                        defaultValue={entry.mood}
                                        maxValue={10}
                                        isStepped
                                        stepSize={1}
                                        leftIcon={
                                            <RiEmotionSadFill size={30} className="text-blue-200" />
                                        }
                                        rightIcon={
                                            <RiEmotionHappyFill
                                                size={30}
                                                className="text-yellow-200"
                                            />
                                        }
                                        onValueChange={(value) => handleChange('mood', value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">
                                    Overthinking Status
                                </label>
                                <input
                                    type="range"
                                    min={0}
                                    max={10}
                                    value={entry.overthinking ?? 0}
                                    onChange={(e) =>
                                        handleChange('overthinking', +e.target.value)
                                    }
                                    className="w-full glow-slider"
                                />
                                <span className="ml-2">{entry.overthinking ?? 0}</span>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">
                                    Stress Level
                                </label>
                                <input
                                    type="range"
                                    min={0}
                                    max={10}
                                    value={entry.stress_level ?? 0}
                                    onChange={(e) =>
                                        handleChange('stress_level', +e.target.value)
                                    }
                                    className="w-full glow-slider"
                                />
                                <span className="ml-2">{entry.stress_level ?? 0}</span>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">
                                    Stress Triggers
                                </label>
                                <textarea
                                    value={entry.stress_triggers || ''}
                                    onChange={(e) =>
                                        handleChange('stress_triggers', e.target.value)
                                    }
                                    placeholder="What triggered stress today?"
                                    className="w-full p-2 border rounded h-20 bg-input border-border"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">
                                    Did you have any negative thoughts today?
                                </label>
                                <select
                                    value={entry.negative_thoughts || ''}
                                    onChange={(e) =>
                                        handleChange('negative_thoughts', e.target.value as 'Yes' | 'No')
                                    }
                                    className="w-full p-2 border rounded bg-input border-border"
                                >
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>

                                {entry.negative_thoughts === 'Yes' && (
                                    <textarea
                                        value={entry.negative_thoughts_detail || ''}
                                        onChange={(e) =>
                                            handleChange('negative_thoughts_detail', e.target.value)
                                        }
                                        placeholder="Describe briefly (optional)"
                                        className="w-full p-2 border rounded h-20 mt-2 bg-input border-border"
                                    ></textarea>
                                )}
                            </div>
                        </div>
                    )}

                    {/* === STEP 2 === */}
                    {currentStep === 2 && (
                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block font-semibold mb-1">
                                        Sleep Quality Last Night
                                    </label>
                                    <input
                                        type="text"
                                        value={entry.sleep_quality || ''}
                                        onChange={(e) =>
                                            handleChange('sleep_quality', e.target.value)
                                        }
                                        placeholder="Good, Okay, Poor..."
                                        className="w-full p-2 border rounded bg-input border-border"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block font-semibold mb-1">
                                        Hours Slept
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={entry.sleep_hours ?? ''}
                                        onChange={(e) =>
                                            handleChange('sleep_hours', +e.target.value)
                                        }
                                        className="w-full p-2 border rounded bg-input border-border"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold mb-2">
                                    Exercise Done
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {exerciseOptions.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => handleMultiSelect('exercise', option)}
                                            className={`px-3 py-1 rounded border transition ${entry.exercise.includes(option)
                                                ? 'bg-blue-500 text-white border-blue-500' // Left this as-is, as no 'primary' border was specified
                                                : 'bg-input text-muted-foreground border-border'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                                {entry.exercise.includes('Other') && (
                                    <input
                                        type="text"
                                        placeholder="Specify other exercise"
                                        value={
                                            entry.exercise
                                                .find((e) => e.startsWith('Other:'))
                                                ?.replace('Other: ', '') || ''
                                        }
                                        onChange={handleOtherExerciseChange}
                                        className="w-full p-2 border rounded bg-input border-border"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">
                                    Diet Status
                                </label>
                                <select
                                    value={entry.diet_status || ''}
                                    onChange={(e) =>
                                        handleChange(
                                            'diet_status',
                                            e.target.value as JournalEntry['diet_status']
                                        )
                                    }
                                    className="w-full p-2 border rounded bg-input border-border"
                                >
                                    <option value="">Select</option>
                                    <option value="Okaish">Okaish</option>
                                    <option value="Good">Good</option>
                                    <option value="Bad">Bad</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">
                                    Caffeine Intake (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="E.g., 2 cups coffee, 1 cup tea"
                                    value={entry.caffeine_intake || ''}
                                    onChange={(e) =>
                                        handleChange('caffeine_intake', e.target.value)
                                    }
                                    className="w-full p-2 border rounded bg-input border-border"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">
                                    Time Spent Outdoors (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="E.g., 30 minutes walk"
                                    value={entry.time_outdoors || ''}
                                    onChange={(e) =>
                                        handleChange('time_outdoors', e.target.value)
                                    }
                                    className="w-full p-2 border rounded bg-input border-border"
                                />
                            </div>
                        </div>
                    )}

                    {/* === STEP 3 === */}
                    {currentStep === 3 && (
                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block font-semibold mb-1">
                                        Productivity Scale /10
                                    </label>
                                    <input
                                        type="range"
                                        min={0}
                                        max={10}
                                        value={entry.productivity ?? 5}
                                        onChange={(e) =>
                                            handleChange('productivity', +e.target.value)
                                        }
                                        className="w-full glow-slider"
                                    />
                                    <span className="ml-2">{entry.productivity ?? 5}</span>
                                </div>
                                <div className="flex-1">
                                    <label className="block font-semibold mb-1">
                                        Productivity Compared to Yesterday
                                    </label>
                                    <select
                                        value={entry.productivity_comparison || ''}
                                        onChange={(e) =>
                                            handleChange(
                                                'productivity_comparison',
                                                e.target.value as JournalEntry['productivity_comparison']
                                            )
                                        }
                                        className="w-full p-2 border rounded bg-input border-border"
                                    >
                                        <option value="">Select</option>
                                        <option value="Better">Better than yesterday</option>
                                        <option value="Same">Almost same</option>
                                        <option value="Worse">Worse</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">
                                    Did you spend time with friends or family?
                                </label>
                                <select
                                    value={entry.social_time || ''}
                                    onChange={(e) =>
                                        handleChange(
                                            'social_time',
                                            e.target.value as 'Decent' | 'Less' | 'Zero'
                                        )
                                    }
                                    className="w-full p-2 border rounded bg-input border-border"
                                >
                                    <option value="">Select</option>
                                    <option value="Decent">Decent time</option>
                                    <option value="Less">Less but not nil</option>
                                    <option value="Zero">Zero</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">
                                    Screen Time (Optional)
                                </label>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="text-sm block mb-1">
                                            For Work (hours)
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            step={1}
                                            value={entry.screen_work ?? ''}
                                            onChange={(e) =>
                                                handleChange('screen_work', +e.target.value)
                                            }
                                            className="w-full p-2 border rounded bg-input border-border"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm block mb-1">
                                            For Entertainment (hours)
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            step={1}
                                            value={entry.screen_entertainment ?? ''}
                                            onChange={(e) =>
                                                handleChange('screen_entertainment', +e.target.value)
                                            }
                                            className="w-full p-2 border rounded bg-input border-border"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">
                                    Main Challenges / Plans (Optional)
                                </label>
                                <textarea
                                    value={entry.main_challenges || ''}
                                    onChange={(e) =>
                                        handleChange('main_challenges', e.target.value)
                                    }
                                    placeholder="Challenges you faced or planned to do"
                                    className="w-full p-2 border rounded h-20 bg-input border-border"
                                ></textarea>
                            </div>
                        </div>
                    )}

                    {/* === STEP 4 === */}
                    {currentStep === 4 && (
                        <div className="space-y-8">
                            <div>
                                <label className="block font-semibold mb-1">
                                    Any Special Day? (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={entry.special_day || ''}
                                    onChange={(e) =>
                                        handleChange('special_day', e.target.value)
                                    }
                                    placeholder="E.g., Birthday, Anniversary, Milestone..."
                                    className="w-full p-2 border rounded bg-input border-border"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">
                                    Deal Breaker of the Day (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={entry.deal_breaker || ''}
                                    onChange={(e) =>
                                        handleChange('deal_breaker', e.target.value)
                                    }
                                    placeholder="The one thing that ruined the day, if any"
                                    className="w-full p-2 border rounded bg-input border-border"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">
                                    Describe your day in one paragraph (Optional)
                                </label>
                                <textarea
                                    value={entry.daily_summary || ''}
                                    onChange={(e) =>
                                        handleChange('daily_summary', e.target.value)
                                    }
                                    placeholder="Write your day summary..."
                                    className="w-full p-4 border rounded h-40 bg-input border-border"
                                ></textarea>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-8 flex justify-between relative">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="px-6 py-2  bg-black/50 hover:bg-black rounded font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
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
                            className="px-6 py-2 bg-black/50 hover:bg-black text-white rounded font-semibold transition"
                        >
                            Next
                        </button>
                    )}

                    {/* Show 'Submit' button only on the last step */}
                    {currentStep === totalSteps && (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`px-6 py-2 rounded font-semibold transition ${loading
                                ? 'bg-secondary text-secondary-foreground cursor-not-allowed'
                                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                }`}
                        >
                            {loading ? 'Saving...' : 'Submit Journal'}
                        </button>
                    )}
                </div>
            </div>
        </div>

    );
}