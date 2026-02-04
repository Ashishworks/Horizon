"use client";

import { useEffect, useState, useRef } from "react";
import TimeRangeSelector from "@/app/dashboard/elements/TimeRangeSelector";
import Aiload from "../lottie/Aiload";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ChatMessage, ChatContext } from "@/lib/ai/chatTypes";


type AIFaceModalProps = {
    isOpen: boolean;
    isClosing: boolean;
    closeModal: () => void;
};

type Range = 7 | 30 | 90;

export default function AIFaceModal({
    isOpen,
    isClosing,
    closeModal,
}: AIFaceModalProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "chat">("overview");
    const [range, setRange] = useState<Range>(7);
    const [activeRange, setActiveRange] = useState<Range | null>(null);
    const [loading, setLoading] = useState(false);
    const [overviewText, setOverviewText] = useState<string[] | null>(null);
    const [chatStarted, setChatStarted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const [overviewCache, setOverviewCache] = useState<
        Partial<Record<Range, string[]>>
    >({});
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatContext, setChatContext] = useState<ChatContext>({
        focus: "general",
        timeRange: "7d",
    });
    const [input, setInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);
    useEffect(() => {
        if (isOpen) {
            setChatStarted(false);
            setHasSentFirstMessage(false);
            setMessages([]);
        }
    }, [isOpen]);


    async function loadOverview(selectedRange: Range) {
        // 1. Clear current text so the UI "flickers" and resets the animation
        setOverviewText(null);
        setActiveRange(null);

        if (overviewCache[selectedRange]) {
            // Use a tiny delay to allow React to process the 'null' state
            // This ensures the TextGenerateEffect restarts from scratch
            setTimeout(() => {
                setOverviewText(overviewCache[selectedRange]!);
                setActiveRange(selectedRange);
            }, 10);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/ai/overview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ timeRange: `${selectedRange}d` }),
            });

            const data = await res.json();
            const explanationArray = data.explanation
                .split("\n")
                .map((l: string) => l.trim())
                .filter(Boolean);

            setOverviewCache((prev) => ({
                ...prev,
                [selectedRange]: explanationArray,
            }));

            setOverviewText(explanationArray);
            setActiveRange(selectedRange);
        } catch {
            setOverviewText(["Unable to load AI overview right now."]);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, chatLoading]);

    useEffect(() => {
        if (isOpen) setChatStarted(false);
    }, [isOpen]);

    async function sendChatMessage() {
        if (!input.trim()) return;

        const userMsg: ChatMessage = { role: "user", content: input };

        setMessages((p) => [...p, userMsg]);
        setInput("");
        setChatLoading(true);

        if (!hasSentFirstMessage) {
            setHasSentFirstMessage(true);
        }

        const res = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: userMsg.content,
                context: chatContext,
            }),
        });

        const data = await res.json();

        setMessages((p) => [...p, { role: "assistant", content: data.reply }]);
        setChatContext(data.nextContext);
        setChatLoading(false);
    }


    useEffect(() => {
        if (activeTab === "chat") {
            setChatContext((p) => ({
                ...p,
                timeRange: `${range}d` as ChatContext["timeRange"],
            }));
        }
    }, [activeTab, range]);

    useEffect(() => {
        if (isOpen) setActiveTab("overview");
    }, [isOpen]);

    if (!isOpen) return null;

    const isCurrent = activeRange === range && overviewText !== null;
    const borderStyle =
        activeTab === "overview"
            ? "border-dashed border-border"
            : "border-dotted border-border/60";

    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center">
            <div
                onClick={closeModal}
                className={`absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity duration-200 ${isClosing ? "opacity-0" : "opacity-100"
                    }`}
            />

            <div
                className={`relative z-[9999]
    w-[95vw] h-[87vh]
    sm:w-[90vw] sm:h-[85vh]
    md:w-[85vw] md:h-[80vh]

    mx-3 my-3        
    sm:mx-0 sm:my-0   

    rounded-2xl bg-card text-card-foreground
    shadow-2xl border border-border overflow-hidden
    transition-all duration-200
    ${isClosing
                        ? "opacity-0 scale-95 translate-y-2"
                        : "opacity-100 scale-100"
                    }`}
            >

                <div className="h-full p-4 md:p-6">
                    {/* Tabs */}
                    <div className="flex justify-center mt-4">
                        <div className="relative flex w-[320px] rounded-full border bg-muted p-1">
                            <div
                                className="absolute top-1 left-1 h-[calc(100%-8px)] w-[calc(50%-4px)]
