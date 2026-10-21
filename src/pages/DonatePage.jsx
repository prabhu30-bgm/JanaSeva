import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import hubService from '../services/hubService';
import catalogueService from '../services/catalogueService';
import {
  Button,
  Card,
  Alert,
  Spinner,
  EmptyState
} from '@janaseva/ui';
import {
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
  ShieldCheck,
  Info,
  ExternalLink,
  RefreshCw,
  Navigation,
  Soup,
  Shirt,
  BookOpen,
  Box,
  Scale,
  FileCheck,
  Building2
} from 'lucide-react';

export function DonatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Step 1: Category Selection
  // Step 2: Category Acceptance Guidelines & Details
  // Step 3: Eligible Hub Selection (3 km Geospatial Discovery)
  // Step 4: Digital Deposit Pass & Kiosk Instructions
  const [currentStep, setCurrentStep] = useState(1);

  // Catalogue State
  const [categories, setCategories] = useState([]);
  const [loadingCatalogue, setLoadingCatalogue] = useState(true);
  const [catalogueError, setCatalogueError] = useState(null);

  // Selection & Form State
  const [selectedCategoryId, setSelectedCategoryId] = useState('food');
  const [quantity, setQuantity] = useState(10);
  const [unit, setUnit] = useState('portions');
  const [description, setDescription] = useState('');
  const [guidelinesConfirmed, setGuidelinesConfirmed] = useState(false);

  // Hub Discovery State
  const [hubs, setHubs] = useState([]);
  const [loadingHubs, setLoadingHubs] = useState(false);
  const [hubsError, setHubsError] = useState(null);
  const [selectedHub, setSelectedHub] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'requesting' | 'granted' | 'denied'
  const [locationNotice, setLocationNotice] = useState(null);

  // Generated Deposit Reference Token for Step 4
  const [depositToken, setDepositToken] = useState(null);

  // 1. Fetch Catalogue Categories on Mount
  const fetchCatalogue = useCallback(async () => {
    setLoadingCatalogue(true);
    setCatalogueError(null);
    try {
      const data = await catalogueService.getCategories();
      setCategories(data);
      // Preselect category if passed via query param (e.g. ?category=cloth)
      const paramCat = searchParams.get('category');
      if (paramCat) {
        const matched = data.find((c) => c.id === paramCat || c.code === paramCat);
        if (matched) {
          setSelectedCategoryId(matched.id);
          setUnit(matched.defaultUnit || 'units');
        }
      }
    } catch (err) {
      setCatalogueError('Failed to load resource catalogue definitions from backend.');
    } finally {
      setLoadingCatalogue(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchCatalogue();
  }, [fetchCatalogue]);

  // Current active category object
  const currentCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0] || null;

  // Handle Category Selection
  const handleSelectCategory = (cat) => {
    setSelectedCategoryId(cat.id);
    setUnit(cat.defaultUnit || 'units');
    setGuidelinesConfirmed(false);
    setSelectedHub(null);
  };

  // Request browser geolocation for 3 km hub discovery
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      setLocationNotice('Geolocation not supported on this browser. Showing all active hubs.');
      return;
    }

    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setLocationStatus('granted');
        setLocationNotice('Discovery filtered to nearest 3 km radius from your device.');
      },
      () => {
        setLocationStatus('denied');
        setLocationNotice('Location access not granted. Showing regional active hubs.');
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  // 2. Fetch Eligible Hubs when entering Step 3
  const fetchEligibleHubs = useCallback(async () => {
    if (!currentCategory) return;
    setLoadingHubs(true);
    setHubsError(null);

    try {
      const params = {
        category: currentCategory.supportedHubCategoryKey || currentCategory.id,
        status: 'active',
        radiusKm: 3
      };

      if (userCoords) {
        params.lat = userCoords.lat;
        params.lng = userCoords.lng;
      }

      const res = await hubService.getHubs(params);
      const fetchedHubs = res?.hubs || [];
      setHubs(fetchedHubs);

      // Auto-select nearest or first eligible hub if available
      if (fetchedHubs.length > 0 && !selectedHub) {
        const eligible = fetchedHubs.find((h) => h.status === 'active' && (h.currentUtilizationPct || 0) < 95);
        if (eligible) setSelectedHub(eligible);
      }
    } catch (err) {
      setHubsError('Unable to discover nearby JanaSeva Hubs. Please check connection and try again.');
    } finally {
      setLoadingHubs(false);
    }
  }, [currentCategory, userCoords, selectedHub]);

  useEffect(() => {
    if (currentStep === 3) {
      fetchEligibleHubs();
    }
  }, [currentStep, fetchEligibleHubs]);

  // Generate Digital Deposit Reference Token when moving to Step 4
  const handleProceedToPass = () => {
    if (!selectedHub) return;
    const catCode = (currentCategory?.id || 'RES').toUpperCase().slice(0, 3);
    const rand = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    const token = `DEP-${year}-${catCode}-${rand}`;
    setDepositToken(token);
    setCurrentStep(4);
  };

  // Render Category Icon
  const renderCategoryIcon = (id, size = 28) => {
    switch (id) {
      case 'food':
        return <Soup size={size} color="#EA580C" />;
      case 'cloth':
        return <Shirt size={size} color="#0284C7" />;
      case 'books':
        return <BookOpen size={size} color="#16A34A" />;
      case 'other':
      default:
        return <Box size={size} color="#9333EA" />;
    }
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
      {/* 1. Page Header & Stepper */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1F2937', margin: 0 }}>
              Contribute Resources
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0 0' }}>
              Select a resource category, verify quality standards, and locate a verified JanaSeva Hub within 3 km for self-service intake.
            </p>
          </div>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#0F766E',
              backgroundColor: '#E6F4F1',
              padding: '6px 14px',
              borderRadius: '9999px',
              border: '1px solid #CCFBF1'
            }}
          >
            Step {currentStep} of 4
          </span>
        </div>

        {/* Stepper Progress Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFFFFF',
            padding: '16px 20px',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            marginTop: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          {[
            { num: 1, title: 'Resource Category' },
            { num: 2, title: 'Acceptance Guidelines' },
            { num: 3, title: 'Hub Selection (3 km)' },
            { num: 4, title: 'Deposit Pass & Kiosk' }
          ].map((step, idx) => {
            const isDone = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            return (
              <React.Fragment key={step.num}>
                <button
                  type="button"
                  onClick={() => {
                    // Allow navigating backward to completed steps
                    if (step.num < currentStep) setCurrentStep(step.num);
                  }}
                  disabled={step.num > currentStep}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: step.num < currentStep ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'inherit'
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: isDone ? '#0F766E' : isCurrent ? '#0F766E' : '#F1F5F9',
                      color: isDone || isCurrent ? '#FFFFFF' : '#64748B',
                      fontSize: '12px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      border: isCurrent ? '2px solid #CCFBF1' : 'none'
                    }}
                  >
                    {isDone ? <Check size={14} /> : step.num}
                  </div>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: isCurrent ? 800 : isDone ? 700 : 500,
                      color: isCurrent ? '#0F766E' : isDone ? '#1F2937' : '#94A3B8'
                    }}
                  >
                    {step.title}
                  </span>
                </button>
                {idx < 3 && (
                  <div
                    style={{
                      flex: 1,
                      height: '3px',
                      backgroundColor: currentStep > idx + 1 ? '#0F766E' : '#E2E8F0',
                      borderRadius: '2px'
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          STEP 1: DONATION ENTRY & CATEGORY SELECTION
          ======================================================== */}
      {currentStep === 1 && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E5E7EB', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937', margin: '0 0 6px 0' }}>
              What Resource Are You Donating?
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
              JanaSeva accepts four standardized resource categories. Select one to inspect community quality standards and prepare your deposit.
            </p>
          </div>

          {/* Loading State */}
          {loadingCatalogue && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: '16px' }}>
              <Spinner size="lg" />
              <span style={{ fontSize: '14px', color: '#64748B' }}>Loading authoritative catalogue definitions...</span>
            </div>
          )}

          {/* Error State */}
          {catalogueError && (
            <div style={{ marginBottom: '24px' }}>
              <Alert variant="danger">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>{catalogueError}</span>
                  <Button variant="secondary" size="sm" onClick={fetchCatalogue}>
                    <RefreshCw size={14} />
                    <span>Retry</span>
                  </Button>
                </div>
              </Alert>
            </div>
          )}

          {/* 4 Category Cards Grid */}
          {!loadingCatalogue && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px', marginBottom: '32px' }}>
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`category-card-${cat.id}`}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    style={{
                      padding: '24px',
                      borderRadius: '20px',
                      border: isSelected ? '2px solid #0F766E' : '1.5px solid #E2E8F0',
                      backgroundColor: isSelected ? '#F0FDF4' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      textAlign: 'left',
                      outline: 'none',
                      boxShadow: isSelected ? '0 4px 14px rgba(15, 118, 110, 0.12)' : 'none'
                    }}
                  >
                    <div
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '14px',
                        backgroundColor: isSelected ? '#CCFBF1' : '#F8FAFC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid #E2E8F0'
                      }}
                    >
                      {renderCategoryIcon(cat.id, 28)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: isSelected ? '#0F766E' : '#1F2937' }}>
                          {cat.name} {cat.emoji}
                        </div>
                        {isSelected && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#0F766E',
                              backgroundColor: '#CCFBF1',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Check size={12} /> Selected
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginTop: '4px' }}>
                        {cat.tagline}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px', lineHeight: 1.4 }}>
                        {cat.description}
                      </div>
                      <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {cat.units?.map((u) => (
                          <span
                            key={u}
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#64748B',
                              backgroundColor: '#F1F5F9',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            {u}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
            <Button
              id="continue-to-guidelines-btn"
              variant="primary"
              size="lg"
              disabled={!selectedCategoryId || loadingCatalogue}
              onClick={() => setCurrentStep(2)}
              style={{ borderRadius: '9999px', padding: '0 32px', backgroundColor: '#0F766E' }}
            >
              <span>Review Acceptance Guidelines</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 2: CATEGORY-SPECIFIC ACCEPTANCE GUIDELINES
          ======================================================== */}
      {currentStep === 2 && currentCategory && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E5E7EB', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#F0FDF4',
                border: '1px solid #CCFBF1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {renderCategoryIcon(currentCategory.id, 26)}
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937', margin: 0 }}>
                {currentCategory.name} Acceptance Guidelines & Safety Standards
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                Review safety requirements before taking resources to the JanaSeva Hub intake terminal.
              </p>
            </div>
          </div>

          {/* SPECIFIC GUIDANCE BY CATEGORY */}
          {/* 1. FOOD GUIDELINES */}
          {currentCategory.id === 'food' && currentCategory.guidance && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ padding: '16px 20px', borderRadius: '16px', backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C2410C', fontWeight: 800, fontSize: '14px' }}>
                    <Clock size={16} />
                    <span>Packing Time Requirement</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#9A3412', marginTop: '6px', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                    {currentCategory.guidance.packingTimeRequirement}
                  </p>
                </div>
                <div style={{ padding: '16px 20px', borderRadius: '16px', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B45309', fontWeight: 800, fontSize: '14px' }}>
                    <ShieldCheck size={16} />
                    <span>Consumption Shelf-Life</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#92400E', marginTop: '6px', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                    {currentCategory.guidance.consumptionDeadline}
                  </p>
                </div>
              </div>

              {/* Safety Conditions */}
              <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', marginBottom: '10px' }}>
                  Mandatory Food Safety Conditions:
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentCategory.guidance.safetyConditions?.map((cond, idx) => (
                    <li key={idx} style={{ fontSize: '13px', color: '#475569' }}>
                      {cond}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 2. CLOTH GUIDELINES */}
          {currentCategory.id === 'cloth' && currentCategory.guidance && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ padding: '16px 20px', borderRadius: '16px', backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369A1', fontWeight: 800, fontSize: '14px' }}>
                    <Sparkles size={16} />
                    <span>Cleanliness & Hygiene</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#0C4A6E', marginTop: '6px', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                    {currentCategory.guidance.cleanliness}
                  </p>
                </div>
                <div style={{ padding: '16px 20px', borderRadius: '16px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', fontWeight: 800, fontSize: '14px' }}>
                    <ShieldCheck size={16} />
                    <span>Wearable Condition</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#14532D', marginTop: '6px', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                    {currentCategory.guidance.condition}
                  </p>
                </div>
              </div>

              {/* Restrictions */}
              <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#991B1B', marginBottom: '8px' }}>
                  Catalogue Restrictions & Unacceptable Items:
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentCategory.guidance.restrictions?.map((r, idx) => (
                    <li key={idx} style={{ fontSize: '13px', color: '#7F1D1D' }}>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 3. BOOKS GUIDELINES */}
          {currentCategory.id === 'books' && currentCategory.guidance && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ padding: '16px 20px', borderRadius: '16px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', fontWeight: 800, fontSize: '14px' }}>
                    <FileCheck size={16} />
                    <span>Acceptable Condition</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#14532D', marginTop: '6px', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                    {currentCategory.guidance.condition}
                  </p>
                </div>
                <div style={{ padding: '16px 20px', borderRadius: '16px', backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369A1', fontWeight: 800, fontSize: '14px' }}>
                    <BookOpen size={16} />
                    <span>Educational Usability</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#0C4A6E', marginTop: '6px', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                    {currentCategory.guidance.usability}
                  </p>
                </div>
              </div>

              {/* Restrictions */}
              <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#991B1B', marginBottom: '8px' }}>
                  Strict Restrictions:
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentCategory.guidance.restrictions?.map((r, idx) => (
                    <li key={idx} style={{ fontSize: '13px', color: '#7F1D1D' }}>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 4. OTHER / ESSENTIALS GUIDELINES */}
          {currentCategory.id === 'other' && currentCategory.guidance && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              <div style={{ padding: '16px 20px', borderRadius: '16px', backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#6B21A8', marginBottom: '8px' }}>
                  Configured Permitted Subtypes:
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentCategory.guidance.allowedSubtypes?.map((st, idx) => (
                    <li key={idx} style={{ fontSize: '13px', color: '#581C87' }}>
                      {st}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ padding: '16px 20px', borderRadius: '16px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#991B1B', marginBottom: '6px' }}>
                  Strict Safety Prohibitions:
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentCategory.guidance.safetyConditions?.map((sc, idx) => (
                    <li key={idx} style={{ fontSize: '13px', color: '#7F1D1D' }}>
                      {sc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TWO-COLUMN INVARIANT BREAKDOWN:
              Volunteer-Provided Info vs. Physical Hub Checks */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '16px',
              padding: '20px',
              backgroundColor: '#F8FAFC',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              marginBottom: '28px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F766E', fontWeight: 800, fontSize: '14px', marginBottom: '8px' }}>
                <CheckCircle2 size={16} />
                <span>What You Declare (Volunteer App)</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: '#475569' }}>
                {currentCategory.guidance?.volunteerProvidedInfo?.map((v, idx) => (
                  <li key={idx}>{v}</li>
                )) || (
                  <>
                    <li>Estimated quantity and packaging type</li>
                    <li>Resource condition and quality self-certification</li>
                  </>
                )}
              </ul>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E40AF', fontWeight: 800, fontSize: '14px', marginBottom: '8px' }}>
                <Scale size={16} />
                <span>Physical Checks at JanaSeva Hub (Kiosk)</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: '#475569' }}>
                {currentCategory.guidance?.hubPhysicalChecks?.map((h, idx) => (
                  <li key={idx}>{h}</li>
                )) || (
                  <>
                    <li>Packaging seal integrity and container sanitation</li>
                    <li>Automated weighing, barcode scanning, and shelf placement</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Volunteer Contribution Quantity & Note Input */}
          <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1F2937', margin: '0 0 16px 0' }}>
              Estimated Contribution Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>
                  Quantity ({unit})
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    id="donation-quantity-input"
                    type="number"
                    min="1"
                    max="500"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{
                      width: '100%',
                      height: '42px',
                      borderRadius: '10px',
                      border: '1.5px solid #D1D5DB',
                      padding: '0 14px',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#1F2937',
                      outline: 'none'
                    }}
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    style={{
                      height: '42px',
                      borderRadius: '10px',
                      border: '1.5px solid #D1D5DB',
                      padding: '0 12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#374151',
                      backgroundColor: '#FFFFFF',
                      outline: 'none'
                    }}
                  >
                    {currentCategory.units?.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>
                  Item Description & Preparation Notes (Optional)
                </label>
                <input
                  id="donation-description-input"
                  type="text"
                  placeholder="e.g. 10 prepared vegetarian meals packed in sealed food-grade foil containers"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '10px',
                    border: '1.5px solid #D1D5DB',
                    padding: '0 14px',
                    fontSize: '13.5px',
                    color: '#1F2937',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                marginTop: '12px',
                userSelect: 'none'
              }}
            >
              <input
                id="guidelines-confirm-checkbox"
                type="checkbox"
                checked={guidelinesConfirmed}
                onChange={(e) => setGuidelinesConfirmed(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#0F766E', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1F2937' }}>
                I confirm that my resources strictly meet the cleanliness, hygiene, and packaging requirements above.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
            <Button variant="secondary" size="lg" onClick={() => setCurrentStep(1)} style={{ borderRadius: '9999px' }}>
              <ArrowLeft size={16} />
              <span>Back to Categories</span>
            </Button>
            <Button
              id="find-eligible-hubs-btn"
              variant="primary"
              size="lg"
              disabled={!guidelinesConfirmed}
              onClick={() => setCurrentStep(3)}
              style={{
                borderRadius: '9999px',
                padding: '0 32px',
                backgroundColor: guidelinesConfirmed ? '#0F766E' : '#9CA3AF'
              }}
            >
              <span>Find Eligible Hubs (3 km)</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 3: HUB SELECTION (3 KM GEOSPATIAL DISCOVERY)
          ======================================================== */}
      {currentStep === 3 && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E5E7EB', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937', margin: 0 }}>
                Select Active Drop-Off Hub
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0' }}>
                Showing active JanaSeva Hubs with verified intake capacity for <strong>{currentCategory?.name}</strong>.
              </p>
            </div>

            {/* 3 km Location Trigger Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Button
                variant={locationStatus === 'granted' ? 'primary' : 'secondary'}
                size="sm"
                onClick={requestUserLocation}
                disabled={locationStatus === 'requesting'}
                style={{ borderRadius: '9999px', gap: '6px' }}
              >
                <Navigation size={14} />
                <span>{locationStatus === 'granted' ? 'Location Active (3 km)' : 'Use My GPS Location'}</span>
              </Button>
            </div>
          </div>

          {/* Location Notice Banner */}
          {locationNotice && (
            <div style={{ marginBottom: '20px' }}>
              <Alert variant={locationStatus === 'granted' ? 'info' : 'warning'}>
                <div style={{ fontSize: '13px' }}>{locationNotice}</div>
              </Alert>
            </div>
          )}

          {/* Loading Hubs */}
          {loadingHubs && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: '14px' }}>
              <Spinner size="lg" />
              <span style={{ fontSize: '14px', color: '#64748B' }}>Discovering nearby verified hubs supporting {currentCategory?.name}...</span>
            </div>
          )}

          {/* Hubs Error */}
          {hubsError && (
            <div style={{ marginBottom: '24px' }}>
              <Alert variant="danger">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>{hubsError}</span>
                  <Button variant="secondary" size="sm" onClick={fetchEligibleHubs}>
                    <RefreshCw size={14} />
                    <span>Retry</span>
                  </Button>
                </div>
              </Alert>
            </div>
          )}

          {/* Hub Cards List */}
          {!loadingHubs && !hubsError && (
            <div>
              {hubs.length === 0 ? (
                <EmptyState
                  title="No Eligible Hubs Found Nearby"
                  description={`Currently, no active JanaSeva Hub within your discovery boundary accepts ${currentCategory?.name} or hubs are at peak storage capacity.`}
                  action={
                    <Button variant="secondary" size="md" onClick={() => navigate('/hubs')}>
                      Explore All Regional Hubs
                    </Button>
                  }
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
                  {hubs.map((hub) => {
                    const isSelected = selectedHub?.hubId === hub.hubId;
                    const isClosed = hub.status !== 'active';
                    const isOverCapacity = (hub.currentUtilizationPct || 0) >= 95;
                    const isBlocked = isClosed || isOverCapacity;

                    return (
                      <div
                        key={hub.hubId}
                        id={`hub-card-${hub.hubId}`}
                        onClick={() => {
                          if (!isBlocked) setSelectedHub(hub);
                        }}
                        style={{
                          padding: '20px 24px',
                          borderRadius: '16px',
                          border: isSelected ? '2px solid #0F766E' : '1.5px solid #E2E8F0',
                          backgroundColor: isBlocked ? '#F8FAFC' : isSelected ? '#F0FDF4' : '#FFFFFF',
                          opacity: isBlocked ? 0.65 : 1,
                          cursor: isBlocked ? 'not-allowed' : 'pointer',
                          transition: 'all 0.18s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          flexWrap: 'wrap',
                          boxShadow: isSelected ? '0 4px 14px rgba(15, 118, 110, 0.1)' : 'none'
                        }}
                      >
                        {/* Hub Left Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '260px' }}>
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '12px',
                              backgroundColor: isSelected ? '#0F766E' : '#F1F5F9',
                              color: isSelected ? '#FFFFFF' : '#0F766E',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <Building2 size={20} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '16px', fontWeight: 800, color: '#1F2937' }}>
                                {hub.name}
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F766E', backgroundColor: '#CCFBF1', padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                                {hub.code || hub.hubId}
                              </span>
                              {isClosed && (
                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', backgroundColor: '#FEE2E2', padding: '2px 8px', borderRadius: '9999px' }}>
                                  Temporarily Closed
                                </span>
                              )}
                              {isOverCapacity && (
                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#D97706', backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: '9999px' }}>
                                  Intake Paused (Full)
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12.5px', color: '#64748B', marginTop: '4px', flexWrap: 'wrap' }}>
                              <span>{hub.address}, {hub.locality}</span>
                              {hub.distanceKm !== null && hub.distanceKm !== undefined && (
                                <span style={{ fontWeight: 700, color: '#0E7465' }}>
                                  • {hub.distanceKm} km away
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                              <Clock size={13} color="#059669" />
                              <span>{hub.operatingHours?.open || '09:00'} – {hub.operatingHours?.close || '19:00'} ({hub.operatingHours?.days || 'Mon–Sat'})</span>
                            </div>
                          </div>
                        </div>

                        {/* Hub Right Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                          {/* Capacity Pill */}
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>Storage Capacity</div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: (hub.currentUtilizationPct || 0) > 85 ? '#D97706' : '#059669' }}>
                              {hub.currentUtilizationPct || 50}% utilized
                            </div>
                          </div>

                          {/* Deep Link to Hub Detail */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/hubs/${hub.hubId}`);
                            }}
                            title="Inspect complete hub specifications & inventory"
                            style={{
                              background: '#F1F5F9',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#334155'
                            }}
                          >
                            <span>Specs</span>
                            <ExternalLink size={13} />
                          </button>

                          {/* Select Checkmark */}
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: isSelected ? '#0F766E' : '#FFFFFF',
                              border: isSelected ? 'none' : '2px solid #CBD5E1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFFFFF'
                            }}
                          >
                            {isSelected && <Check size={16} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
            <Button variant="secondary" size="lg" onClick={() => setCurrentStep(2)} style={{ borderRadius: '9999px' }}>
              <ArrowLeft size={16} />
              <span>Back to Guidelines</span>
            </Button>
            <Button
              id="prepare-deposit-pass-btn"
              variant="primary"
              size="lg"
              disabled={!selectedHub || (selectedHub.status !== 'active') || loadingHubs}
              onClick={handleProceedToPass}
              style={{
                borderRadius: '9999px',
                padding: '0 32px',
                backgroundColor: selectedHub && selectedHub.status === 'active' ? '#0F766E' : '#9CA3AF'
              }}
            >
              <span>Prepare Deposit Pass</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 4: DIGITAL DEPOSIT PASS & KIOSK INSTRUCTIONS
          ======================================================== */}
      {currentStep === 4 && selectedHub && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* CRITICAL INVENTORY INTEGRITY INVARIANT ALERT */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#EFF6FF',
              borderRadius: '16px',
              border: '1.5px solid #BFDBFE',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            <Info size={20} color="#1D4ED8" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '13px', color: '#1E40AF', lineHeight: 1.5 }}>
              <strong>Notice — Physical Kiosk Verification Invariant:</strong>
              <br />
              This digital pass records your contribution intent. In accordance with JanaSeva safety rules, authoritative resource acceptance, official inventory updates in MongoDB, and community impact reward points (+10 Points) are awarded <strong>only upon physical inspection and QR verification at the JanaSeva Hub Terminal</strong>. The Volunteer Application does not increase inventory directly.
            </div>
          </div>

          {/* Digital Deposit Pass Card */}
          <div
            id="digital-deposit-pass-card"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '2px solid #0F766E',
              padding: '32px',
              boxShadow: '0 8px 30px rgba(15, 118, 110, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top Pass Brand Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px dashed #CBD5E1', paddingBottom: '20px', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0F766E' }}>
                  JanaSeva Official Volunteer Intake Pass
                </span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937', marginTop: '2px' }}>
                  Self-Service Deposit Authorization
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Pass Token</span>
                <div style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 800, color: '#0F766E' }}>
                  {depositToken}
                </div>
              </div>
            </div>

            {/* Pass Body Content */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
              {/* Left Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11.5px', color: '#64748B' }}>Volunteer Name</span>
                    <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#1F2937' }}>
                      {user?.name || 'Priya Sharma'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11.5px', color: '#64748B' }}>Volunteer ID</span>
                    <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#0F766E', fontFamily: 'monospace' }}>
                      {user?.volunteerId || 'V-10928'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11.5px', color: '#64748B' }}>Resource Category</span>
                    <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#1F2937' }}>
                      {currentCategory?.name} {currentCategory?.emoji}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11.5px', color: '#64748B' }}>Declared Quantity</span>
                    <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F766E' }}>
                      {quantity} {unit}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748B' }}>Destination Hub</span>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#1F2937' }}>
                    {selectedHub.name} ({selectedHub.code || selectedHub.hubId})
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                    {selectedHub.address}, {selectedHub.locality}
                  </div>
                  <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                    Operating Hours: {selectedHub.operatingHours?.open || '09:00'} – {selectedHub.operatingHours?.close || '19:00'} ({selectedHub.operatingHours?.days || 'Mon–Sat'})
                  </div>
                </div>
              </div>

              {/* Right QR Simulated Code Card */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: '130px',
                    height: '130px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '2px solid #0F766E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    marginBottom: '10px'
                  }}
                >
                  <QRCodeSVG
                    value={`JS-DONATE:${selectedHub.code || selectedHub.hubId || 'HUB'}:${user?.volunteerId || 'VOL'}:${selectedCategory.id}`}
                    size={108}
                    level="M"
                    fgColor="#0F766E"
                    bgColor="#FFFFFF"
                    includeMargin={false}
                  />
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#1E293B' }}>
                  Scan at JanaSeva Hub Optical Reader
                </span>
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                  Self-Service Terminal: {selectedHub.terminal || 'TK-01/02'}
                </span>
              </div>
            </div>
          </div>

          {/* Physical Kiosk Intake Instructions Card */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E5E7EB', padding: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1F2937', margin: '0 0 16px 0' }}>
              How Self-Service Deposit Works at the Terminal
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0F766E', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, marginBottom: '8px' }}>
                  1
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1F2937' }}>Arrive at Hub</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                  Visit {selectedHub.name} during open intake hours.
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0F766E', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, marginBottom: '8px' }}>
                  2
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1F2937' }}>Scan Pass QR</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                  Hold your volunteer pass QR code to the kiosk optical scanner.
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0F766E', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, marginBottom: '8px' }}>
                  3
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1F2937' }}>Physical Inspection</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                  Place resources on the weighing bay for quality verification.
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0F766E', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, marginBottom: '8px' }}>
                  4
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1F2937' }}>Stock & Points</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                  Kiosk records inventory in MongoDB and awards +10 points!
                </div>
              </div>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                setCurrentStep(1);
                setDepositToken(null);
              }}
              style={{ borderRadius: '9999px' }}
            >
              <span>Contribute Another Resource</span>
            </Button>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate(`/hubs/${selectedHub.hubId}`)}
                style={{ borderRadius: '9999px' }}
              >
                <span>View Hub Details & Map</span>
                <ExternalLink size={16} />
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/dashboard')}
                style={{ borderRadius: '9999px', padding: '0 28px', backgroundColor: '#0F766E' }}
              >
                <span>Return to Dashboard</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonatePage;
