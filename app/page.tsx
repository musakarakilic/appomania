"use client"

import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/login-button";
import { Calendar, ArrowRight, LogOut, CalendarDays, Users, CheckCircle, Star } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import Image from "next/image";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function Home() {
  const { data: session, status } = useSession();
  const user = useCurrentUser();

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0A0F1C]">
        <div className="w-6 h-6 border-2 border-primary border-solid rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  const isAuthenticated = status === "authenticated" && user;

  return (
    <div className="h-screen bg-[#EEF2FF] flex flex-col">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-[#7A9CEF]/20">
        <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-[#1330BE]">Appo</span>
            <span className="text-[#7A9CEF]">Mania</span>
          </Link>
          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              <Link 
                href="/appointments"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1330BE] text-white hover:bg-[#7A9CEF] hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <CalendarDays className="w-4 h-4" />
                <span>My Appointments</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="p-2 rounded-full text-[#1330BE] hover:bg-[#1330BE] hover:text-white transform hover:scale-110 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <LoginButton>
              <Button className="bg-[#1330BE] text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                Sign In
              </Button>
            </LoginButton>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-stretch mt-16">
        {/* Left Side */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-1/2 p-12 flex flex-col justify-center"
        >
          <div className="max-w-xl">
            <h1 className={cn("text-6xl font-bold leading-tight mb-6", font.className)}>
              <span className="bg-gradient-to-r from-[#1330BE] via-[#7A9CEF] to-[#1330BE] text-transparent bg-clip-text">
                Transform
              </span>
              <br />
              <span className="text-[#1330BE]">Your Business Digital</span>
            </h1>
            <p className="text-[#1330BE]/80 text-lg mb-8 leading-relaxed">
              Elevate your business with our premium appointment management system. 
              Deliver exceptional customer experiences and drive growth.
            </p>

            <div className="flex items-center gap-4 mb-12">
              <LoginButton>
                <Button className="group relative bg-[#1330BE] text-white px-8 py-6 rounded-full hover:ring-2 hover:ring-[#1330BE] hover:ring-offset-2 hover:ring-offset-[#EEF2FF] transform hover:-translate-y-0.5 transition-all duration-200">
                  <span className="flex items-center">
                    Get Started Now
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </LoginButton>
              <Link 
                href="/about" 
                className="px-6 py-3 text-[#1330BE] rounded-full hover:bg-[#1330BE] hover:text-white transition-all duration-200"
              >
                Learn More
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: Users, number: "500+", label: "Active Businesses" },
                { icon: CalendarDays, number: "50K+", label: "Monthly Bookings" },
                { icon: Star, number: "99%", label: "Satisfaction Rate" },
              ].map(({ icon: Icon, number, label }, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white border border-[#7A9CEF]/20 text-center hover:shadow-lg transition-all duration-200">
                  <Icon className="w-6 h-6 text-[#1330BE] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-[#1330BE]">{number}</div>
                  <div className="text-sm text-[#1330BE]/70">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Side */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-1/2 relative overflow-hidden bg-gradient-to-br from-[#EEF2FF] to-white"
        >
          <div className="absolute inset-0">
            <div className="absolute top-1/4 -right-24 w-96 h-96 bg-[#7A9CEF] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-[#1330BE] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
          </div>
          <div className="relative h-full flex items-center justify-center p-12">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-[#7A9CEF]/20">
              <div className="p-6 bg-[#1330BE] text-white">
                <h3 className="text-xl font-semibold mb-2">My Appointments</h3>
                <p className="text-sm opacity-80">Today, March 21</p>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { time: "09:00", name: "John Smith", service: "Haircut" },
                  { time: "10:30", name: "Emma Wilson", service: "Manicure" },
                  { time: "14:15", name: "Michael Brown", service: "Beard Trim" },
                ].map((apt, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#EEF2FF] transition-colors">
                    <div className="w-16 text-sm font-medium text-[#1330BE]">{apt.time}</div>
                    <div>
                      <div className="font-medium text-[#1330BE]">{apt.name}</div>
                      <div className="text-sm text-[#1330BE]/70">{apt.service}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}


/*
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/login-button";

const font= Poppins({
  subsets: ["latin"],
  weight: ["600"]
})

export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center 
    bg-[radial-gradient(ellipse_at_top,__var(--tw-gradient-stops))] from-[#212cff] to-[#cbe0de]">
      <div className="space-y-6 text-center">
        <h1 className={cn(
          "text-6xl font-semibold text-white drop-shadow-md", 
          font.className,
          )}>
         Key Auth
        </h1>
        <p className="text-white text-lg">
          A simple authentication service
        </p>
        <div>
          <LoginButton >
          <Button variant="outline" size="lg">
            Sign In
          </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  );
}
*/
