import Layout from "@/components/layout/Layout";
import { BookOpen, Brain, Shield, Users, Star, Clock, MessageSquare, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const features = [
  { icon: BookOpen, title: "Book Borrowing", desc: "Browse, borrow, and return books with a seamless digital workflow." },
  { icon: Brain, title: "AI-Powered Assistant", desc: "Get personalized recommendations, search books, and fetch news via LibraAI." },
  { icon: Search, title: "Smart Search", desc: "Find books by title, author, ISBN, or category with instant results." },
  { icon: Star, title: "Reviews & Ratings", desc: "Read and write reviews to help fellow readers discover great books." },
  { icon: Shield, title: "Admin Dashboard", desc: "Manage inventory, users, borrow requests, and penalties from one place." },
  { icon: Clock, title: "Real-time Notifications", desc: "Stay updated on due dates, approvals, and library announcements." },
  { icon: Users, title: "Multi-User Support", desc: "Supports students, faculty, and administrators with role-based access." },
  { icon: MessageSquare, title: "Chat History", desc: "Your AI conversations persist across sessions and devices." },
];

const About = () => (
  <Layout>
    <div className="container py-16 space-y-16">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <BookOpen className="h-4 w-4" /> About LibraAI
        </div>
        <h1 className="text-4xl font-bold text-foreground">
          Intelligent Library Management for <span className="text-primary">RGUKT Ongole</span>
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          LibraAI is an AI-powered library management system designed to make book discovery, borrowing, and management effortless for students and faculty. Built with modern technology, it combines smart search, personalized recommendations, and real-time updates.
        </p>
      </motion.div>

      {/* Features grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/50 h-full hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Purpose */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-card border border-border/50 rounded-2xl p-8 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-foreground mb-4">Our Purpose</h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>LibraAI was created to modernize the college library experience. Traditional library systems are often slow, paper-based, and difficult to navigate. We built LibraAI to solve these challenges.</p>
          <p><strong className="text-foreground">For Students:</strong> Quickly find and borrow books, get AI-powered study recommendations, and track your reading history — all from any device.</p>
          <p><strong className="text-foreground">For Administrators:</strong> Manage book inventory, handle borrow requests, track penalties, and monitor analytics with an intuitive dashboard.</p>
          <p><strong className="text-foreground">For Everyone:</strong> A faster, smarter, and more accessible library experience powered by artificial intelligence.</p>
        </div>
      </motion.div>
    </div>
  </Layout>
);

export default About;
