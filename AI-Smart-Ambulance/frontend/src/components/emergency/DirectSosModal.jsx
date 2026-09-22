import React, { useState, useEffect, useRef } from "react";
import { useEmergency } from "../../context/EmergencyContext";
import {
  Siren,
  PhoneCall,
  MapPin,
  X,
  Volume2,
  VolumeX,
  AlertOctagon,
  ShieldAlert,
  Clock,
  ArrowRight,
} from "lucide-react";

// Web Audio API emergency siren synthesizer
class EmergencySoundPlayer {
  constructor() {
    this.audioCtx = null;
    this.oscillator = null;
    this.gainNode = null;
    this.intervalId = null;
    this.isPlaying = false;
  }

  start() {
    if (this.isPlaying) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.audioCtx = new AudioCtx();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      this.gainNode.connect(this.audioCtx.destination);

      this.oscillator = this.audioCtx.createOscillator();
      this.oscillator.type = "sine";
      this.oscillator.frequency.setValueAtTime(750, this.audioCtx.currentTime);
      this.oscillator.connect(this.gainNode);
      this.oscillator.start();
      this.isPlaying = true;

      // Modulate siren tone between 650Hz and 950Hz
      let high = true;
      this.intervalId = setInterval(() => {
        if (!this.oscillator || !this.audioCtx) return;
        const now = this.audioCtx.currentTime;
        const targetFreq = high ? 950 : 650;
        this.oscillator.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.25);
        high = !high;
      }, 350);
    } catch (err) {
      console.warn("AudioContext failed to initialize:", err);
    }
  }

  stop() {
    if (!this.isPlaying) return;
    if (this.intervalId) clearInterval(this.intervalId);
    try {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
      }
      if (this.audioCtx) {
        this.audioCtx.close();
      }
    } catch (_) {}
    this.isPlaying = false;
    this.oscillator = null;
    this.audioCtx = null;
  }
}

