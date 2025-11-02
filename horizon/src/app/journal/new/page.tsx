'use client';

import { useState } from 'react';
import { TextHoverEffect } from '@/app/components/ui/text-hover';
import ElasticSlider from '@/app/components/ui/ElasticSlider';
import { RiEmotionSadFill, RiEmotionHappyFill } from 'react-icons/ri';
import FrostGlassScrollButton from '@/app/components/ui/FrostGlassScrollButton';
import { useRef } from "react";


// The interface remains the same
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

const exerciseOptions = ['Running', 'Gym', 'Cycling', 'Freeform', 'Other'];

// Define titles for each step
const stepTitles = [
    'Step 1: Mental Check-in',
    'Step 2: Health & Activity',
    'Step 3: Productivity & Events',
    'Step 4: Daily Reflection'
];

export default function JournalPage() {
    const [entry, setEntry] = useState<JournalEntry>({
        mood: 5,
        exercise: [],
    });
    const scrollRef = useRef<HTMLDivElement>(null);
    // --- Stepper State ---
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    // --- State Handlers (Unchanged) ---
    const handleChange = <K extends keyof JournalEntry>(field: K, value: JournalEntry[K]) => {
        setEntry((prev) => ({ ...prev, [field]: value }));
    };

    const handleMultiSelect = (field: 'exercise', value: string) => {
        setEntry((prev) => {
            const current = prev[field] as string[];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter((v) => v !== value) };
            } else {
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    const handleSubmit = () => {
        console.log('Journal submitted:', entry);
        // TODO: Save to Supabase or Elasticsearch
    };

    // --- Stepper Navigation ---
   const nextStep = () => {
  setCurrentStep((prev) => {
    const newStep = Math.min(prev + 1, totalSteps);
    // scroll back to top of the scrollable div
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    return newStep;
  });
};

    const prevStep = () => {
  setCurrentStep((prev) => {
    const newStep = Math.max(prev - 1, 1);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    return newStep;
  });
};

    return (
        // MODIFICATION: Set explicit screen height and flex-col
        <div className="h-screen py-10 px-4 bg-gray-50 dark:bg-gray-900 text-black dark:text-white flex flex-col items-center">

            {/* 1. HEADER (Fixed height) */}
            <h1 className="w-full flex justify-center mt-10">
                <div className="w-full max-w-3xl">
                    <TextHoverEffect text="MARK YOUR DAY!" />
                </div>
            </h1>

            {/* MODIFICATION: 
                - `flex-1` makes this card take all remaining vertical space.
                - `flex flex-col` allows us to pin the header/footer inside.
                - `overflow-hidden` clips the content for rounded corners.
                - `mt-6` (optional) adds space between header and card.
            */}
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow flex flex-col flex-1  overflow-hidden">

                {/* 2. STEPPER UI (Fixed at top of card) */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400">
                        {stepTitles[currentStep - 1]}
                    </h2>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* MODIFICATION: 
                    - `flex-1` makes this content area fill the space.
                    - `overflow-y-auto` adds a scrollbar *only if* the step's content is too tall.
                    - `pr-4 -mr-4` is a common trick to give content padding from the scrollbar.
                */}

                <div ref={scrollRef} className="flex-1 overflow-y-auto pr-4 -mr-4 hide-scrollbar relative">
                    {/* === STEP 1: Mental Check-in === */}
                    {currentStep === 1 && (
                        <div className="space-y-8">
                            {/* Mood */}
                            <div className="flex flex-col items-center w-full">
                                <label className="block font-semibold mb-3 text-center text-lg">
                                    Overall Mood
                                </label>
                                <div className="w-full md:w-[90%] lg:w-[95%] flex flex-col items-center">
                                    <ElasticSlider
                                        startingValue={1}
                                        defaultValue={entry.mood}
                                        maxValue={10}
                                        isStepped
                                        stepSize={1}
                                        leftIcon={<RiEmotionSadFill size={30} className="text-blue-200" />}
                                        rightIcon={<RiEmotionHappyFill size={30} className="text-yellow-200" />}
                                        onValueChange={(value) => handleChange('mood', value)}
                                    />
                                </div>
                            </div>

                            {/* Overthinking */}
                            <div>
                                <label className="block font-semibold mb-1">Overthinking Status /5</label>
                                <input
                                    type="range"
                                    min={0}
                                    max={5}
                                    value={entry.overthinking ?? 0}
                                    onChange={(e) => handleChange('overthinking', +e.target.value)}
                                    className="w-full"
                                />
                                <span className="ml-2">{entry.overthinking ?? 0}</span>
                            </div>

                            {/* Stress Level */}
                            <div>
                                <label className="block font-semibold mb-1">Stress Level /10</label>
                                <input
                                    type="range"
                                    min={0}
                                    max={10}
                                    value={entry.stress_level ?? 0}
                                    onChange={(e) => handleChange('stress_level', +e.target.value)}
                                    className="w-full"
                                />
                                <span className="ml-2">{entry.stress_level ?? 0}</span>
                            </div>

                            {/* Stress Triggers */}
                            <div>
                                <label className="block font-semibold mb-1">Stress Triggers</label>
                                <textarea
                                    value={entry.stress_triggers || ''}
                                    onChange={(e) => handleChange('stress_triggers', e.target.value)}
                                    placeholder="What triggered stress today?"
                                    className="w-full p-2 border rounded h-20 dark:bg-gray-700 dark:border-gray-600"
                                ></textarea>
                            </div>

                            {/* Negative Thoughts */}
                            <div>
                                <label className="block font-semibold mb-1">
                                    Did you have any negative thoughts today?
                                </label>
                                <select
                                    value={entry.negative_thoughts || ''}
                                    onChange={(e) =>
                                        handleChange('negative_thoughts', e.target.value as 'Yes' | 'No')
                                    }
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>

                                {entry.negative_thoughts === 'Yes' && (
                                    <textarea
                                        value={entry.negative_thoughts_detail || ''}
                                        onChange={(e) => handleChange('negative_thoughts_detail', e.target.value)}
                                        placeholder="Describe briefly (optional)"
                                        className="w-full p-2 border rounded h-20 mt-2 dark:bg-gray-700 dark:border-gray-600"
                                    ></textarea>
                                )}
                            </div>
                        </div>
                    )}

                    {/* === STEP 2: Health & Activity === */}
                    {currentStep === 2 && (
                        <div className="space-y-8">
                            {/* Sleep Quality & Hours */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block font-semibold mb-1">Sleep Quality Last Night</label>
                                    <input
                                        type="text"
                                        value={entry.sleep_quality || ''}
                                        onChange={(e) => handleChange('sleep_quality', e.target.value)}
                                        placeholder="Good, Okay, Poor..."
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block font-semibold mb-1">Hours Slept</label>
                                    <input
                                        type="number"
                                        value={entry.sleep_hours ?? ''}
                                        onChange={(e) => handleChange('sleep_hours', +e.target.value)}
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                            </div>

                            {/* Exercise */}
                            <div>
                                <label className="block font-semibold mb-2">Exercise Done</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {exerciseOptions.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => handleMultiSelect('exercise', option)}
                                            className={`px-3 py-1 rounded border transition ${entry.exercise.includes(option)
                                                ? 'bg-blue-500 text-white border-blue-500'
                                                : 'bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600'
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
                                        value={entry.exercise.find((e) => e.startsWith('Other:'))?.replace('Other: ', '') || ''}
                                        onChange={(e) =>
                                            handleChange(
                                                'exercise',
                                                entry.exercise.map((ex) =>
                                                    ex.startsWith('Other:') ? `Other: ${e.target.value}` : ex
                                                )
                                            )
                                        }
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    />
                                )}
                            </div>

                            {/* Diet Status */}
                            <div>
                                <label className="block font-semibold mb-1">Diet Status</label>
                                <select
                                    value={entry.diet_status || ''}
                                    onChange={(e) => handleChange('diet_status', e.target.value as JournalEntry['diet_status'])}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="">Select</option>
                                    <option value="Okaish">Okaish</option>
                                    <option value="Good">Good</option>
                                    <option value="Bad">Bad</option>
                                </select>
                            </div>

                            {/* Caffeine Intake */}
                            <div>
                                <label className="block font-semibold mb-1">
                                    Caffeine Intake (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="E.g., 2 cups coffee, 1 cup tea"
                                    value={entry.caffeine_intake || ''}
                                    onChange={(e) => handleChange('caffeine_intake', e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>

                            {/* Time Spent Outdoors */}
                            <div>
                                <label className="block font-semibold mb-1">
                                    Time Spent Outdoors (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="E.g., 30 minutes walk"
                                    value={entry.time_outdoors || ''}
                                    onChange={(e) => handleChange('time_outdoors', e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                        </div>
                    )}

                    {/* === STEP 3: Productivity & Events === */}
                    {currentStep === 3 && (
                        <div className="space-y-8">
                            {/* Productivity */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block font-semibold mb-1">Productivity Scale /10</label>
                                    <input
                                        type="range"
                                        min={0}
                                        max={10}
                                        value={entry.productivity ?? 5}
                                        onChange={(e) => handleChange('productivity', +e.target.value)}
                                        className="w-full"
                                    />
                                    <span className="ml-2">{entry.productivity ?? 5}</span>
                                </div>
                                <div className="flex-1">
                                    <label className="block font-semibold mb-1">Productivity Compared to Yesterday</label>
                                    <select
                                        value={entry.productivity_comparison || ''}
                                        onChange={(e) => handleChange('productivity_comparison', e.target.value as JournalEntry['productivity_comparison'])}
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        <option value="">Select</option>
                                        <option value="Better">Better than yesterday</option>
                                        <option value="Same">Almost same</option>
                                        <option value="Worse">Worse</option>
                                    </select>
                                </div>
                            </div>

                            {/* Social Interaction */}
                            <div>
                                <label className="block font-semibold mb-1">
                                    Did you spend time with friends or family?
                                </label>
                                <select
                                    value={entry.social_time || ''}
                                    onChange={(e) =>
                                        handleChange('social_time', e.target.value as 'Decent' | 'Less' | 'Zero')
                                    }
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="">Select</option>
                                    <option value="Decent">Decent time</option>
                                    <option value="Less">Less but not nil</option>
                                    <option value="Zero">Zero</option>
                                </select>
                            </div>

                            {/* Screen Time */}
                            <div>
                                <label className="block font-semibold mb-1">
                                    Screen Time (Optional)
                                </label>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="text-sm block mb-1">For Work (hours)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={entry.screen_work ?? ''}
                                            onChange={(e) => handleChange('screen_work', +e.target.value)}
                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm block mb-1">For Entertainment (hours)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={entry.screen_entertainment ?? ''}
                                            onChange={(e) => handleChange('screen_entertainment', +e.target.value)}
                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Main Challenges */}
                            <div>
                                <label className="block font-semibold mb-1">Main Challenges / Plans (Optional)</label>
                                <textarea
                                    value={entry.main_challenges || ''}
                                    onChange={(e) => handleChange('main_challenges', e.target.value)}
                                    placeholder="Challenges you faced or planned to do"
                                    className="w-full p-2 border rounded h-20 dark:bg-gray-700 dark:border-gray-600"
                                ></textarea>
                            </div>
                        </div>
                    )}

                    {/* === STEP 4: Daily Reflection === */}
                    {currentStep === 4 && (
                        <div className="space-y-8">
                            {/* Special Day */}
                            <div>
                                <label className="block font-semibold mb-1">Any Special Day? (Optional)</label>
                                <input
                                    type="text"
                                    value={entry.special_day || ''}
                                    onChange={(e) => handleChange('special_day', e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>

                            {/* Deal breaker */}
                            <div>
                                <label className="block font-semibold mb-1">Deal Breaker of the Day (Optional)</label>
                                <input
                                    type="text"
                                    value={entry.deal_breaker || ''}
                                    onChange={(e) => handleChange('deal_breaker', e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>

                            {/* Daily Summary */}
                            <div>
                                <label className="block font-semibold mb-1">Describe your day in one paragraph (Optional)</label>
                                <textarea
                                    value={entry.daily_summary || ''}
                                    onChange={(e) => handleChange('daily_summary', e.target.value)}
                                    placeholder="Write your day summary..."
                                    className="w-full p-4 border rounded h-40 dark:bg-gray-700 dark:border-gray-600"
                                ></textarea>
                            </div>
                        </div>
                    )}
                    
                </div>

                {/* MODIFICATION: 
                    - `pt-8` adds padding above the buttons, separating them from the scrollable area.
                    - `mt-10` is removed.
                */}
                <div className="pt-8 flex justify-between">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-black dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white rounded font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <div className="absolute left-1/2 -translate-x-1/2 z-20">
                        <FrostGlassScrollButton containerRef={scrollRef} label="Scroll to End" />
                    </div>
                    {currentStep < totalSteps && (
                        <button
                            onClick={nextStep}
                            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold transition"
                        >
                            Next
                        </button>
                    )}

                    {currentStep === totalSteps && (
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-semibold transition"
                        >
                            Submit Journal
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}