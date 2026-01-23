"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import AIFaceModal from "./AIFaceModal";

// ✅ routes where assistant should NOT appear
const disabledRoutes = ["/auth", "/onboarding", "/"];
const STORAGE_KEY = "horizon_ai_face_position_v1";

export default function AIFaceAssistant() {


    const faceWrapperRef = useRef<HTMLDivElement | null>(null);
    const leftEye = useRef<HTMLDivElement | null>(null);
    const rightEye = useRef<HTMLDivElement | null>(null);

    // assistant size (small face)
    const size = 80;

    // ✅ little space from edges
    const EDGE_PADDING = 24;

    // proportional sizes
    const eyeSize = size * 0.25;
    const pupilSize = eyeSize * 0.4;
    const mouthW = size * 0.22;
    const mouthH = size * 0.2;

    // position
    const [pos, setPos] = useState(() => {
        if (typeof window === "undefined") return { x: EDGE_PADDING, y: 160 };

        const x = window.innerWidth - size - EDGE_PADDING;  // ✅ right edge
        const y = window.innerHeight / 2 - size / 2;        // ✅ middle vertically

        return { x, y };
    });

    // dragging states
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // ✅ for preventing click open on drag
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
    const [dragMoved, setDragMoved] = useState(false);

    // modal
    const [isOpen, setIsOpen] = useState(false);
    const isOpenRef = useRef(false);

    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    const [isClosing, setIsClosing] = useState(false);

    const [isPressed, setIsPressed] = useState(false);


    const DRAG_THRESHOLD = 6;

    // -----------------------------
    // ✅ Restore position from localStorage
    // -----------------------------
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) {
                const x = window.innerWidth - size - EDGE_PADDING;
                const y = window.innerHeight / 2 - size / 2;
                setPos({ x, y });
                return;
            }


            const parsed = JSON.parse(saved);
            if (typeof parsed?.x !== "number" || typeof parsed?.y !== "number") return;

            const maxX = window.innerWidth - size;
            const maxY = window.innerHeight - size;

            const safeX = Math.min(Math.max(EDGE_PADDING, parsed.x), maxX - EDGE_PADDING);
            const safeY = Math.min(Math.max(EDGE_PADDING, parsed.y), maxY - EDGE_PADDING);

            setPos({ x: safeX, y: safeY });
        } catch (err) {
            console.log("Position restore failed", err);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // -----------------------------
    // ✅ Eye tracking
    // -----------------------------
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const eyes = [leftEye.current, rightEye.current];

            eyes.forEach((eye) => {
                if (!eye) return;

                const rect = eye.getBoundingClientRect();
                const eyeX = rect.left + rect.width / 2;
                const eyeY = rect.top + rect.height / 2;

                const dx = e.clientX - eyeX;
                const dy = e.clientY - eyeY;
                const angle = Math.atan2(dy, dx);

                const radius = 0.2 * eyeSize;
                const pupil = eye.querySelector<HTMLDivElement>(".pupil");

                if (pupil) {
                    pupil.style.transform = `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)`;
                }
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [eyeSize]);

    // -----------------------------
    // ✅ Modal open/close
    // -----------------------------
    const openModal = () => setIsOpen(true);

    const closeModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
        }, 220);
    };


    const triggerPress = () => {
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 120); // quick bounce back
    };


    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) closeModal();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen]);

    // -----------------------------
    // ✅ Snap to edge + save in localStorage
    // -----------------------------
    const snapToNearestEdge = (x: number, y: number) => {
        const maxX = window.innerWidth - size;
        const maxY = window.innerHeight - size;

        const snapX = x < window.innerWidth / 2 ? EDGE_PADDING : maxX - EDGE_PADDING;
        const safeY = Math.min(Math.max(EDGE_PADDING, y), maxY - EDGE_PADDING);

        const finalPos = { x: snapX, y: safeY };
        setPos(finalPos);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(finalPos));
        } catch (err) {
            console.log("Saving position failed", err);
        }
    };

    // -----------------------------
    // ✅ Dragging logic
    // -----------------------------
    const onMouseDown = (e: React.MouseEvent) => {
        if (!faceWrapperRef.current) return;

        setIsDragging(true);
        setDragMoved(false);

        setStartPoint({ x: e.clientX, y: e.clientY });

        const rect = faceWrapperRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        const movedDist = Math.hypot(e.clientX - startPoint.x, e.clientY - startPoint.y);
        if (movedDist > DRAG_THRESHOLD) setDragMoved(true);

        const maxX = window.innerWidth - size;
        const maxY = window.innerHeight - size;

        const nextX = Math.min(Math.max(0, e.clientX - dragOffset.x), maxX);
        const nextY = Math.min(Math.max(0, e.clientY - dragOffset.y), maxY);

        setPos({ x: nextX, y: nextY });
    };

    // ✅ mouseup should get latest pointer coords (more accurate)
    const onMouseUp = (e: MouseEvent) => {
        if (!isDragging) return;

        setIsDragging(false);

        const rawX = e.clientX - dragOffset.x;
        const rawY = e.clientY - dragOffset.y;

        // ✅ snap + save
        snapToNearestEdge(rawX, rawY);

        // ✅ open modal ONLY if it was a click
        if (!dragMoved) {
            triggerPress();

            // ✅ toggle modal
            if (isOpenRef.current) {
                closeModal();
            } else {
                openModal();
            }
        }


    };

    useEffect(() => {
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    });

    const pathname = usePathname();
    if (disabledRoutes.includes(pathname)) return null;

    return (
        <>
            {/* ✅ Floating assistant */}
            <div
                ref={faceWrapperRef}
                onMouseDown={onMouseDown}
                style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                }}
                className={`fixed z-[9999] select-none ${isDragging ? "" : "transition-[left,top] duration-300 ease-out"
                    }`}
            >
                <div
                    className={`cursor-grab active:cursor-grabbing transition-transform duration-950 ease-out ${isPressed ? "scale-80" : "scale-100"
                        }`}
                >
                    <div className="relative rounded-full">
                        {/* Glow */}
                        <div
                            className="absolute -inset-[10px] rounded-full blur-xl opacity-70 ai-glow"
                            style={{
                                background:
                                    "conic-gradient(from 180deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)",
                            }}
                        />

                        {/* ✅ Rotating ring ONLY */}
                        <div
                            className="absolute -inset-[4px] rounded-full animate-spin-slow"
                            style={{
                                background:
                                    "conic-gradient(from 180deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)",
                            }}
                        />

                        {/* Inner padding */}
                        <div className="relative rounded-full bg-white shadow-lg">
                            {/* Face */}
                            <div
                                className="relative rounded-full border border-black flex items-center justify-around"
                                style={{
                                    width: `${size}px`,
                                    height: `${size}px`,
                                    boxShadow: "0px 8px 12px rgba(0,0,0,0.2)",
                                }}
                            >
                                {/* Left Eye */}
                                <div
                                    ref={leftEye}
                                    className="relative flex items-center justify-center bg-white border-2 border-black rounded-full"
                                    style={{ width: eyeSize, height: eyeSize }}
                                >
                                    <div
                                        className="pupil rounded-full bg-black"
                                        style={{
                                            width: pupilSize,
                                            height: pupilSize,
                                            transition: "transform 0.15s",
                                        }}
                                    />
                                </div>

                                {/* Right Eye */}
                                <div
                                    ref={rightEye}
                                    className="relative flex items-center justify-center bg-white border-2 border-black rounded-full"
                                    style={{ width: eyeSize, height: eyeSize }}
                                >
                                    <div
                                        className="pupil rounded-full bg-black"
                                        style={{
                                            width: pupilSize,
                                            height: pupilSize,
                                            transition: "transform 0.05s",
                                        }}
                                    />
                                </div>

                                {/* Mouth */}
                                <div
                                    className="absolute left-1/2 border-b-[5px] border-black rounded-full"
                                    style={{
                                        bottom: `${0.15 * size}px`,
                                        transform: "translateX(-50%)",
                                        width: mouthW,
                                        height: mouthH,
                                        transition: "width 0.3s ease, height 0.3s ease",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ Modal */}
            <AIFaceModal isOpen={isOpen} isClosing={isClosing} closeModal={closeModal} />

        </>
    );
}
