"use client";

import { useState } from "react";

type AIFaceModalProps = {
    isOpen: boolean;
    isClosing: boolean;
    closeModal: () => void;
};

export default function AIFaceModal({
    isOpen,
    isClosing,
    closeModal,
}: AIFaceModalProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "chat">("overview");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center">
            {/* Backdrop */}
            <div
                onClick={closeModal}
                className={`absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity duration-200 ${isClosing ? "opacity-0" : "opacity-100"
                    }`}
            />

            {/* Popup */}
            <div
                className={`relative z-[9999] w-[85vw] h-[80vh] rounded-2xl 
bg-card text-card-foreground shadow-2xl border border-border overflow-hidden
transition-all duration-200 ease-out ${isClosing
                        ? "opacity-0 scale-95 translate-y-2"
                        : "opacity-100 scale-100 translate-y-0"
                    }`}
            >
                <div className="h-full p-6">
                    {/* ✅ Top Bar */}
                    {/* ✅ Top Bar (Perfect centered layout) */}
                    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
                        {/* Left spacer */}
                        <div />

                        {/* Center content */}
                        <div className="flex flex-col items-center">

                            {/* ✅ Segmented Button */}
                            <div className="mt-4">
                                <div className="relative flex w-[360px] rounded-full border border-border bg-muted p-1 overflow-hidden">
                                    {/* Sliding highlight */}
                                    <div
                                        className="absolute top-1 left-1 h-[calc(100%-8px)] w-[calc(50%-4px)]
          rounded-full bg-background shadow-sm transition-transform duration-300 ease-in-out"
                                        style={{
                                            transform:
                                                activeTab === "overview" ? "translateX(0%)" : "translateX(100%)",
                                        }}
                                    />

                                    <button
                                        onClick={() => setActiveTab("overview")}
                                        className={`relative z-10 flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${activeTab === "overview"
                                                ? "text-foreground"
                                                : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        AI Overview
                                    </button>

                                    <button
                                        onClick={() => setActiveTab("chat")}
                                        className={`relative z-10 flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${activeTab === "chat"
                                                ? "text-foreground"
                                                : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        Chat
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right close button */}
                        <div className="flex justify-end">
                            <button
                                onClick={closeModal}
                                className="h-10 w-10 rounded-full hover:bg-accent text-foreground 
      flex items-center justify-center text-xl font-semibold transition"
                            >
                                ✕
                            </button>
                        </div>
                    </div>


                    {/* ✅ Content */}
                    <div className="mt-6 rounded-xl border border-dashed h-[75%] flex items-center justify-center border-border text-muted-foreground">
                        {activeTab === "overview" ? (
                            <div className="text-center">
                                <p className="text-lg font-semibold">Overview Mode</p>
                                <p className="text-sm mt-2 text-muted-foreground">
                                    Later: risk level, root cause, sentiment trends, insights etc.
                                </p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-lg font-semibold">Chat Mode</p>
                                <p className="text-sm mt-2 text-muted-foreground">
                                    Later: AI chat interface here.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
