'use client';

import { useEffect } from 'react';
import { userLocationIcon } from '@/lib/leafletIcons';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '@/lib/leafletFix';

type Place = {
    id: number;
    lat: number;
    lon: number;
    name: string;
    type: string;
};

/* 🔧 Fix map size inside modal */
function ResizeFix() {
    const map = useMap();

    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }, [map]);

    return null;
}

export default function LeafletMap({
    center,
    places,
}: {
    center: [number, number];
    places: Place[];
}) {
    return (
        <MapContainer
            center={center}
            zoom={13}
            className="h-full w-full"
        >
            <ResizeFix />

            <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* 📍 User */}
            <Marker position={center} icon={userLocationIcon}>
                <Popup>You are here</Popup>
            </Marker>


            {/* 🏥 Hospitals / Psychiatrists */}
            {places.map((p) => (
                <Marker key={p.id} position={[p.lat, p.lon]}>
                    <Popup>
                        <strong>{p.name}</strong>
                        <br />
                        {p.type}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
