'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import dynamic from 'next/dynamic';
import Searchlocation from '../lottie/Searchlocation';

/* ✅ Dynamically import the MAP COMPONENT (not hooks) */
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

    /* 📍 Get user location */
    const handleSearch = () => {
        setLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;

                setLocation([lat, lon]);
                await fetchNearby(lat, lon);
                setLoading(false);
            },
            () => {
                alert('Location permission denied');
                setLoading(false);
            }
        );
    };

    /* 🏥 Fetch nearby hospitals & psychiatrists */
    const fetchNearby = async (lat: number, lon: number) => {


        const query = `
    [out:json];
    (
      node["amenity"="hospital"](around:5000,${lat},${lon});
      node["healthcare"="psychiatrist"](around:5000,${lat},${lon});
      node["healthcare"="mental_health"](around:5000,${lat},${lon});
    );
    out;
  `;

        const res = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: query,
        });



        const data = await res.json();


        const formatted = data.elements.map((el: any) => ({
            id: el.id,
            lat: el.lat,
            lon: el.lon,
            name: el.tags?.name || 'Unnamed',
            type: el.tags?.amenity || el.tags?.healthcare || 'medical',
        }));

        setPlaces(formatted);
    };


    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="
  relative
  w-full
  max-w-6xl
  min-h-[85vh]
  rounded-2xl
  bg-card
  border
  shadow-2xl
  p-6
"

            >
                {/* ❌ Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 opacity-70 hover:opacity-100"
                >
                    <X />
                </button>

                <h2 className="text-xl font-semibold">
                    Nearby Mental Health Support
                </h2>

                <p className="text-sm text-muted-foreground mt-1">
                    {risk === 'High'
                        ? 'Nearby hospitals are recommended based on your recent activity.'
                        : 'Find psychiatrists and mental health support near you.'}
                </p>

                {!location && (
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">

                        <Searchlocation size={250} />

                        {/* 🧠 Text */}
                        <div className="max-w-md">
                            <h3 className="text-lg font-semibold">
                                Find support near you
                            </h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                We’ll use your location to show nearby hospitals and mental health professionals.
                                Your location is only used for this search.
                            </p>
                        </div>

                        {/* 🔘 CTA */}
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="
        mt-2
        px-7 py-3
        rounded-xl
        bg-primary
        text-primary-foreground
        font-medium
        transition
        hover:scale-[1.02]
        active:scale-[0.97]
        disabled:opacity-60
      "
                        >
                            {loading ? 'Finding nearby support…' : 'Search near your area'}
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
