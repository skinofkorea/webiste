import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const testimonials = [
  {
    quote: 'I’m loving how easy it is to find gentle Korean skincare for my routine.',
    image: '/images/testimonials/c1.webp',
  },
  {
    quote: 'The product details made it simple to choose something that fits my skin goals.',
    image: '/images/testimonials/c2.webp',
  },
  {
    quote: 'My new routine feels thoughtful, gentle and easy to stick with.',
    image: '/images/testimonials/c3.webp',
  },
  {
    quote: 'I found lovely K-beauty staples all in one place.',
    image: '/images/testimonials/c4.webp',
  },
  {
    quote: 'The textures feel so nice, and my routine feels more consistent.',
    image: '/images/testimonials/c5.webp',
  },
  {
    quote: 'A lovely way to discover Korean skincare and build a routine at my own pace.',
    image: '/images/testimonials/c6.webp',
  },
];

const MiikoreanTestimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % testimonials.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [prefersReducedMotion]);

  const showPrevious = () => {
    setActiveIndex((index) => (index - 1 + testimonials.length) % testimonials.length);
  };

  const showNext = () => {
    setActiveIndex((index) => (index + 1) % testimonials.length);
  };

  const getImageStyle = (index: number): React.CSSProperties => {
    const previousIndex = (activeIndex - 1 + testimonials.length) % testimonials.length;
    const nextIndex = (activeIndex + 1) % testimonials.length;

    if (index === activeIndex) {
      return {
        zIndex: 3,
        opacity: 1,
        transform: 'translateX(-50%) translateY(0) scale(1) rotateY(0)',
      };
    }

    if (index === previousIndex) {
      return {
        zIndex: 2,
        opacity: 0.8,
        transform: 'translateX(calc(-50% - 20%)) translateY(-8%) scale(.82) rotateY(12deg)',
      };
    }

    if (index === nextIndex) {
      return {
        zIndex: 2,
        opacity: 0.8,
        transform: 'translateX(calc(-50% + 20%)) translateY(-8%) scale(.82) rotateY(-12deg)',
      };
    }

    return { zIndex: 1, opacity: 0, transform: 'translateX(-50%) scale(.8)' };
  };

  return (
    <section aria-labelledby="customer-stories-heading" className="miikorean-testimonials">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#8b451f] sm:text-[10px]">
            Mii Korean community
          </p>
          <h2 id="customer-stories-heading" className="mt-2 text-2xl font-medium text-[#2b211c] sm:text-3xl">
            Real stories, <span className="italic text-[#8b451f]">real glow.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-xs leading-5 text-[#2b211c]/70 sm:text-sm">
            A preview of our customer stories section. These sample reviews are placeholders, not verified customer feedback.
          </p>
        </header>

        <div className="miikorean-testimonial-grid mx-auto max-w-5xl rounded-3xl border border-[#ead4be] bg-gradient-to-br from-[#fffaf4] to-[#f8e8d8] p-5 shadow-[0_8px_24px_rgba(116,71,39,0.06)] sm:p-8 lg:p-10">
          <div className="miikorean-testimonial-images" aria-hidden="true">
            {testimonials.map((testimonial, index) => (
              <img
                key={testimonial.image}
                src={testimonial.image}
                alt=""
                className="miikorean-testimonial-image"
                loading={index < 3 ? 'eager' : 'lazy'}
                decoding="async"
                style={getImageStyle(index)}
              />
            ))}
          </div>

          <div className="miikorean-testimonial-content" aria-live="polite" aria-atomic="true">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: 'easeInOut' }}
              >
                <p className="mb-3 inline-flex rounded-full bg-[#8b451f]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8b451f]">
                  Sample review · demo
                </p>
                <h3 className="text-base font-semibold text-[#2b211c] sm:text-lg">
                  Demo customer {String(activeIndex + 1).padStart(2, '0')}
                </h3>
                <p className="mt-1 text-[10px] text-[#2b211c]/55 sm:text-xs">
                  Placeholder content — replace with an approved customer review
                </p>
                <p className="mt-5 text-sm leading-7 text-[#2b211c]/80 sm:mt-6 sm:text-base">
                  “{testimonials[activeIndex].quote}”
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-between sm:mt-8">
              <span className="text-[10px] font-semibold tabular-nums tracking-[0.16em] text-[#2b211c]/55">
                {String(activeIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={showPrevious}
                  aria-label="Previous testimonial"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950 text-white transition hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
                >
                  <FaArrowLeft aria-hidden="true" size={14} />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Next testimonial"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950 text-white transition hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
                >
                  <FaArrowRight aria-hidden="true" size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MiikoreanTestimonials;