rounded-full bg-background shadow transition-transform duration-300"
                                style={{
                                    transform:
                                        activeTab === "overview"
                                            ? "translateX(0%)"
                                            : "translateX(100%)",
                                }}
                            />
                            <button
                                onClick={() => setActiveTab("overview")}
                                className="relative z-10 flex-1 py-2 text-sm"
                            >
                                AI Overview
                            </button>
                            <button
                                onClick={() => setActiveTab("chat")}
                                className="relative z-10 flex-1 py-2 text-sm"
                            >
                                Chat
                            </button>
                        </div>
                    </div>

                    {activeTab === "overview" && (
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
                            <TimeRangeSelector value={range} onChange={setRange} />
                            <button
                                onClick={() => loadOverview(range)}
                                disabled={isCurrent || loading}
                                className={`px-5 py-2 rounded-full text-sm transition-all duration-200
    ${isCurrent
                                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                                        : "bg-primary text-primary-foreground hover:brightness-110 hover:shadow-md active:scale-95"
                                    }`}
                            >
                                {loading ? "Generating…" : "See AI Overview"}
                            </button>

                        </div>
                    )}

                    {/* Content Box */}
                    <div
                        className={`mt-6 h-[65%] rounded-xl border ${borderStyle} flex justify-center overflow-hidden`}
                    >
                        {activeTab === "overview" ? (
                            <div
                                className="w-full h-full overflow-y-auto px-6 py-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                            >
                                <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-start min-h-full">
                                    {loading ? (
                                        <div className="my-auto space-y-3">
                                            <Aiload size={200} />
                                            <p className="text-muted-foreground">
                                                Reviewing last {range} days…
                                            </p>
                                        </div>
                                    ) : overviewText ? (
                                        /* The key={activeRange} forces a fresh animation when range changes */
                                        <div className="space-y-6 pb-4" key={activeRange}>
                                            {overviewText.map((l, i) => (
                                                <TextGenerateEffect
                                                    key={i}
                                                    words={l}
                                                    className="text-base sm:text-lg leading-relaxed"
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="my-auto text-muted-foreground">
                                            Select a range to begin.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* ... Chat Logic remains the same ... */
                            <div className="flex flex-col h-full w-full max-w-4xl">
                                {!hasSentFirstMessage ? (
                                    // ... intro screen ...
                                    <div className="flex flex-col justify-center items-center h-full text-center px-6">
                                        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-tight">
                                            Hey, I’m <span className="text-primary ai-glow-toggle">Zony</span>
                                        </h1>
                                        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
                                            I track your mood, sleep, stress & habits — let’s explore.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                            {messages.map((m, i) => (
                                                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                                    <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md"}`}>
                                                        {m.content}
                                                    </div>
                                                </div>
                                            ))}
                                            {chatLoading && <p className="text-xs text-muted-foreground">Zony is thinking…</p>}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    {activeTab === "chat" && !chatStarted && (
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => setChatStarted(true)}
                                className="
      group
      relative
      px-8 py-3
      rounded-full
      bg-primary text-primary-foreground
      text-sm font-medium
      shadow-md
      transition-all duration-300
      hover:shadow-lg
      hover:scale-[1.03]
      active:scale-[0.97]
      focus:outline-none
    "
                            >
                                <span className="relative z-10">Let's chat</span>

                                {/* subtle glow */}
                                <span
                                    className="
        absolute inset-0
        rounded-full
        bg-primary/20
        blur-lg
        opacity-0
        transition-opacity duration-300
        group-hover:opacity-100
      "
                                />
                            </button>
                        </div>

                    )}

                    {activeTab === "chat" && chatStarted && (
                        <div className="mt-4 px-4">
                            <div className="flex gap-2 items-center">

                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                                    placeholder="Ask about your patterns…"
                                    className="
    flex-1 min-w-0
    rounded-full border border-border
    px-4 py-2 text-sm
    outline-none
    focus:ring-0
    focus:border-muted-foreground/40
    transition-colors
  "
                                />

                                <button
                                    onClick={sendChatMessage}
                                    disabled={chatLoading}
                                    className={`
    group
    px-4 py-2
    rounded-full
    text-sm font-medium
    transition-all duration-200
    focus:outline-none

    ${chatLoading
                                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                                            : `
            bg-primary text-primary-foreground
            hover:shadow-md
            hover:scale-[1.02]
            active:scale-[0.97]
          `
                                        }
  `}
                                >
                                    <span className="flex items-center gap-2">
                                        {chatLoading && (
                                            <span className="h-3 w-3 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                                        )}
                                        {chatLoading ? "Thinking…" : "Send"}
                                    </span>
                                </button>


                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
