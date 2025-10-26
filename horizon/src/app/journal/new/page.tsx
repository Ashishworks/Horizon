'use client';

import { useState } from 'react';
import { TextHoverEffect } from '@/app/components/ui/text-hover';
import ElasticSlider from '@/app/components/ui/ElasticSlider';
import { RiEmotionSadFill, RiEmotionHappyFill } from 'react-icons/ri';

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
}

const exerciseOptions = ['Running', 'Gym', 'Cycling', 'Freeform', 'Other'];

export default function JournalPage() {
    const [entry, setEntry] = useState<JournalEntry>({
        mood: 5,
        exercise: [],
    });

    // Generic handleChange ensures type safety
    const handleChange = <K extends keyof JournalEntry>(field: K, value: JournalEntry[K]) => {
        setEntry((prev) => ({ ...prev, [field]: value }));
    };

    // Handle multi-select for exercise
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

    return (
        <div className="min-h-screen py-10 px-4 bg-gray-50 dark:bg-gray-900 text-black dark:text-white flex flex-col items-center">
            <h1 className="w-full flex justify-center mt-10">
                <div className="w-full max-w-3xl">
                    <TextHoverEffect text="MARK YOUR DAY!" />
                </div>
            </h1>

            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow space-y-8">

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
                        <span className="ml-2">{entry.productivity}</span>
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
                    <span className="ml-2">{entry.overthinking}</span>
                </div>

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

                {/* Stress & Diet */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block font-semibold mb-1">Stress Level /10</label>
                        <input
                            type="range"
                            min={0}
                            max={10}
                            value={entry.stress_level ?? 0}
                            onChange={(e) => handleChange('stress_level', +e.target.value)}
                            className="w-full"
                        />
                        <span className="ml-2">{entry.stress_level}</span>
                    </div>
                    <div className="flex-1">
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

                <button
                    onClick={handleSubmit}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded font-semibold transition"
                >
                    Submit Journal
                </button>
            </div>
        </div>
    );
}
