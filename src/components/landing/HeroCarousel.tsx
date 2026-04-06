import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import carousel1 from "@/assets/carousel-1.jpg";
import carousel2 from "@/assets/carousel-2.jpg";
import carousel3 from "@/assets/carousel-3.jpg";
import carousel4 from "@/assets/carousel-4.jpg";
import carousel5 from "@/assets/carousel-5.jpg";

const slides = [
  {
    image: carousel1,
    title: "Welcome to LibraAI Library",
    subtitle: "Your AI-powered gateway to knowledge and discovery",
  },
  {
    image: carousel2,
    title: "Explore Knowledge",
    subtitle: "Browse thousands of books across every genre and discipline",
  },
  {
    image: carousel3,
    title: "Endless Bookshelves",
    subtitle: "A vast collection curated for curious minds",
  },
  {
    image: carousel4,
    title: "Learn Together",
    subtitle: "Collaborative spaces designed for modern learners",
  },
  {
    image: carousel5,
    title: "The Future of Libraries",
    subtitle: "AI-driven recommendations, smart search, and more",
  },
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current]
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((p) => (p + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((p) => (p - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <section className="relative w-full overflow-hidden rounded-2xl shadow-2xl mx-auto max-w-7xl mt-4 md:mt-8">
      {/* Aspect ratio container */}
      <div className="relative w-full" style={{ paddingBottom: "45%" }}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={current}
            src={slides[current].image}
            alt={slides[current].title}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
            width={1920}
            height={864}
            loading={current === 0 ? undefined : "lazy"}
          />
        </AnimatePresence>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />

        {/* Overlay text */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-12 md:pb-16 px-4 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-2 drop-shadow-lg">
                {slides[current].title}
              </h2>
              <p className="text-sm md:text-lg text-white/80 max-w-2xl mx-auto mb-6 drop-shadow">
                {slides[current].subtitle}
              </p>
              <Button
                size="lg"
                asChild
                className="gradient-primary text-primary-foreground rounded-xl px-8 shadow-lg glow-primary"
              >
                <Link to="/books">
                  Browse Books
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Arrows */}
        <button
          onClick={prev}
          className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-30 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </button>
        <button
          onClick={next}
          className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-30 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-8 bg-white"
                  : "w-2.5 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
