import React, { useState } from 'react';
import { Package, MapPin, Users, Globe, ArrowRight, X } from 'lucide-react';
import { Button } from '@janaseva/ui';

export function OnboardingModal({ isOpen, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'Give what you can.',
      desc: 'Contribute food, clothes, books and useful resources. Every contribution is inspected and stored transparently.',
      icon: Package,
      iconBg: '#E6F4F1',
      iconColor: '#0F766E',
      badge: 'Step 1 of 4: Direct Donations'
    },
    {
      title: 'Find resources nearby.',
      desc: 'Locate verified JanaSeva Points within your 3 km community perimeter and check live inventory availability.',
      icon: MapPin,
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
      badge: 'Step 2 of 4: 3 km Discovery'
    },
    {
      title: 'Help someone today.',
      desc: 'Be a part of real, dignified community redistribution. Collect reserved rations and distribute directly to families.',
      icon: Users,
      iconBg: '#D1FAE5',
      iconColor: '#059669',
      badge: 'Step 3 of 4: Community Delivery'
    },
    {
      title: 'Together, we create real impact.',
      desc: 'Small actions. Big change. Track your contribution points, earn badges, and build trust in your neighborhood.',
      icon: Globe,
      iconBg: '#DBEAFE',
      iconColor: '#1D4ED8',
      badge: 'Step 4 of 4: Verified Traceability'
    }
  ];

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '20px'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '36px 32px 28px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          textAlign: 'center'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#9CA3AF',
            cursor: 'pointer',
            padding: '4px'
          }}
          aria-label="Skip onboarding"
        >
          <X size={20} />
        </button>

        {/* Step Badge */}
        <div style={{ marginBottom: '16px' }}>
          <span
            style={{
              backgroundColor: '#F3F4F6',
              color: '#4B5563',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            {slide.badge}
          </span>
        </div>

        {/* Visual Icon Illustration */}
        <div
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '24px',
            backgroundColor: slide.iconBg,
            color: slide.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <Icon size={44} />
        </div>

        {/* Content */}
        <h2
          id="onboarding-title"
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#1F2937',
            marginBottom: '10px',
            letterSpacing: '-0.01em'
          }}
        >
          {slide.title}
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: '#6B7280',
            lineHeight: 1.6,
            marginBottom: '28px',
            minHeight: '66px'
          }}
        >
          {slide.desc}
        </p>

        {/* Dot Indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {slides.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                width: currentSlide === idx ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: currentSlide === idx ? 'var(--color-primary, #0F766E)' : '#E5E7EB',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {currentSlide > 0 && (
            <button
              type="button"
              onClick={() => setCurrentSlide(currentSlide - 1)}
              className="btn btn-secondary"
              style={{ flex: 1, borderRadius: '9999px', height: '44px' }}
            >
              Back
            </button>
          )}
          <Button
            variant="primary"
            size="md"
            onClick={handleNext}
            style={{
              flex: 2,
              borderRadius: '9999px',
              height: '44px',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(15, 118, 110, 0.25)'
            }}
          >
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'} <ArrowRight size={15} style={{ marginLeft: '4px' }} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;
