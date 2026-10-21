import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Home,
  Settings,
  Check,
  CheckCircle2,
  Calendar,
  Clock,
  Package,
  Info,
  Soup,
  Shirt,
  BookOpen,
  Box,
  X,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  MapPin,
  RefreshCw,
  ChevronDown,
  Camera,
  CameraOff,
  AlertCircle
} from 'lucide-react';
import jsQR from 'jsqr';
import { JanaSevaLogo } from '@janaseva/ui';
import '../styles/hub.css';

// Environment-driven API base URL resolution
const API_BASE_URL = (import.meta.env?.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

// Live JanaSeva Hub Locations - loaded dynamically from authoritative MongoDB backend
const JANASEVA_HUBS = [];

export function HubKioskShell() {
  // Navigation / Screen state:
  const [currentScreen, setCurrentScreen] = useState('scan');

  // Mode: 'donate' | 'collect'
  const [activeMode, setActiveMode] = useState('donate');

  // Active JanaSeva Hub Location Selection
  const [selectedHubId, setSelectedHubId] = useState('HUB-04');
  const [isHubDropdownOpen, setIsHubDropdownOpen] = useState(false);
  const [dbHubs, setDbHubs] = useState([]);
  const [scanVerifying, setScanVerifying] = useState(false);
  const [scanError, setScanError] = useState(null);

  // Step 9: Reservation Collection & Kiosk Session States
  const [verifiedReservation, setVerifiedReservation] = useState(null);
  const [collectionReceipt, setCollectionReceipt] = useState(null);
  const [isSubmittingCollection, setIsSubmittingCollection] = useState(false);
  const [manualReservationInput, setManualReservationInput] = useState('');
  const [sessionCountdown, setSessionCountdown] = useState(45);

  // Per-Hub LIVE INVENTORY RECORD from MongoDB
  const [hubInventories, setHubInventories] = useState({});

  // 1. Fetch live hubs from backend
  useEffect(() => {
    async function loadHubs() {
      try {
        const res = await fetch(`${API_BASE_URL}/hubs`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.hubs && json.data.hubs.length > 0) {
            setDbHubs(json.data.hubs);
            setSelectedHubId(json.data.hubs[0].hubId);
          }
        }
      } catch (err) {
        console.warn('Backend hubs fetch notice:', err);
      }
    }
    loadHubs();
  }, []);

  // 2. Fetch live inventory for selected hub
  useEffect(() => {
    async function loadHubInventory() {
      if (!selectedHubId) return;
      try {
        const hubCode = selectedHubId.toUpperCase();
        const res = await fetch(`${API_BASE_URL}/hubs/${hubCode}/inventory`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.items) {
            let food = 0;
            let cloth = 0;
            let books = 0;
            let other = 0;
            json.data.items.forEach((item) => {
              const cat = (item.category || '').toLowerCase();
              if (cat === 'food') food += (item.qtyAvailable || 0);
              else if (cat === 'clothing' || cat === 'cloth') cloth += (item.qtyAvailable || 0);
              else if (cat === 'books') books += (item.qtyAvailable || 0);
              else other += (item.qtyAvailable || 0);
            });
            setHubInventories((prev) => ({
              ...prev,
              [selectedHubId]: { food, cloth, books, other }
            }));
          }
        }
      } catch (err) {
        console.warn('Backend inventory fetch notice:', err);
      }
    }
    loadHubInventory();

    let unsubscribe = null;
    import('../services/socket').then(({ subscribeToHubInventory }) => {
      unsubscribe = subscribeToHubInventory(selectedHubId, () => {
        loadHubInventory();
      });
    }).catch(() => {});

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedHubId]);

  const activeHubList = dbHubs.map((h) => ({
    id: h.hubId,
    hubId: h.hubId,
    name: h.name,
    fullName: h.name,
    area: h.locality || h.name.split(' ')[0],
    address: `${h.address}, ${h.locality}`,
    terminal: `TK-0${(h.hubId.replace(/\D/g, '') || '1')}`,
    inventory: hubInventories[h.hubId] || { food: 0, cloth: 0, books: 0, other: 0 }
  }));

  const currentHub = activeHubList.find((h) => h.id === selectedHubId || h.hubId === selectedHubId) || activeHubList[0] || null;
  const inventory = (selectedHubId && hubInventories[selectedHubId]) || currentHub?.inventory || { food: 0, cloth: 0, books: 0, other: 0 };

  // Recent inventory delta feedback indicator
  const [lastDelta, setLastDelta] = useState(null);

  // Dynamic Collection Selection states (Driven by real Hub inventory)
  const [collectionItems, setCollectionItems] = useState({
    food: { selected: true, quantity: 30, unit: 'packets' },
    cloth: { selected: false, quantity: 20, unit: 'sets' },
    books: { selected: false, quantity: 10, unit: 'books' },
    other: { selected: false, quantity: 5, unit: 'items' }
  });
  const [collectedSummary, setCollectedSummary] = useState([]);

  // Verified User profile from backend
  const [verifiedUser, setVerifiedUser] = useState({
    name: 'Verified Volunteer',
    id: 'V-10928',
    level: 'Verified Volunteer'
  });

  // Donation form data states
  const [foodData, setFoodData] = useState({
    packingTime: 'Today, 12:30 PM',
    maxTimeToEat: 'Within 4 hours (Recommended)',
    quantity: 1
  });
  const [clothData, setClothData] = useState({ quantity: 1 });
  const [booksData, setBooksData] = useState({ quantity: 1 });
  const [otherData, setOtherData] = useState({ quantity: 1 });

  // Settings modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Optical Camera Scanner Refs & States (Direct Camera + Manual Code Entry ONLY)
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameId = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [verifiedDecision, setVerifiedDecision] = useState(null);
  const [manualPassInput, setManualPassInput] = useState('');

  // Audio chime feedback synthesizer using Web Audio API
  const playChime = (type = 'success') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      if (type === 'success') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);
      } else {
        osc.frequency.setValueAtTime(280, ctx.currentTime);
        osc.frequency.setValueAtTime(160, ctx.currentTime + 0.1);
      }
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // silent
    }
  };

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const scanVideoFrame = () => {
    if (!videoRef.current || videoRef.current.readyState < 2) {
      animationFrameId.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    const video = videoRef.current;
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvasRef.current = canvas;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data && code.data.trim()) {
        const raw = code.data.trim();
        if (raw.startsWith('{') || raw.startsWith('JS-RES:') || raw.startsWith('RES-')) {
          handleVerifyReservationPass(raw);
        } else {
          handleVerifyQr(raw);
        }
        return;
      }
    }

    animationFrameId.current = requestAnimationFrame(scanVideoFrame);
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      setScanError(null);
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      } catch (e) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
      setCameraActive(true);
      animationFrameId.current = requestAnimationFrame(scanVideoFrame);
    } catch (err) {
      console.warn('Camera start error:', err);
      setCameraActive(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in browser settings or enter Volunteer Pass ID manually.'
          : 'Camera hardware is unavailable. Please enter Volunteer Pass ID manually below.'
      );
    }
  };

  const handleVerifyQr = async (passCode) => {
    stopCamera();
    setScanVerifying(true);
    setScanError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-qr-identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrPayload: passCode.trim() })
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.data?.isEligibleForOperations) {
        playChime('success');
        const userObj = {
          name: json.data.name || 'Verified Volunteer',
          id: json.data.volunteerId || passCode,
          level: 'Active Verified Volunteer',
          status: json.data.status || 'active',
          isEligibleForOperations: true
        };
        setVerifiedUser(userObj);

        // Check for any active reservation for this volunteer at the current hub
        let foundRes = null;
        try {
          const resCheck = await fetch(`${API_BASE_URL}/hubs/${selectedHubId}/collection-sessions/active/${userObj.id}`);
          if (resCheck.ok) {
            const resJson = await resCheck.json();
            if (resJson?.data?.reservation) {
              foundRes = resJson.data.reservation;
              setVerifiedReservation(foundRes);
            }
          }
        } catch (e) {
          // ignore lookup failure
        }

        setVerifiedDecision({
          user: userObj,
          reservation: foundRes,
          statusMessage: json.data.statusMessage || 'Volunteer identity verified and eligible for Hub transactions.'
        });
      } else {
        playChime('error');
        const errMsg = json?.error?.message || json?.data?.statusMessage || 'Verification failed. Volunteer pass is invalid, expired, or suspended.';
        setScanError(errMsg);
      }
    } catch (err) {
      console.warn('QR verification network notice:', err);
      playChime('error');
      setScanError('Unable to connect to verification server. Please verify backend connection.');
    } finally {
      setScanVerifying(false);
    }
  };

  // Step 9: Authoritatively verify scanned/entered reservation pass
  const handleVerifyReservationPass = async (passCode) => {
    stopCamera();
    setScanVerifying(true);
    setScanError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/hubs/${selectedHubId}/collection-sessions/verify-pass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passPayload: passCode.trim(),
          volunteerId: verifiedUser?.id && verifiedUser.id.startsWith('V-') ? verifiedUser.id : undefined
        })
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.success && json?.data) {
        playChime('success');
        setVerifiedReservation(json.data);
        setCurrentScreen('collection_verify');
      } else {
        playChime('error');
        const errMsg = json?.error?.message || 'Verification failed. Reservation pass is invalid, expired, or belongs to another Hub.';
        setScanError(errMsg);
      }
    } catch (err) {
      console.warn('Reservation pass verification network notice:', err);
      playChime('error');
      setScanError('Unable to connect to verification server. Please verify backend connection.');
    } finally {
      setScanVerifying(false);
    }
  };

  // Step 9: Confirm physical handover and record collection safely
  const handleConfirmReservationCollection = async () => {
    if (isSubmittingCollection || !verifiedReservation) return;
    setIsSubmittingCollection(true);
    setScanError(null);

    const idempotencyKey = `KIOSK-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey
      };
      if (verifiedReservation?.collectionToken) {
        headers['Authorization'] = `Bearer ${verifiedReservation.collectionToken}`;
      }

      const res = await fetch(`${API_BASE_URL}/hubs/${selectedHubId}/collection-sessions/confirm`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          reservationId: verifiedReservation.reservationId,
          volunteerId: verifiedReservation.volunteerId,
          collectionToken: verifiedReservation.collectionToken,
          idempotencyKey
        })
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.success && json?.data) {
        playChime('success');
        setCollectionReceipt(json.data.receipt || json.data);
        setCurrentScreen('collection_thankyou');
        // Refresh live inventory ticker
        try {
          const invRes = await fetch(`${API_BASE_URL}/hubs/${selectedHubId}/inventory`);
          if (invRes.ok) {
            const invJson = await invRes.json();
            if (invJson.data && invJson.data.items) {
              let food = 0, cloth = 0, books = 0, other = 0;
              invJson.data.items.forEach((item) => {
                const cat = (item.category || '').toLowerCase();
                if (cat === 'food') food += (item.qtyAvailable || 0);
                else if (cat === 'clothing' || cat === 'cloth') cloth += (item.qtyAvailable || 0);
                else if (cat === 'books') books += (item.qtyAvailable || 0);
                else other += (item.qtyAvailable || 0);
              });
              setHubInventories((prev) => ({
                ...prev,
                [selectedHubId]: { food, cloth, books, other }
              }));
            }
          }
        } catch (e) {
          // ignore
        }
      } else {
        playChime('error');
        const errMsg = json?.error?.message || 'Collection confirmation failed. Please try again.';
        setScanError(errMsg);
      }
    } catch (err) {
      console.warn('Collection confirmation network notice:', err);
      playChime('error');
      setScanError('Network error confirming collection. Please try again.');
    } finally {
      setIsSubmittingCollection(false);
    }
  };

  const handleChooseAction = async (mode) => {
    setActiveMode(mode);
    setScanError(null);
    if (mode === 'collect') {
      if (verifiedReservation) {
        setCurrentScreen('collection_verify');
        return;
      }
      try {
        setScanVerifying(true);
        const res = await fetch(`${API_BASE_URL}/hubs/${selectedHubId}/collection-sessions/active/${verifiedUser?.id}`);
        const json = await res.json().catch(() => null);
        if (res.ok && json?.data?.reservation) {
          playChime('success');
          setVerifiedReservation(json.data.reservation);
          setCurrentScreen('collection_verify');
        } else {
          playChime('error');
          setScanError(`No active reservations found for ${verifiedUser?.name || 'this volunteer'} at ${currentHub?.name || selectedHubId}. You can donate resources directly.`);
        }
      } catch (err) {
        setScanError('Unable to check reservations. Please try again.');
      } finally {
        setScanVerifying(false);
      }
    } else {
      setCurrentScreen('options');
    }
  };

  const handleSimulateScan = async (mode = 'donate', passCode = 'V-ADMIN01') => {
    setActiveMode(mode);
    await handleVerifyQr(passCode);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Kiosk Session Safety: 45-Second Inactivity Auto-Reset
  useEffect(() => {
    if (currentScreen === 'scan' && !verifiedDecision && !verifiedReservation) {
      setSessionCountdown(45);
      return;
    }

    setSessionCountdown(45);

    const interval = setInterval(() => {
      setSessionCountdown((prev) => {
        if (prev <= 1) {
          handleResetHome();
          return 45;
        }
        return prev - 1;
      });
    }, 1000);

    const handleUserActivity = () => {
      setSessionCountdown(45);
    };

    window.addEventListener('click', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, [currentScreen, verifiedDecision, verifiedReservation]);

  const handleResetHome = () => {
    stopCamera();
    setVerifiedDecision(null);
    setVerifiedReservation(null);
    setCollectionReceipt(null);
    setScanError(null);
    setManualPassInput('');
    setManualReservationInput('');
    setIsSubmittingCollection(false);
    setSessionCountdown(45);
    setCurrentScreen('scan');
  };

  const handleBack = () => {
    if (
      currentScreen === 'food_details' ||
      currentScreen === 'cloth_details' ||
      currentScreen === 'books_details' ||
      currentScreen === 'other_details'
    ) {
      setCurrentScreen('options');
    } else if (
      currentScreen === 'food_thankyou' ||
      currentScreen === 'cloth_thankyou' ||
      currentScreen === 'books_thankyou' ||
      currentScreen === 'other_thankyou'
    ) {
      setCurrentScreen('options');
    } else if (currentScreen === 'options') {
      setCurrentScreen('scan');
    } else if (currentScreen === 'collection_verify') {
      setCurrentScreen('scan');
    } else if (currentScreen === 'collection_thankyou') {
      handleResetHome();
    }
  };

  // DONATE: Increase quantity in MongoDB & update Volunteer contribution record
  const handleDonationSubmit = async (category, qty) => {
    const amount = Number(qty) || 1;
    const unit = category === 'food' ? 'packets' : category === 'cloth' ? 'sets' : category === 'books' ? 'books' : 'items';
    
    // Update local state immediately
    setHubInventories((prev) => ({
      ...prev,
      [selectedHubId]: {
        ...prev[selectedHubId],
        [category]: (prev[selectedHubId]?.[category] ?? 0) + amount
      }
    }));
    setLastDelta({ type: 'increase', category, amount });

    if (category === 'food') setCurrentScreen('food_thankyou');
    else if (category === 'cloth') setCurrentScreen('cloth_thankyou');
    else if (category === 'books') setCurrentScreen('books_thankyou');
    else if (category === 'other') setCurrentScreen('other_thankyou');

    // Persist donation intake to MongoDB and update Volunteer activity ledger
    try {
      await fetch(`${API_BASE_URL}/hubs/${selectedHubId}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId: verifiedUser?.id || 'V-ADMIN01',
          category,
          quantity: amount,
          unit,
          itemDescription: `${amount} ${unit} of ${category} contributed at Hub`,
          details: category === 'food' ? foodData : null
        })
      });
    } catch (e) {
      console.warn('Backend donation intake sync notice:', e);
    }
  };

  return (
    <div className="hub-webapp-layout">
      {/* ========================================================
          1. FULL-WIDTH WEB APPLICATION TOP NAVBAR
          With Live Inventory Ticker & Hub Node Information
          ======================================================== */}
      <header className="hub-webapp-navbar">
        {/* Brand Section: Only Application Logo and JanaSeva */}
        <div className="hub-brand-section">
          <JanaSevaLogo size={36} showTagline={false} />

          {/* JanaSeva Hub Dropdown Switcher */}
          <div className="hub-dropdown-container">
            <button
              id="hub-dropdown-switcher-btn"
              type="button"
              onClick={() => setIsHubDropdownOpen((prev) => !prev)}
              className="hub-dropdown-btn"
              title="Switch JanaSeva Hub Location"
              aria-haspopup="true"
              aria-expanded={isHubDropdownOpen}
            >
              <div className="hub-dropdown-badge">Hub</div>
              <div className="hub-dropdown-selected-info">
                <span className="hub-dropdown-name">{currentHub ? currentHub.area : 'No Hubs'}</span>
                <span className="hub-dropdown-sub">{currentHub ? currentHub.terminal : 'Standby'}</span>
              </div>
              <ChevronDown
                size={16}
                className={`hub-dropdown-chevron ${isHubDropdownOpen ? 'rotated' : ''}`}
              />
            </button>

            {isHubDropdownOpen && (
              <>
                <div
                  className="hub-dropdown-backdrop"
                  onClick={() => setIsHubDropdownOpen(false)}
                />
                <div className="hub-dropdown-menu">
                  <div className="hub-dropdown-menu-header">
                    <span className="hub-dropdown-menu-title">Switch JanaSeva Hub</span>
                    <span className="hub-dropdown-count">{activeHubList.length} Locations</span>
                  </div>
                  <div className="hub-dropdown-items-list">
                    {activeHubList.length === 0 ? (
                      <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                        No JanaSeva Hubs registered yet. Please create a Hub in the Admin Portal.
                      </div>
                    ) : (
                      activeHubList.map((hub) => {
                      const isSelected = hub.id === selectedHubId;
                      const hubStock = hubInventories[hub.id] || hub.inventory;
                      const totalItems = hubStock.food + hubStock.cloth + hubStock.books + hubStock.other;
                      return (
                        <button
                          key={hub.id}
                          id={`hub-option-${hub.id}`}
                          type="button"
                          className={`hub-dropdown-option ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedHubId(hub.id);
                            setIsHubDropdownOpen(false);
                          }}
                        >
                          <div className={`hub-option-icon ${isSelected ? 'active' : ''}`}>
                            <MapPin size={16} />
                          </div>
                          <div className="hub-option-content">
                            <div className="hub-option-row-1">
                              <span className="hub-option-name">{hub.fullName}</span>
                              <span className="hub-option-terminal">{hub.terminal}</span>
                            </div>
                            <div className="hub-option-row-2">
                              <span className="hub-option-address">{hub.address}</span>
                              <span className="hub-option-stock">{totalItems} items live</span>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="hub-option-check">
                              <Check size={16} />
                            </div>
                          )}
                        </button>
                      );
                    }))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Real-time Live Inventory Ticker (Food: 24, Cloth: 45, Books: 100, Other: 37) */}
        <div className="hub-inventory-ticker" title="Authoritative Live Hub Inventory">
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', marginRight: '4px' }}>
            Live Stock:
          </span>

          <span className="hub-ticker-badge food">
            <Soup size={14} />
            <span>Food: {inventory.food}</span>
          </span>

          <span className="hub-ticker-badge cloth">
            <Shirt size={14} />
            <span>Cloth: {inventory.cloth}</span>
          </span>

          <span className="hub-ticker-badge books">
            <BookOpen size={14} />
            <span>Books: {inventory.books}</span>
          </span>

          <span className="hub-ticker-badge other">
            <Box size={14} />
            <span>Other: {inventory.other}</span>
          </span>
        </div>

        {/* Right Navigation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {(currentScreen !== 'scan' || verifiedDecision || verifiedReservation) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: sessionCountdown <= 10 ? '#FEF2F2' : '#F1F5F9',
                color: sessionCountdown <= 10 ? '#DC2626' : '#475569',
                border: sessionCountdown <= 10 ? '1px solid #FECACA' : '1px solid #E2E8F0',
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700
              }}
              title="Kiosk session auto-resets on inactivity"
            >
              <Clock size={13} color={sessionCountdown <= 10 ? '#DC2626' : '#0284C7'} />
              <span>Session: {sessionCountdown}s</span>
            </div>
          )}

          {currentScreen !== 'scan' && (
            <button
              onClick={handleResetHome}
              className="hub-nav-btn"
              title="Return to Welcome Screen"
            >
              <Home size={16} />
              <span>Exit</span>
            </button>
          )}

          <button
            onClick={() => setShowSettingsModal(true)}
            className="hub-nav-btn"
            title="Terminal Settings & Diagnostics"
          >
            <Settings size={16} />
            <span>Terminal</span>
          </button>
        </div>
      </header>

      {/* ========================================================
          2. MAIN WEB APPLICATION WORKSPACE
          ======================================================== */}
      <main className="hub-webapp-main">
        <div className="hub-workspace-card">
          {/* Breadcrumb / Top Bar in Workspace */}
          {currentScreen !== 'scan' && (
            <div className="hub-screen-header">
              <button onClick={handleBack} className="hub-nav-btn">
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981'
                  }}
                />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                  Session Active • {verifiedUser.name} ({verifiedUser.id})
                </span>
              </div>
            </div>
          )}

          {/* ========================================================
              SCREEN 1: Scan QR Code & Web App Mode Selector
              ======================================================== */}
          {currentScreen === 'scan' && (
            <div>
              {/* Top Banner Header */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1F2937', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                  Welcome to JanaSeva Hub Terminal
                </h1>
                <p style={{ fontSize: '15px', color: '#64748B', margin: 0 }}>
                  Self-service community intake and distribution point. Scan your pass or enter your Volunteer Pass ID.
                </p>
              </div>

              {scanError && (
                <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>⚠️ {scanError}</span>
                  <button type="button" onClick={() => setScanError(null)} style={{ background: 'none', border: 'none', color: '#B91C1C', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                </div>
              )}

              {scanVerifying && (
                <div style={{ backgroundColor: '#E0F2FE', border: '1px solid #BAE6FD', color: '#0369A1', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Verifying volunteer identity with authoritative backend...</span>
                </div>
              )}

              {/* Verified Volunteer Decision Panel (When valid QR code is scanned) */}
              {verifiedDecision ? (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '24px',
                    border: '2px solid #10B981',
                    padding: '32px',
                    maxWidth: '720px',
                    margin: '0 auto 24px',
                    boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.15)',
                    textAlign: 'center'
                  }}
                >
                  <div
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      backgroundColor: '#ECFDF5',
                      color: '#059669',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      border: '2px solid #A7F3D0'
                    }}
                  >
                    <ShieldCheck size={38} />
                  </div>

                  <div style={{ display: 'inline-block', backgroundColor: '#D1FAE5', color: '#065F46', fontSize: '12px', fontWeight: 800, padding: '4px 14px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                    Identity Authoritatively Verified ✓
                  </div>

                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', margin: '0 0 4px 0' }}>
                    {verifiedDecision.user.name}
                  </h2>
                  <div style={{ fontSize: '13px', color: '#4B5563', marginBottom: '24px' }}>
                    Pass ID: <strong>{verifiedDecision.user.id}</strong> • Status: <span style={{ color: '#059669', fontWeight: 700 }}>Eligible</span>
                  </div>

                  <p style={{ fontSize: '14.5px', color: '#374151', fontWeight: 600, marginBottom: '20px' }}>
                    Select your operation to proceed:
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    {/* Action 1: Donate */}
                    <div
                      id="proceed-donate-card"
                      onClick={() => handleChooseAction('donate')}
                      style={{
                        padding: '24px 20px',
                        borderRadius: '16px',
                        border: '2px solid #1668E8',
                        backgroundColor: '#EFF6FF',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(22, 104, 232, 0.08)'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#DBEAFE', color: '#1668E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TrendingUp size={22} />
                        </div>
                        <div style={{ fontSize: '17px', fontWeight: 800, color: '#1E3A8A' }}>
                          1. Donate Resources
                        </div>
                      </div>
                      <p style={{ fontSize: '12.5px', color: '#4B5563', margin: '0 0 16px 0' }}>
                        Deposit food, clothing, books or essentials (+ increases stock)
                      </p>
                      <button className="hub-btn-primary" style={{ width: '100%', padding: '10px 16px', fontSize: '13px' }}>
                        Proceed to Donate →
                      </button>
                    </div>

                    {/* Action 2: Collect */}
                    <div
                      id="proceed-collect-card"
                      onClick={() => handleChooseAction('collect')}
                      style={{
                        padding: '24px 20px',
                        borderRadius: '16px',
                        border: '2px solid #0284C7',
                        backgroundColor: '#F0F9FF',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TrendingDown size={22} />
                        </div>
                        <div style={{ fontSize: '17px', fontWeight: 800, color: '#075985' }}>
                          2. Collect Items
                        </div>
                      </div>
                      <p style={{ fontSize: '12.5px', color: '#4B5563', margin: '0 0 16px 0' }}>
                        {verifiedDecision.reservation
                          ? `Allocation ready: ${verifiedDecision.reservation.itemDescription} (${verifiedDecision.reservation.quantity} ${verifiedDecision.reservation.unit})`
                          : 'Pick up verified reserved allocations at this hub directly'}
                      </p>
                      <button className="hub-btn-secondary" style={{ width: '100%', padding: '10px 16px', fontSize: '13px' }}>
                        {verifiedDecision.reservation ? 'Proceed to Handover →' : 'Collect Reserved Items →'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setVerifiedDecision(null); setManualPassInput(''); }}
                    style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '12.5px', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Scan a different volunteer pass
                  </button>
                </div>
              ) : (
                /* Centered Scanner & Manual Pass Entry View */
                <div style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'center', padding: '12px' }}>
                  <div
                    className="hub-scan-box"
                    style={{ position: 'relative' }}
                  >
                    <div className="hub-scan-corner top-left" />
                    <div className="hub-scan-corner top-right" />
                    <div className="hub-scan-corner bottom-left" />
                    <div className="hub-scan-corner bottom-right" />
                    <div className="hub-scan-laser-line" />

                    {/* Video element is permanently mounted to attach camera stream reliably */}
                    <video
                      ref={videoRef}
                      playsInline
                      autoPlay
                      muted
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '28px',
                        display: cameraActive ? 'block' : 'none'
                      }}
                    />

                    {!cameraActive && (
                      <div
                        onClick={startCamera}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: '20px'
                        }}
                        title="Click to activate camera scanner"
                      >
                        <Camera size={56} color="#38BDF8" style={{ marginBottom: '12px' }} />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#E2E8F0' }}>
                          Click to Open Camera
                        </span>
                        <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                          Hold volunteer QR pass in front of lens
                        </span>
                      </div>
                    )}
                  </div>

                  {cameraError && (
                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#DC2626', backgroundColor: '#FEF2F2', padding: '8px 12px', borderRadius: '8px', border: '1px solid #FECACA' }}>
                      {cameraError}
                    </div>
                  )}

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', margin: '20px 0 6px' }}>
                    Scan User QR Code
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '0 auto 16px', maxWidth: '320px' }}>
                    Scan your volunteer QR pass with the camera scanner, or enter your Volunteer Pass ID manually below.
                  </p>

                  {/* Camera Control Button (Start / Stop) */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
                    {cameraActive ? (
                      <button
                        type="button"
                        onClick={stopCamera}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '9px 18px',
                          backgroundColor: '#FEF2F2',
                          color: '#DC2626',
                          border: '1px solid #FECACA',
                          borderRadius: '10px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <CameraOff size={15} /> Stop Camera
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startCamera}
                        className="hub-btn-primary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '9px 20px',
                          fontSize: '13px',
                          width: 'auto'
                        }}
                      >
                        <Camera size={15} /> Start Camera Scanner
                      </button>
                    )}
                  </div>

                  {/* Clean & Prominent Manual Entry */}
                  <div style={{ maxWidth: '360px', margin: '0 auto' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', marginBottom: '6px', textAlign: 'left', textTransform: 'uppercase' }}>
                      Enter Volunteer Pass ID:
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        id="manual-volunteer-input"
                        type="text"
                        placeholder="e.g. V-ADMIN01"
                        value={manualPassInput}
                        onChange={(e) => setManualPassInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && manualPassInput.trim()) handleVerifyQr(manualPassInput);
                        }}
                        style={{
                          flex: 1,
                          padding: '9px 12px',
                          borderRadius: '10px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '13px',
                          fontWeight: 600,
                          outline: 'none'
                        }}
                      />
                      <button
                        id="verify-volunteer-btn"
                        type="button"
                        onClick={() => handleVerifyQr(manualPassInput)}
                        disabled={!manualPassInput.trim() || scanVerifying}
                        className="hub-btn-primary"
                        style={{ width: 'auto', padding: '9px 16px', fontSize: '13px' }}
                      >
                        {scanVerifying ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              SCREEN 2: Donate Options (Screen 2 from Showcase)
              ======================================================== */}
          {currentScreen === 'options' && (
            <div>
              {/* User Verified Status Banner */}
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <Check size={36} strokeWidth={3} />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', margin: '0 0 6px 0' }}>
                  User Verified
                </h2>
                <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                  Now select what you would like to donate.
                </p>
              </div>

              {/* 4 Category Cards in Web App Grid */}
              <div className="hub-categories-grid-web">
                {/* 1. FOOD */}
                <div
                  className="hub-category-card-web food"
                  onClick={() => setCurrentScreen('food_details')}
                >
                  <div
                    className="hub-category-icon-wrapper-web"
                    style={{ backgroundColor: '#FFEDD5', color: '#EA580C' }}
                  >
                    <Soup size={32} />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#C2410C', marginBottom: '4px' }}>
                    FOOD
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>
                    Provide nutritious meals
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: '#FFFFFF',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      color: '#EA580C',
                      border: '1px solid #FED7AA'
                    }}
                  >
                    In Stock: {inventory.food} pkts
                  </div>
                </div>

                {/* 2. CLOTH */}
                <div
                  className="hub-category-card-web cloth"
                  onClick={() => setCurrentScreen('cloth_details')}
                >
                  <div
                    className="hub-category-icon-wrapper-web"
                    style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}
                  >
                    <Shirt size={32} />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0369A1', marginBottom: '4px' }}>
                    CLOTH
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>
                    Give clothing for a better tomorrow
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: '#FFFFFF',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      color: '#0284C7',
                      border: '1px solid #BAE6FD'
                    }}
                  >
                    In Stock: {inventory.cloth} sets
                  </div>
                </div>

                {/* 3. BOOKS */}
                <div
                  className="hub-category-card-web books"
                  onClick={() => setCurrentScreen('books_details')}
                >
                  <div
                    className="hub-category-icon-wrapper-web"
                    style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}
                  >
                    <BookOpen size={32} />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#15803D', marginBottom: '4px' }}>
                    BOOKS
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>
                    Share knowledge and hope
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: '#FFFFFF',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      color: '#16A34A',
                      border: '1px solid #BBF7D0'
                    }}
                  >
                    In Stock: {inventory.books} books
                  </div>
                </div>

                {/* 4. OTHER */}
                <div
                  className="hub-category-card-web other"
                  onClick={() => setCurrentScreen('other_details')}
                >
                  <div
                    className="hub-category-icon-wrapper-web"
                    style={{ backgroundColor: '#F3E8FF', color: '#9333EA' }}
                  >
                    <Box size={32} />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#7E22CE', marginBottom: '4px' }}>
                    OTHER
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>
                    Other useful items
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: '#FFFFFF',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      color: '#9333EA',
                      border: '1px solid #E9D5FF'
                    }}
                  >
                    In Stock: {inventory.other} items
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              SCREEN 3: Food Donation Details
              ======================================================== */}
          {currentScreen === 'food_details' && (
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    backgroundColor: '#FFEDD5',
                    color: '#EA580C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Soup size={30} />
                </div>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1F2937', margin: '0 0 4px 0' }}>
                    Food Donation
                  </h2>
                  <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                    Please provide the following details for your donation.
                  </p>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid #E2E8F0',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}
              >
                {/* Packing Time */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Calendar size={18} color="#0284C7" />
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#1F2937' }}>Packing Time</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>
                    When was the food packed?
                  </div>
                  <input
                    type="text"
                    value={foodData.packingTime}
                    onChange={(e) => setFoodData({ ...foodData, packingTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      fontSize: '15px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Max Time to Eat */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Clock size={18} color="#0284C7" />
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#1F2937' }}>Max Time to Eat</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>
                    By when should it be consumed?
                  </div>
                  <select
                    value={foodData.maxTimeToEat}
                    onChange={(e) => setFoodData({ ...foodData, maxTimeToEat: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      fontSize: '15px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Within 4 hours (Recommended)">Within 4 hours (Recommended)</option>
                    <option value="Within 6 hours">Within 6 hours</option>
                    <option value="Today by 09:00 PM">Today by 09:00 PM</option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Package size={18} color="#0284C7" />
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#1F2937' }}>Quantity</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>
                    How many food packs/items? (Current stock: {inventory.food} pkts)
                  </div>
                  <div className="hub-stepper">
                    <button
                      type="button"
                      className="hub-step-btn"
                      onClick={() => setFoodData({ ...foodData, quantity: Math.max(1, foodData.quantity - 1) })}
                    >
                      —
                    </button>
                    <span className="hub-step-val">{foodData.quantity}</span>
                    <button
                      type="button"
                      className="hub-step-btn"
                      onClick={() => setFoodData({ ...foodData, quantity: foodData.quantity + 1 })}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: '#F0FDF4', color: '#166534', fontSize: '13px' }}>
                  ✓ Live Update Preview: Hub stock will increase from <strong>{inventory.food}</strong> to <strong>{inventory.food + foodData.quantity}</strong>.
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  className="hub-btn-primary"
                  onClick={() => handleDonationSubmit('food', foodData.quantity)}
                >
                  Submit Donation
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              SCREEN 4: Food Thank You
              ======================================================== */}
          {currentScreen === 'food_thankyou' && (
            <div style={{ textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Check size={38} strokeWidth={3} />
              </div>

              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1F2937', margin: '0 0 6px 0' }}>
                Thank You!
              </h2>
              <p style={{ fontSize: '15px', color: '#64748B', margin: '0 0 20px 0' }}>
                Your food donation has been recorded successfully.
              </p>

              {/* Food Bag Illustration */}
              <div style={{ margin: '16px auto', width: '180px', height: '140px' }}>
                <svg viewBox="0 0 200 160" width="100%" height="100%">
                  <rect x="70" y="20" width="22" height="60" rx="8" transform="rotate(-15 70 20)" fill="#D97706" />
                  <polygon points="120,30 135,70 125,75" fill="#EA580C" />
                  <path d="M 120 30 Q 125 15 130 20 Q 120 10 115 25" fill="#16A34A" />
                  <rect x="135" y="25" width="24" height="45" rx="5" fill="#38BDF8" />
                  <rect x="141" y="16" width="12" height="10" rx="3" fill="#0284C7" />
                  <polygon points="35,60 165,60 155,150 45,150" fill="#CCA070" />
                  <path
                    d="M 100 105 C 100 105, 88 92, 88 84 C 88 78, 93 74, 98 78 C 100 80, 100 80, 100 80 C 100 80, 100 80, 102 78 C 107 74, 112 78, 112 84 C 112 92, 100 105, 100 105 Z"
                    fill="#FFFFFF"
                  />
                </svg>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>
                  Live Food Balance at Hub: <strong style={{ color: '#0E7465' }}>{inventory.food} packets</strong> (+{foodData.quantity})
                </span>
              </div>

              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, margin: '0 auto 24px' }}>
                Your kindness brings hope and comfort to someone in need.
              </p>

              <button className="hub-btn-secondary" onClick={handleResetHome}>
                Back to Home
              </button>
            </div>
          )}

          {/* ========================================================
              SCREEN 5: Cloth Donation Details
              ======================================================== */}
          {currentScreen === 'cloth_details' && (
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    backgroundColor: '#E0F2FE',
                    color: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Shirt size={30} />
                </div>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1F2937', margin: '0 0 4px 0' }}>
                    Cloth Donation
                  </h2>
                  <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                    Please provide the following details for your donation.
                  </p>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid #E2E8F0',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Shirt size={18} color="#0284C7" />
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#1F2937' }}>Quantity</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>
                    How many items of clothing? (Current stock: {inventory.cloth} sets)
                  </div>
                  <div className="hub-stepper">
                    <button
                      type="button"
                      className="hub-step-btn"
                      onClick={() => setClothData({ quantity: Math.max(1, clothData.quantity - 1) })}
                    >
                      —
                    </button>
                    <span className="hub-step-val">{clothData.quantity}</span>
                    <button
                      type="button"
                      className="hub-step-btn"
                      onClick={() => setClothData({ quantity: clothData.quantity + 1 })}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="hub-info-callout">
                  <Info size={18} style={{ flexShrink: 0 }} />
                  <div>Please ensure the clothes are clean, usable and in good condition.</div>
                </div>

                <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: '#F0FDF4', color: '#166534', fontSize: '13px' }}>
                  ✓ Live Update Preview: Hub stock will increase from <strong>{inventory.cloth}</strong> to <strong>{inventory.cloth + clothData.quantity}</strong>.
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  className="hub-btn-primary"
                  onClick={() => handleDonationSubmit('cloth', clothData.quantity)}
                >
                  Submit Donation
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              SCREEN 6: Cloth Thank You
              ======================================================== */}
          {currentScreen === 'cloth_thankyou' && (
            <div style={{ textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Check size={38} strokeWidth={3} />
              </div>

              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1F2937', margin: '0 0 6px 0' }}>
                Thank You!
              </h2>
              <p style={{ fontSize: '15px', color: '#64748B', margin: '0 0 20px 0' }}>
                Your cloth donation has been recorded successfully.
              </p>

              {/* Folded Clothes Illustration */}
              <div style={{ margin: '16px auto', width: '180px', height: '140px' }}>
                <svg viewBox="0 0 200 160" width="100%" height="100%">
                  <rect x="40" y="105" width="120" height="24" rx="8" fill="#10B981" />
                  <rect x="45" y="80" width="110" height="24" rx="8" fill="#F59E0B" />
                  <rect x="50" y="55" width="100" height="24" rx="8" fill="#0284C7" />
                  <circle cx="100" cy="115" r="16" fill="#FFFFFF" />
                  <path
                    d="M 100 120 C 100 120, 93 112, 93 107 C 93 103, 96 100, 99 103 C 100 104, 100 104, 100 104 C 100 104, 100 104, 101 103 C 104 100, 107 103, 107 107 C 107 112, 100 120, 100 120 Z"
                    fill="#0284C7"
                  />
                </svg>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>
                  Live Cloth Balance at Hub: <strong style={{ color: '#0E7465' }}>{inventory.cloth} sets</strong> (+{clothData.quantity})
                </span>
              </div>

              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, margin: '0 auto 24px' }}>
                Your generosity helps someone feel valued and supported.
              </p>

              <button className="hub-btn-secondary" onClick={handleResetHome}>
                Back to Home
              </button>
            </div>
          )}

          {/* ========================================================
              SCREEN 7: Books Donation Details
              ======================================================== */}
          {currentScreen === 'books_details' && (
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    backgroundColor: '#DCFCE7',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <BookOpen size={30} />
                </div>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1F2937', margin: '0 0 4px 0' }}>
                    Books Donation
                  </h2>
                  <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                    Please provide the following details for your donation.
                  </p>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid #E2E8F0',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <BookOpen size={18} color="#0284C7" />
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#1F2937' }}>Quantity</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>
                    How many books? (Current stock: {inventory.books} books)
                  </div>
                  <div className="hub-stepper">
                    <button
                      type="button"
                      className="hub-step-btn"
                      onClick={() => setBooksData({ quantity: Math.max(1, booksData.quantity - 1) })}
                    >
                      —
                    </button>
                    <span className="hub-step-val">{booksData.quantity}</span>
                    <button
                      type="button"
                      className="hub-step-btn"
                      onClick={() => setBooksData({ quantity: booksData.quantity + 1 })}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="hub-info-callout">
                  <Info size={18} style={{ flexShrink: 0 }} />
                  <div>Please ensure the books are in good condition and suitable for all age groups.</div>
                </div>

                <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: '#F0FDF4', color: '#166534', fontSize: '13px' }}>
                  ✓ Live Update Preview: Hub stock will increase from <strong>{inventory.books}</strong> to <strong>{inventory.books + booksData.quantity}</strong>.
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  className="hub-btn-primary"
                  onClick={() => handleDonationSubmit('books', booksData.quantity)}
                >
                  Submit Donation
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              SCREEN 8: Books Thank You
              ======================================================== */}
          {currentScreen === 'books_thankyou' && (
            <div style={{ textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Check size={38} strokeWidth={3} />
              </div>

              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1F2937', margin: '0 0 6px 0' }}>
                Thank You!
              </h2>
              <p style={{ fontSize: '15px', color: '#64748B', margin: '0 0 20px 0' }}>
                Your book donation has been recorded successfully.
              </p>

              {/* Books Stack Illustration */}
              <div style={{ margin: '16px auto', width: '180px', height: '140px' }}>
                <svg viewBox="0 0 200 160" width="100%" height="100%">
                  <rect x="45" y="105" width="110" height="22" rx="4" fill="#059669" />
                  <rect x="52" y="108" width="96" height="16" rx="2" fill="#FFFFFF" />
                  <rect x="48" y="82" width="104" height="22" rx="4" fill="#EA580C" />
                  <rect x="55" y="85" width="90" height="16" rx="2" fill="#FFFFFF" />
                  <rect x="52" y="58" width="96" height="22" rx="4" fill="#2563EB" />
                  <rect x="58" y="61" width="84" height="16" rx="2" fill="#FFFFFF" />
                  <polygon points="120,58 130,58 130,95 125,90 120,95" fill="#EF4444" />
                </svg>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>
                  Live Books Balance at Hub: <strong style={{ color: '#0E7465' }}>{inventory.books} books</strong> (+{booksData.quantity})
                </span>
              </div>

              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, margin: '0 auto 24px' }}>
                Your gift of knowledge builds a brighter future.
              </p>

              <button className="hub-btn-secondary" onClick={handleResetHome}>
                Back to Home
              </button>
            </div>
          )}

          {/* ========================================================
              SCREEN 9: Other Donation Details
              ======================================================== */}
          {currentScreen === 'other_details' && (
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    backgroundColor: '#F3E8FF',
                    color: '#9333EA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Box size={30} />
                </div>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1F2937', margin: '0 0 4px 0' }}>
                    Other Donation
                  </h2>
                  <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                    Please provide the following details for your donation.
                  </p>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid #E2E8F0',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Box size={18} color="#0284C7" />
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#1F2937' }}>Quantity</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>
                    How many items? (Current stock: {inventory.other} items)
                  </div>
                  <div className="hub-stepper">
                    <button
                      type="button"
                      className="hub-step-btn"
                      onClick={() => setOtherData({ quantity: Math.max(1, otherData.quantity - 1) })}
                    >
                      —
                    </button>
                    <span className="hub-step-val">{otherData.quantity}</span>
                    <button
                      type="button"
                      className="hub-step-btn"
                      onClick={() => setOtherData({ quantity: otherData.quantity + 1 })}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="hub-info-callout">
                  <Info size={18} style={{ flexShrink: 0 }} />
                  <div>Please ensure the items are in good condition and usable.</div>
                </div>

                <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: '#F0FDF4', color: '#166534', fontSize: '13px' }}>
                  ✓ Live Update Preview: Hub stock will increase from <strong>{inventory.other}</strong> to <strong>{inventory.other + otherData.quantity}</strong>.
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  className="hub-btn-primary"
                  onClick={() => handleDonationSubmit('other', otherData.quantity)}
                >
                  Submit Donation
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              SCREEN 10: Other Thank You
              ======================================================== */}
          {currentScreen === 'other_thankyou' && (
            <div style={{ textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Check size={38} strokeWidth={3} />
              </div>

              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1F2937', margin: '0 0 6px 0' }}>
                Thank You!
              </h2>
              <p style={{ fontSize: '15px', color: '#64748B', margin: '0 0 20px 0' }}>
                Your other item donation has been recorded successfully.
              </p>

              {/* Care Parcel Illustration */}
              <div style={{ margin: '16px auto', width: '180px', height: '140px' }}>
                <svg viewBox="0 0 200 160" width="100%" height="100%">
                  <circle cx="85" cy="50" r="16" fill="#F59E0B" />
                  <rect x="110" y="35" width="22" height="40" rx="4" fill="#0284C7" transform="rotate(15 110 35)" />
                  <rect x="65" y="45" width="24" height="24" rx="4" fill="#10B981" />
                  <polygon points="40,65 160,65 150,145 50,145" fill="#D4A373" />
                  <polygon points="35,65 50,65 55,78 40,78" fill="#B08968" />
                  <polygon points="165,65 150,65 145,78 160,78" fill="#B08968" />
                  <path
                    d="M 100 105 C 100 105, 90 94, 90 87 C 90 82, 94 79, 98 82 C 100 84, 100 84, 100 84 C 100 84, 100 84, 102 82 C 106 79, 110 82, 110 87 C 110 94, 100 105, 100 105 Z"
                    fill="#FFFFFF"
                  />
                </svg>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>
                  Live Other Balance at Hub: <strong style={{ color: '#0E7465' }}>{inventory.other} items</strong> (+{otherData.quantity})
                </span>
              </div>

              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, margin: '0 auto 24px' }}>
                Every item counts. Thank you for your support!
              </p>

              <button className="hub-btn-secondary" onClick={handleResetHome}>
                Back to Home
              </button>
            </div>
          )}

          {/* ========================================================
              SCREEN: Verified Reservation Details & Handover Confirmation
              ======================================================== */}
          {currentScreen === 'collection_verify' && verifiedReservation && (
            <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  border: '2px solid #A7F3D0'
                }}
              >
                <ShieldCheck size={36} />
              </div>

              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: '#D1FAE5',
                  color: '#065F46',
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '4px 14px',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '10px'
                }}
              >
                Reservation Authoritatively Verified ✓
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', margin: '0 0 6px 0' }}>
                Confirm Physical Handover
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px 0' }}>
                Please review the verified reserved items below before handing them over to the volunteer.
              </p>

              {scanError && (
                <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '12px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{scanError}</span>
                </div>
              )}

              {/* Verified Details Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  border: '2px solid #0284C7',
                  padding: '24px 28px',
                  textAlign: 'left',
                  marginBottom: '20px',
                  boxShadow: '0 8px 24px rgba(2, 132, 199, 0.08)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', color: '#64748B' }}>
                      Reservation Reference
                    </span>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0369A1' }}>
                      {verifiedReservation.reservationId}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: '8px' }}>
                      STATUS: ACTIVE
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                      Item to Hand Over
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#1F2937', marginTop: '2px' }}>
                      {verifiedReservation.itemDescription}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748B', textTransform: 'capitalize' }}>
                      Category: {verifiedReservation.category}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                      Authoritative Quantity
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: '#0F766E', marginTop: '2px' }}>
                      {verifiedReservation.quantity} <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748B' }}>{verifiedReservation.unit}</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '12.5px', color: '#475569' }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>Pickup Hub:</span> {verifiedReservation.hubName} ({verifiedReservation.hubId})
                  </div>
                  <div>
                    <span style={{ fontWeight: 700 }}>Pickup Deadline:</span> {new Date(verifiedReservation.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(verifiedReservation.deadline).toLocaleDateString()})
                  </div>
                  <div>
                    <span style={{ fontWeight: 700 }}>Reserved By:</span> {verifiedReservation.volunteerName}
                  </div>
                  <div>
                    <span style={{ fontWeight: 700 }}>Volunteer ID:</span> {verifiedReservation.volunteerId}
                  </div>
                </div>
              </div>

              {/* Handover Notice */}
              <div className="hub-info-callout" style={{ textAlign: 'left', marginBottom: '24px' }}>
                <Info size={18} style={{ flexShrink: 0, color: '#0284C7' }} />
                <div style={{ fontSize: '13px', color: '#334155' }}>
                  <strong>Handover Invariant Check:</strong> Confirming this physical handover will safely deduct <strong>{verifiedReservation.quantity} {verifiedReservation.unit}</strong> from reserved Hub stock without double-deducting available inventory. Exactly one collection receipt will be generated.
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  id="confirm-handover-btn"
                  type="button"
                  className="hub-btn-primary"
                  onClick={handleConfirmReservationCollection}
                  disabled={isSubmittingCollection}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 28px',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: isSubmittingCollection ? 'not-allowed' : 'pointer',
                    opacity: isSubmittingCollection ? 0.7 : 1
                  }}
                >
                  {isSubmittingCollection ? (
                    <>
                      <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Confirming Handover...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Confirm Physical Handover ({verifiedReservation.quantity} {verifiedReservation.unit})</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="hub-btn-secondary"
                  onClick={() => {
                    setVerifiedReservation(null);
                    setCurrentScreen('scan');
                  }}
                  disabled={isSubmittingCollection}
                  style={{ width: 'auto', padding: '12px 20px', fontSize: '14px' }}
                >
                  Cancel / Back
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              SCREEN: Collection Thank You (Authoritative Physical Handover Receipt)
              ======================================================== */}
          {currentScreen === 'collection_thankyou' && (
            <div style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto' }}>
              {/* Green Checkmark Badge */}
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Check size={38} strokeWidth={3} />
              </div>

              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1F2937', margin: '0 0 6px 0' }}>
                Collection Confirmed!
              </h2>
              <p style={{ fontSize: '15px', color: '#64748B', margin: '0 0 24px 0' }}>
                Physical handover completed successfully at <strong>{currentHub?.name || selectedHubId}</strong>.
              </p>

              {/* Authoritative Handover Receipt Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1.5px solid #BAE6FD',
                  padding: '24px 28px',
                  textAlign: 'left',
                  marginBottom: '20px',
                  boxShadow: '0 6px 18px rgba(2, 132, 199, 0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Package size={26} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                      Handover Receipt Reference
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#0369A1' }}>
                      {collectionReceipt?.collectionReference || collectionReceipt?.reference || 'COL-CONFIRMED'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 10px 1fr', gap: '8px', fontSize: '13.5px', color: '#334155', fontFamily: 'Inter, sans-serif' }}>
                  <span style={{ fontWeight: 600, color: '#64748B' }}>Reservation ID</span>
                  <span>:</span>
                  <span style={{ fontWeight: 700, color: '#1E293B' }}>{collectionReceipt?.reservationId || verifiedReservation?.reservationId}</span>

                  <span style={{ fontWeight: 600, color: '#64748B' }}>Items Collected</span>
                  <span>:</span>
                  <span style={{ fontWeight: 800, color: '#0F766E' }}>
                    {collectionReceipt?.item || `${verifiedReservation?.quantity} ${verifiedReservation?.unit} of ${verifiedReservation?.category}`}
                  </span>

                  <span style={{ fontWeight: 600, color: '#64748B' }}>Handed Over To</span>
                  <span>:</span>
                  <span style={{ fontWeight: 700, color: '#1E293B' }}>
                    {collectionReceipt?.collectedBy || verifiedReservation?.volunteerName || verifiedUser?.name}
                  </span>

                  <span style={{ fontWeight: 600, color: '#64748B' }}>Pickup Hub</span>
                  <span>:</span>
                  <span style={{ fontWeight: 600 }}>{collectionReceipt?.hub || `${currentHub?.name} (${selectedHubId})`}</span>

                  <span style={{ fontWeight: 600, color: '#64748B' }}>Handover Time</span>
                  <span>:</span>
                  <span style={{ fontWeight: 600 }}>
                    {new Date(collectionReceipt?.collectedAt || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Live Inventory Accounting Confirmation */}
              <div style={{ backgroundColor: '#F0FDF4', padding: '14px 18px', borderRadius: '12px', border: '1px solid #BBF7D0', marginBottom: '20px', textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#15803D', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} /> Inventory Invariant Maintained
                </div>
                <div style={{ fontSize: '12.5px', color: '#166534' }}>
                  Reserved stock decremented authoritatively. Available stock unchanged. Collection activity logged.
                </div>
              </div>

              {/* Kiosk Auto-Reset Countdown Banner */}
              <div style={{ marginBottom: '20px', fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Clock size={15} color="#0284C7" />
                <span>Kiosk will auto-reset for next volunteer in <strong>{sessionCountdown} seconds</strong>.</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button className="hub-btn-primary" onClick={handleResetHome} style={{ width: 'auto', padding: '12px 28px', fontSize: '14px' }}>
                  Complete & Return Home
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================
          SETTINGS & KIOSK DIAGNOSTICS MODAL
          ======================================================== */}
      {showSettingsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 100
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '28px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="#0E7465" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1F2937' }}>
                  Hub Terminal Diagnostics
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#4B5563' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748B' }}>Hub Node:</span>
                <span style={{ fontWeight: 700, color: '#1F2937' }}>{currentHub ? currentHub.fullName : 'No Hub Registered'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748B' }}>Terminal ID:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0E7465' }}>{currentHub ? currentHub.terminal : 'TK-00'} (Web Kiosk)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748B' }}>Operation Mode:</span>
                <span style={{ fontWeight: 700, color: '#10B981' }}>Self-Service (Web Application)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748B' }}>Sync Status:</span>
                <span style={{ fontWeight: 700, color: '#10B981' }}>● Real-time WebSocket Synchronized</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Live Total Stock:</span>
                <span style={{ fontWeight: 800, color: '#1668E8' }}>
                  {inventory.food + inventory.cloth + inventory.books + inventory.other} items
                </span>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setInventory({ food: 24, cloth: 45, books: 100, other: 37 });
                  setShowSettingsModal(false);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Reset Default Stock
              </button>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#1668E8',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HubKioskShell;
