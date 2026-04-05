import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  Search,
  Bell,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Star,
  Users,
  BookMarked,
  MessageSquare,
  Zap,
  BarChart3,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const features = [
  {
    icon: Brain,
    title: "AI-Powered Recommendations",
    description: "Personalized book suggestions based on your reading history and interests.",
    color: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "Find books by title, author, category, or mood with predictive typing.",
    color: "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground",
  },
  {
    icon: MessageSquare,
    title: "AI Chatbot",
    description: "24/7 conversational assistant for availability, recommendations, and guidance.",
    color: "bg-warning/10 text-warning group-hover:bg-warning group-hover:text-warning-foreground",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Automated reminders for due dates, new arrivals, and personalized alerts.",
    color: "bg-info/10 text-info-foreground group-hover:bg-primary group-hover:text-primary-foreground",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Interactive charts and reports for borrowing trends and genre distribution.",
    color: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description: "Enterprise-grade security with admin and student role management.",
    color: "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground",
  },
];

const stats = [
  { value: "10K+", label: "Books Available", icon: BookOpen },
  { value: "5K+", label: "Active Users", icon: Users },
  { value: "98%", label: "Satisfaction", icon: Star },
  { value: "24/7", label: "AI Support", icon: Zap },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Computer Science Student",
    content: "LibraAI transformed how I discover books. The AI recommendations are incredibly accurate!",
    rating: 5,
    avatar: "PS",
  },
  {
    name: "Rahul Verma",
    role: "Library Administrator",
    content: "Managing inventory and requests has never been easier. The admin dashboard is a game-changer.",
    rating: 5,
    avatar: "RV",
  },
  {
    name: "Ananya Patel",
    role: "Literature Student",
    content: "The mood-based search feature helps me find exactly what I need for my research every time.",
    rating: 5,
    avatar: "AP",
  },
];

const Landing = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/8 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-0 left-20 w-72 h-72 bg-accent/8 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />

        <div className="container relative py-28 md:py-40">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full glass-card text-sm font-medium text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Library Management System
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeUp}
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-[1.08] mb-6"
            >
              Your Library,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                Reimagined
              </span>{" "}
              with AI
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              custom={2}
              variants={fadeUp}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Discover, borrow, and manage books with intelligent recommendations,
              smart search, and a personal AI assistant — all in one platform.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              custom={3}
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" asChild className="gradient-primary text-primary-foreground rounded-xl text-base px-8 shadow-lg hover:shadow-xl transition-all glow-primary">
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-xl text-base px-8 glass-card border-border/50">
                <Link to="/login">Sign In</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-surface/30">
        <div className="container py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="text-center group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 md:py-32">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-wider">
              Features
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From AI-powered discovery to seamless management — LibraAI brings the future of libraries to your fingertips.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
                <Card className="h-full glass-card border-0 hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color} mb-5 transition-all duration-300`}>
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display font-semibold text-foreground text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-32 bg-surface/30">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-accent/10 text-accent text-xs font-medium uppercase tracking-wider">
              How It Works
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              Get Started in 3 Steps
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simple onboarding — create, discover, and borrow in minutes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", icon: Users, title: "Create Account", desc: "Sign up in seconds with your email and college ID." },
              { step: "02", icon: Search, title: "Discover Books", desc: "Browse, search, or ask our AI to find the perfect read." },
              { step: "03", icon: BookOpen, title: "Borrow & Enjoy", desc: "Add to shelf, request borrowing, and track everything." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="text-center group"
              >
                <div className="relative inline-flex h-20 w-20 items-center justify-center rounded-3xl gradient-primary text-primary-foreground mb-6 mx-auto shadow-lg group-hover:shadow-xl transition-shadow glow-primary">
                  <item.icon className="h-8 w-8" />
                  <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold shadow-md">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-foreground text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-warning/10 text-warning text-xs font-medium uppercase tracking-wider">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              Loved by Students & Librarians
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
                <Card className="h-full glass-card border-0 hover:scale-[1.02] transition-transform duration-300">
                  <CardContent className="p-6">
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                      "{t.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                        {t.avatar}
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="max-w-4xl mx-auto text-center gradient-primary rounded-3xl px-8 py-20 md:px-16 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
                Ready to Transform Your Library?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">
                Join thousands of students and librarians already using LibraAI for a smarter library experience.
              </p>
              <Button
                size="lg"
                asChild
                className="bg-white text-primary hover:bg-white/90 rounded-xl text-base px-8 shadow-xl"
              >
                <Link to="/register">
                  Start for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Landing;
