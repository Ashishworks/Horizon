'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import dynamic from 'next/dynamic';
import Searchlocation from '../lottie/Searchlocation';

const LeafletMap = dynamic(
    () => import('@/app/components/nearby/LeafletMap'),
    { ssr: false }
);

type Place = {
    id: number;
    lat: number;
    lon: number;
    name: string;
    type: string;
};

export default function NearbyHelpModal({
    open,
    onClose,
    risk,
}: {
    open: boolean;
    onClose: () => void;
    risk: 'Low' | 'Medium' | 'High';
}) {
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<[number, number] | null>(null);
    const [places, setPlaces] = useState<Place[]>([]);

    if (!open) return null;

    const handleSearch = () => {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                setLocation([lat, lon]);
                await fetchNearby(lat, lon); // Calls our new cached API
                setLoading(false);
            },
            () => {
                alert('Location permission denied');
                setLoading(false);
            }
        );
    };

    /* 🏥 Updated to use our Internal API with Redis Caching */
    const fetchNearby = async (lat: number, lon: number) => {
        try {
            const res = await fetch('/api/nearby', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lon }),
            });

            if (!res.ok) throw new Error('Failed to fetch support locations');

            const data = await res.json();

            const formatted = data.elements.map((el: any) => ({
                id: el.id,
                lat: el.lat,
                lon: el.lon,
                name: el.tags?.name || 'Unnamed Support Center',
                type: el.tags?.amenity || el.tags?.healthcare || 'Medical Facility',
            }));

            setPlaces(formatted);
        } catch (error) {
            console.error("Search Error:", error);
            alert("Could not retrieve nearby locations. Please try again later.");
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-6xl min-h-[85vh] rounded-2xl bg-card border shadow-2xl p-6"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 opacity-70 hover:opacity-100"
                >
                    <X />
                </button>

                <h2 className="text-xl font-semibold">Nearby Mental Health Support</h2>

                <p className="text-sm text-muted-foreground mt-1">
                    {risk === 'High'
                        ? 'Nearby hospitals are recommended based on your recent activity.'
                        : 'Find psychiatrists and mental health support near you.'}
                </p>

                {!location && (
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
                        <Searchlocation size={250} />
                        <div className="max-w-md">
                            <h3 className="text-lg font-semibold">Find support near you</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                We’ll use your location to show nearby hospitals and mental health professionals.
                                Your location is cached briefly to speed up future searches.
                            </p>
                        </div>

                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="group relative flex items-center justify-center gap-3 mt-4 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest bg-primary text-primary-foreground transition-all duration-300 ease-in-out hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span className="animate-pulse">Finding nearby support...</span>
                                </>
                            ) : (
                                <>
                                    <span>Search near your area</span>
                                    <svg className="w-5 h-5 opacity-70 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {location && (
                    <div className="mt-6 h-[60vh] rounded-xl overflow-hidden">
                        <LeafletMap center={location} places={places} />
                    </div>
                )}
            </div>
        </div>
    );
}