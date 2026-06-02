import { useRef, useEffect, useState } from 'react';
import { COLORS } from './helpers';
import { useTheme } from '@/hooks/useTheme';

export default function LeafletMap({ lat, lng, radius, onMapClick }) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const circleRef = useRef(null);
    const tileLayerRef = useRef(null);
    const isClickRef = useRef(false);
    const [status, setStatus] = useState('loading');
    const { isDark } = useTheme();

    useEffect(() => {
        const loadLeaflet = () => {
            if (window.L) {
                setStatus('ready');
                return;
            }
            const existingScript = document.getElementById('leaflet-script');
            if (existingScript) {
                let attempts = 0;
                const checkL = setInterval(() => {
                    attempts++;
                    if (window.L) {
                        clearInterval(checkL);
                        setStatus('ready');
                    } else if (attempts > 50) { 
                        clearInterval(checkL);
                        setStatus('error');
                    }
                }, 100);
                return;
            }
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
            const script = document.createElement('script');
            script.id = 'leaflet-script';
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.async = true;
            script.onload = () => setStatus('ready');
            script.onerror = () => setStatus('error');
            document.body.appendChild(script);
        };
        loadLeaflet();
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (status !== 'ready' || !mapContainerRef.current || typeof lat !== 'number' || typeof lng !== 'number') return;
        const L = window.L;
        if (!L || !L.map) return;

        if (!mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapContainerRef.current, {
                center: [lat, lng],
                zoom: 13,
                attributionControl: false,
                zoomControl: true
            });
            const tileUrl = isDark 
                ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
            tileLayerRef.current = L.tileLayer(tileUrl, {
                maxZoom: 20
            }).addTo(mapInstanceRef.current);
        } else if (tileLayerRef.current) {
            const currentUrl = isDark 
                ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
            if (tileLayerRef.current._url !== currentUrl) {
                tileLayerRef.current.setUrl(currentUrl);
            }
        }

        if (!markerRef.current) {
            const customIcon = L.divIcon({
                className: 'custom-pin',
                html: `<div style="background-color: ${COLORS.primary}; width: 16px; height: 16px; border: 2px solid white; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });
            markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstanceRef.current);
        } else {
            markerRef.current.setLatLng([lat, lng]);
        }

        if (radius > 0) {
            if (!circleRef.current) {
                circleRef.current = L.circle([lat, lng], {
                    color: COLORS.primary,
                    fillColor: COLORS.primary,
                    fillOpacity: 0.2,
                    radius: radius,
                    weight: 2
                }).addTo(mapInstanceRef.current);
            } else {
                circleRef.current.setLatLng([lat, lng]);
                circleRef.current.setRadius(radius);
            }
        }
        
        if (!isClickRef.current) {
            mapInstanceRef.current.setView([lat, lng]);
        }
        isClickRef.current = false;
        setTimeout(() => mapInstanceRef.current?.invalidateSize(), 200);
    }, [status, lat, lng, radius, isDark]);

    useEffect(() => {
        if (mapInstanceRef.current && onMapClick) {
            mapInstanceRef.current.on('click', (e) => {
                isClickRef.current = true;
                onMapClick(e.latlng);
            });
        }
    }, [status, onMapClick]);

    return <div ref={mapContainerRef} className="w-full h-full z-0 outline-none" style={{ minHeight: '400px' }} />;
}
