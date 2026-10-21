import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  JanaSevaLogo,
  HeroHandoverIllustration,
  SaplingHandsIllustration
} from '@janaseva/ui';
import {
  ArrowRight,
  Package,
  MapPin,
  Users,
  Star,
  Heart,
  ChevronRight,
  Building2
} from 'lucide-react';
import hubService from '../services/hubService';

export function LandingPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [publicStats, setPublicStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const statsData = await hubService.getPublicStats();
        if (statsData) setPublicStats(statsData);
      } catch (err) {
        console.warn('Could not load public stats, using verified non-numeric descriptors:', err);
      }
    }
    loadStats();
  }, []);

  const stats = [
    {
      label: 'Verified Volunteers',
      value: publicStats ? `${publicStats.verifiedVolunteers}` : 'Active Community',
      icon: Users,
      color: '#0F766E',
      bg: '#E6F4F1'
    },
    {
      label: 'Available Stock',
      value: publicStats ? `${publicStats.availableStock} Units` : 'Real-time Stock',
      icon: Package,
      color: '#D97706',
      bg: '#FEF3C7'
    },
    {
      label: 'Active Hub Points',
      value: publicStats ? `${publicStats.activeHubs}` : 'Citywide Network',
      icon: Building2,
      color: '#059669',
      bg: '#D1FAE5'
    },
    {
      label: 'Completed Handovers',
      value: publicStats ? `${publicStats.completedDistributions}` : 'Direct Deliveries',
      icon: Heart,
      color: '#DC2626',
      bg: '#FEE2E2'
    }
  ];

  const steps = [
    {
      num: 1,
      title: 'Contribute',
      desc: 'Share resources like food, clothes, books & more with complete dignity.',
      icon: Package
    },
    {
      num: 2,
      title: 'Find & Reserve',
      desc: 'Locate nearby JanaSeva Points and reserve verified batches within 3 km.',
      icon: MapPin
    },
    {
      num: 3,
      title: 'Collect & Distribute',
      desc: 'Pick up from automated terminals and distribute directly to those in need.',
      icon: Users
    },
    {
      num: 4,
      title: 'Earn Points',
      desc: 'Get rewarded with verified community badges for your kindness and consistency.',
      icon: Star
    }
  ];

  const featuredResources = [
    {
      title: 'Food',
      subtitle: 'Fresh prepared nutrition meals',
      available: '18 portions available',
      distance: '1.2 km away',
      status: 'Available',
      statusVariant: 'success',
      icon: '🍲'
    },
    {
      title: 'Clothes',
      subtitle: 'Warm jackets & fleece blankets',
      available: '9 items available',
      distance: '2.1 km away',
      status: 'Available',
      statusVariant: 'success',
      icon: '🧥'
    },
    {
      title: 'Books',
      subtitle: 'NCERT Grade 6–10 curricula',
      available: '12 items available',
      distance: '3.4 km away',
      status: 'Available',
      statusVariant: 'success',
      icon: '📚'
    },
    {
      title: 'Other',
      subtitle: 'First aid kits & sanitation supplies',
      available: '6 items available',
      distance: '4.2 km away',
      status: 'Reserved',
      statusVariant: 'warning',
      icon: '📦'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', color: '#1F2937', fontFamily: 'var(--font-family, Inter, sans-serif)' }}>
      {/* 1. Header Navigation Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #E5E7EB',
          padding: '0 24px'
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          {/* Logo */}
          <NavLink to="/" style={{ textDecoration: 'none' }}>
            <JanaSevaLogo size={36} showTagline={true} />
          </NavLink>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="landing-desktop-nav">
            <a
              href="#home"
              style={{
                textDecoration: 'none',
                color: 'var(--color-primary, #0F766E)',
                fontWeight: 700,
                fontSize: '14px',
                borderBottom: '2px solid var(--color-primary, #0F766E)',
                paddingBottom: '4px'
              }}
            >
              Home
            </a>
            <NavLink
              to="/hubs"
              style={{
                textDecoration: 'none',
                color: 'var(--color-text-secondary, #6B7280)',
                fontWeight: 500,
                fontSize: '14px'
              }}
            >
              Explore
            </NavLink>
            <a
              href="#how-it-works"
              style={{
                textDecoration: 'none',
                color: 'var(--color-text-secondary, #6B7280)',
                fontWeight: 500,
                fontSize: '14px'
              }}
            >
              How It Works
            </a>
            <a
              href="#impact"
              style={{
                textDecoration: 'none',
                color: 'var(--color-text-secondary, #6B7280)',
                fontWeight: 500,
                fontSize: '14px'
              }}
            >
              Impact
            </a>
            <a
              href="#featured"
              style={{
                textDecoration: 'none',
                color: 'var(--color-text-secondary, #6B7280)',
                fontWeight: 500,
                fontSize: '14px'
              }}
            >
              Resources
            </a>
          </nav>

          {/* Action Buttons: Log In and Sign-up */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <NavLink
              to="/hubs"
              className="btn btn-secondary btn-sm"
              style={{
                borderRadius: '9999px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              Explore Hubs
            </NavLink>
            <NavLink
              to="/login"
              style={{
                textDecoration: 'none',
                color: 'var(--color-primary, #0F766E)',
                fontSize: '13px',
                fontWeight: 600,
                padding: '8px 4px'
              }}
            >
              Log In
            </NavLink>
            <NavLink
              to="/register"
              className="btn btn-primary btn-sm"
              style={{
                borderRadius: '9999px',
                padding: '8px 22px',
                fontSize: '13px',
                fontWeight: 700,
                backgroundColor: 'var(--color-primary, #0F766E)',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(15, 118, 110, 0.25)'
              }}
            >
              Sign-up
            </NavLink>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section
        id="home"
        style={{
          padding: '48px 24px 64px',
          background: 'linear-gradient(180deg, #F8FAF9 0%, #FFFFFF 100%)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1.15fr) minmax(340px, 1.35fr)',
            gap: '48px',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Copy & Actions */}
          <div>
            {/* Pill Chip */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#E6F4F1',
                color: '#0F766E',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '20px',
                letterSpacing: '0.02em'
              }}
            >
              <span>🌿 Community • Resources • Hope</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(36px, 5vw, 56px)',
                fontWeight: 800,
                lineHeight: 1.1,
                color: '#0F172A',
                letterSpacing: '-0.03em',
                marginBottom: '20px'
              }}
            >
              Small Actions.<br />
              <span style={{ color: 'var(--color-primary, #0F766E)' }}>Big Impact.</span>
            </h1>

            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.6,
                color: 'var(--color-text-secondary, #6B7280)',
                marginBottom: '32px',
                maxWidth: '480px'
              }}
            >
              JanaSeva connects people who have resources with those who need them. Together, we build stronger communities and a brighter future.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '36px' }}>
              <NavLink
                to="/register"
                className="btn btn-primary"
                style={{
                  borderRadius: '9999px',
                  padding: '12px 28px',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)'
                }}
              >
                Get Started <ArrowRight size={16} />
              </NavLink>
              <NavLink
                to="/hubs"
                className="btn btn-secondary"
                style={{
                  borderRadius: '9999px',
                  padding: '12px 26px',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                Explore Resources
              </NavLink>
            </div>

            {/* 4 Quick Category / Feature Pills */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                paddingTop: '20px',
                borderTop: '1px solid #E5E7EB'
              }}
            >
              {[
                { title: 'Contribute Resources', icon: Package },
                { title: 'Find Nearby Points', icon: MapPin },
                { title: 'Help Communities', icon: Users },
                { title: 'Earn Rewards', icon: Star }
              ].map(({ title, icon: Icon }) => (
                <div key={title} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: '#E6F4F1',
                      color: '#0F766E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#334155' }}>
                    {title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Illustration & Floating Badge */}
          <div style={{ position: 'relative' }}>
            <HeroHandoverIllustration
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '420px',
                borderRadius: '24px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 20px 35px -10px rgba(15, 118, 110, 0.15)',
                objectFit: 'cover'
              }}
            />

            {/* Floating Live Available Resource Card */}
            <div
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: '16px',
                padding: '14px 18px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(229, 231, 235, 0.8)',
                minWidth: '220px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#E6F4F1',
                    color: '#0F766E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                  }}
                >
                  🍲
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#1F2937' }}>Food</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>12 portions available</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6B7280', marginBottom: '8px' }}>
                <MapPin size={12} color="#0F766E" />
                <span>JanaSeva Point 04 • 1.2 km away</span>
              </div>

              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: '#D1FAE5',
                  color: '#059669',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}
              >
                ● Available Now
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section: Our Impact */}
      <section
        id="impact"
        style={{
          padding: '64px 24px',
          backgroundColor: '#FFFFFF'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 1fr)',
              gap: '40px',
              alignItems: 'center'
            }}
          >
            {/* Left Content */}
            <div>
              <span
                style={{
                  backgroundColor: '#E6F4F1',
                  color: '#0F766E',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  letterSpacing: '0.08em'
                }}
              >
                Our Impact
              </span>
              <h2
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  margin: '12px 0 8px'
                }}
              >
                Real People. Real Change.
              </h2>
              <p style={{ color: '#6B7280', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px', maxWidth: '520px' }}>
                Every contribution makes a difference. Together, we help reduce waste, provide nutritious food, and support communities in need across verified local distribution hubs.
              </p>

              {/* 4 Impact Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {stats.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.label}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '16px',
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#F8FAF9',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px'
                      }}
                    >
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          backgroundColor: s.bg,
                          color: s.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Icon size={22} />
                      </div>
                      <div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', lineHeight: 1.1 }}>
                          {s.value}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px', fontWeight: 500 }}>
                          {s.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Script Quote */}
              <div
                style={{
                  fontStyle: 'italic',
                  color: '#0F766E',
                  fontSize: '15px',
                  fontWeight: 500
                }}
              >
                "Because a little kindness goes a long way..."
              </div>
            </div>

            {/* Right Media Card (Sapling Hands) */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  position: 'relative',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#F0FDF4',
                  padding: '24px',
                  textAlign: 'center',
                  maxWidth: '360px',
                  width: '100%'
                }}
              >
                <SaplingHandsIllustration size={220} style={{ margin: '0 auto 16px' }} />

                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '9999px',
                    padding: '8px 18px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0F766E'
                  }}
                >
                  <Heart size={14} fill="#0F766E" />
                  <span>Be the reason for someone's smile</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section: How It Works */}
      <section
        id="how-it-works"
        style={{
          padding: '64px 24px',
          backgroundColor: '#F8FAF9'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span
              style={{
                backgroundColor: '#E6F4F1',
                color: '#0F766E',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '4px 12px',
                borderRadius: '9999px',
                letterSpacing: '0.08em'
              }}
            >
              How It Works
            </span>
            <h2
              style={{
                fontSize: '32px',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.02em',
                margin: '12px 0 8px'
              }}
            >
              Simple Steps. Big Impact.
            </h2>
            <p style={{ color: '#6B7280', fontSize: '15px', maxWidth: '540px', margin: '0 auto' }}>
              Four straightforward steps to redistribute resources transparently with end-to-end audit accountability.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px'
            }}
          >
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '220px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#0F766E',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {step.num}
                      </div>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          backgroundColor: '#E6F4F1',
                          color: '#0F766E',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Icon size={18} />
                      </div>
                    </div>

                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1F2937', marginBottom: '8px' }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
                      {step.desc}
                    </p>
                  </div>

                  <div style={{ paddingTop: '16px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', color: '#0F766E', fontSize: '12px', fontWeight: 600 }}>
                    <span>Step {step.num} Details</span>
                    <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Section: Featured Resources */}
      <section
        id="featured"
        style={{
          padding: '64px 24px',
          backgroundColor: '#FFFFFF'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>
                Featured Resources
              </h2>
              <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
                Discover what's available in your community right now.
              </p>
            </div>
            <NavLink
              to="/hubs"
              className="btn btn-secondary btn-sm"
              style={{
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              View All Resources <ArrowRight size={14} />
            </NavLink>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px'
            }}
          >
            {featuredResources.map((res) => (
              <div
                key={res.title}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  padding: '20px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                <div>
                  <div
                    style={{
                      height: '110px',
                      backgroundColor: '#F8FAF9',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '44px',
                      marginBottom: '16px'
                    }}
                  >
                    {res.icon}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1F2937', margin: 0 }}>
                      {res.title}
                    </h3>
                    <span
                      style={{
                        backgroundColor: res.statusVariant === 'success' ? '#D1FAE5' : '#FEF3C7',
                        color: res.statusVariant === 'success' ? '#059669' : '#D97706',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}
                    >
                      {res.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 12px 0' }}>
                    {res.subtitle}
                  </p>
                </div>

                <div style={{ paddingTop: '12px', borderTop: '1px solid #F3F4F6' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F766E', marginBottom: '2px' }}>
                    {res.available}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={11} /> {res.distance}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Closing Call-To-Action & Footer */}
      <section style={{ padding: '0 24px 48px' }}>
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            backgroundColor: '#0F766E',
            backgroundImage: 'radial-gradient(circle at 10% 20%, #115E59 0%, #0F766E 90%)',
            borderRadius: '24px',
            padding: '48px 32px',
            textAlign: 'center',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative Leaf Elements */}
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              left: '20px',
              fontSize: '80px',
              opacity: 0.1,
              pointerEvents: 'none'
            }}
          >
            🌿
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '-20px',
              right: '20px',
              fontSize: '80px',
              opacity: 0.1,
              pointerEvents: 'none'
            }}
          >
            🌱
          </div>

          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>
            Join JanaSeva Today
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.9, maxWidth: '520px', margin: '0 auto 28px', lineHeight: 1.5 }}>
            Be a part of something bigger. Contribute. Volunteer. Create real, lasting community impact.
          </p>

          <NavLink
            to="/register"
            className="btn"
            style={{
              backgroundColor: '#F59E0B',
              color: '#FFFFFF',
              borderRadius: '9999px',
              padding: '14px 36px',
              fontSize: '15px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
            }}
          >
            Sign-up Now <ArrowRight size={16} />
          </NavLink>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #E5E7EB', padding: '32px 24px', backgroundColor: '#F8FAF9', fontSize: '13px', color: '#6B7280' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            © 2026 JanaSeva Platform • Decentralized Community Resource Redistribution
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <NavLink to="/login" style={{ color: '#0F766E', textDecoration: 'none', fontWeight: 600 }}>
              Log In
            </NavLink>
            <NavLink to="/register" style={{ color: '#0F766E', textDecoration: 'none', fontWeight: 600 }}>
              Sign-up
            </NavLink>
            <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer" style={{ color: '#0F766E', textDecoration: 'none', fontWeight: 600 }}>
              Hub Terminal Kiosk
            </a>
            <NavLink to="/admin/overview" style={{ color: '#0F766E', textDecoration: 'none', fontWeight: 600 }}>
              Admin Console
            </NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