export default function DirectSosModal({ isOpen, onClose }) {
  const { triggerCitizenEmergency, setCurrentRole, userLocation, reverseGeocode } = useEmergency();

  const [countdown, setCountdown] = useState(3);
  const [isMuted, setIsMuted] = useState(false);
  const [coords, setCoords] = useState({
    lat: userLocation?.lat || 20.2961,
    lng: userLocation?.lng || 85.8245,
  });
  const [addressText, setAddressText] = useState(userLocation?.address || "Bhubaneswar, Odisha");
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const soundPlayerRef = useRef(null);

  // Initialize sound player instance
  useEffect(() => {
    soundPlayerRef.current = new EmergencySoundPlayer();
    return () => {
      soundPlayerRef.current?.stop();
    };
  }, []);

  // When modal opens, acquire GPS and start audio + countdown
  useEffect(() => {
    if (!isOpen) {
      soundPlayerRef.current?.stop();
      return;
    }

    setCountdown(3);
    setIsTransmitting(false);
    setIsComplete(false);

    // Initial sync with active userLocation
    if (userLocation) {
      setCoords({ lat: userLocation.lat, lng: userLocation.lng });
      setAddressText(userLocation.address || "Active Location Pinpoint");
    }

    if (!isMuted) {
      soundPlayerRef.current?.start();
    }

    // High accuracy Geolocation detection
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(4));
          const lng = parseFloat(pos.coords.longitude.toFixed(4));
          setCoords({ lat, lng });
          const addr = await reverseGeocode(lat, lng);
          setAddressText(addr || "Exact Live GPS Acquired");
        },
        () => {
          setCoords({
            lat: userLocation?.lat || 20.2961,
            lng: userLocation?.lng || 85.8245,
          });
          setAddressText(userLocation?.address || "Bhubaneswar, Odisha");
        },
        { enableHighAccuracy: true, timeout: 4000 }
      );
    }

    // 3-second countdown interval
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          executeSosDispatch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      soundPlayerRef.current?.stop();
    };
  }, [isOpen, isMuted]);

  const toggleSound = () => {
    if (isMuted) {
      soundPlayerRef.current?.start();
      setIsMuted(false);
    } else {
      soundPlayerRef.current?.stop();
      setIsMuted(true);
    }
  };

  const executeSosDispatch = async () => {
    setIsTransmitting(true);
    soundPlayerRef.current?.stop();

    try {
      await triggerCitizenEmergency({
        caller_name: "DIRECT 1-TAP SOS CITIZEN",
        caller_phone: "+91 99999 10800",
        emergency_type: "CRITICAL 1-TAP DIRECT SOS BEACON",
        severity: "CRITICAL",
        latitude: coords.lat,
        longitude: coords.lng,
      });

      setIsComplete(true);
      setCurrentRole("TRACKING");

      // Auto close modal and display live Ambulance Tracking
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Direct SOS dispatch error:", err);
      setIsTransmitting(false);
    }
  };

  const handleManualTriggerNow = () => {
    executeSosDispatch();
  };

  if (!isOpen) return null;

  return (
    <div className="sos-modal-overlay">
      <div className="sos-modal-card">
        {/* Header with Mute & Close */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="status-dot" style={{ background: "#ef4444" }}></span>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#f87171", letterSpacing: "0.08em" }}>
              HIGH PRIORITY DIRECT SOS
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button
              onClick={toggleSound}
              className="btn btn-outline"
              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
              title={isMuted ? "Unmute Siren Sound" : "Mute Siren Sound"}
            >
              {isMuted ? <VolumeX size={15} color="#ef4444" /> : <Volume2 size={15} color="#34d399" />}
            </button>
            <button
              onClick={onClose}
              className="btn btn-outline"
              style={{ padding: "0.3rem 0.6rem" }}
              title="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Big Alert Banner & Siren Icon */}
        <div style={{ textAlign: "center", margin: "1.25rem 0 1rem" }}>
          <div className="sos-siren-orb">
            <Siren size={44} color="#ffffff" />
          </div>

          <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#f8fafc", margin: "0.75rem 0 0.25rem" }}>
            {isComplete
              ? "🚨 SOS TRANSMITTED — AMBULANCE REROUTED!"
              : isTransmitting
              ? "TRANSMITTING TO CENTRAL FLEET..."
              : `BROADCASTING RESCUE SIGNAL IN ${countdown}s`}
          </h2>

          <p style={{ color: "#cbd5e1", fontSize: "0.85rem", maxWidth: "420px", margin: "0 auto" }}>
            {isComplete
              ? "Nearest ICU ambulance dispatched to your coordinates. Screen switching to live tracker."
              : "Emergency units are being pre-notified. If this was pressed by mistake, tap Cancel below."}
          </p>
        </div>

        {/* Countdown Ring / Progress */}
        {!isTransmitting && !isComplete && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
            <div className="sos-countdown-circle">
              <span className="sos-countdown-number">{countdown}</span>
              <span style={{ fontSize: "0.65rem", color: "#94a3b8", textTransform: "uppercase" }}>Seconds</span>
            </div>
          </div>
        )}

        {/* GPS Coordinates Bar */}
        <div className="sos-location-strip">
          <MapPin size={16} color="#06b6d4" />
          <div style={{ flex: 1, fontSize: "0.8rem" }}>
            <span style={{ color: "#94a3b8" }}>Target Coordinates: </span>
            <strong style={{ color: "#38bdf8", fontFamily: "var(--font-mono)" }}>
              {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </strong>
            <span style={{ display: "block", fontSize: "0.72rem", color: "#64748b" }}>
              {addressText}
            </span>
          </div>
        </div>

        {/* Action Buttons: Cancel vs Transmit Now */}
        {!isComplete && (
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <button
              onClick={onClose}
              className="btn btn-outline"
              style={{ flex: 1, padding: "0.85rem", borderColor: "rgba(239,68,68,0.4)", color: "#f87171" }}
            >
              <X size={16} />
              CANCEL / FALSE ALARM
            </button>

            <button
              onClick={handleManualTriggerNow}
              disabled={isTransmitting}
              className="btn btn-danger"
              style={{ flex: 1.2, padding: "0.85rem", fontWeight: "800" }}
            >
              <ArrowRight size={16} />
              {isTransmitting ? "TRANSMITTING..." : "TRANSMIT IMMEDIATELY"}
            </button>
          </div>
        )}

        {/* Direct National Emergency Dialers */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
          <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "600", marginBottom: "0.6rem", textTransform: "uppercase" }}>
            Direct National Emergency Hotlines (Tap to Call):
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
            <a
              href="tel:108"
              className="sos-hotline-chip"
              title="Call 108 Emergency Ambulance"
            >
              <PhoneCall size={14} color="#10b981" />
              <div>
                <strong style={{ display: "block", fontSize: "1rem", color: "#34d399" }}>108</strong>
                <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Ambulance</span>
              </div>
            </a>

            <a
              href="tel:112"
              className="sos-hotline-chip"
              title="Call 112 All-in-One Emergency"
            >
              <ShieldAlert size={14} color="#38bdf8" />
              <div>
                <strong style={{ display: "block", fontSize: "1rem", color: "#38bdf8" }}>112</strong>
                <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>National SOS</span>
              </div>
            </a>

            <a
              href="tel:102"
              className="sos-hotline-chip"
              title="Call 102 Maternal/Child Emergency"
            >
              <AlertOctagon size={14} color="#fbbf24" />
              <div>
                <strong style={{ display: "block", fontSize: "1rem", color: "#fbbf24" }}>102</strong>
                <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Maternal/Baby</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
