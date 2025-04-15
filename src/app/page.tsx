"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { WaitlistForm } from "~/app/components/waitlist-form";
import { Globe } from "~/app/components/globe";

export default function LandingPage() {
  const router = useRouter();
  const [showWaitlist, setShowWaitlist] = useState(false);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
        {/* Globe background with darkened overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/30 z-10"></div> {/* Dark overlay */}
          <Globe />
        </div>
        
        {/* Content with improved visibility */}
        <div className="relative z-20 mx-auto max-w-4xl px-6 text-center">
          <div className="backdrop-blur-sm bg-black/40 rounded-2xl p-8 shadow-2xl animate-fade-in">
            <h1 className="mb-6 font-nunito text-5xl font-extrabold leading-tight tracking-tight text-white md:text-7xl animate-slide-up">
              The Future of <span className="text-blue-400 drop-shadow-md">Global</span> Payments
            </h1>
            <p className="mb-10 text-xl text-white font-medium drop-shadow-md max-w-2xl mx-auto animate-slide-up" style={{animationDelay: "0.2s"}}>
              Send money instantly to anyone, anywhere in the world without fees or borders.
              Backed by secure blockchain technology.
            </p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-6 sm:space-y-0 animate-slide-up" style={{animationDelay: "0.4s"}}>
              <Button 
                onClick={() => router.push("/auth/signin")}
                className="bg-blue-600 px-10 py-6 text-lg font-semibold hover:bg-blue-700 hover:scale-105 transition-all"
                size="lg"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => router.push("/auth/signup")}
                variant="outline" 
                className="border-2 border-blue-500 px-10 py-6 text-lg font-semibold text-blue-400 hover:bg-blue-500/20 hover:scale-105 transition-all"
                size="lg"
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced with more visual appeal */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="mb-16 text-center text-4xl font-bold text-white">Why Choose <span className="text-blue-400">Druid</span></h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-8 shadow-xl border border-white/10 transform hover:scale-105 transition-all duration-300 text-white">
              <h3 className="mb-4 text-2xl font-semibold text-blue-300">No Hidden Fees</h3>
              <p className="text-gray-200 text-lg">
                Send money internationally without expensive transfer fees or hidden charges.
              </p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-8 shadow-xl border border-white/10 transform hover:scale-105 transition-all duration-300 text-white">
              <h3 className="mb-4 text-2xl font-semibold text-blue-300">Instant Transfers</h3>
              <p className="text-gray-200 text-lg">
                Money arrives in seconds, not days. No more waiting for international clearance.
              </p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-8 shadow-xl border border-white/10 transform hover:scale-105 transition-all duration-300 text-white">
              <h3 className="mb-4 text-2xl font-semibold text-blue-300">Bank-Level Security</h3>
              <p className="text-gray-200 text-lg">
                Your funds are protected with state-of-the-art encryption and blockchain technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section - Enhanced with subtle animations */}
      <section className="bg-gradient-to-b from-blue-900 to-blue-800 py-24 text-white">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-6 text-4xl font-bold">Coming Soon: Banking Features</h2>
            <p className="mb-10 text-xl">
              We're adding direct bank transfers, virtual cards, and more. Join our waitlist to be the first to know.
            </p>
            {showWaitlist ? (
              <div className="rounded-xl bg-white/10 backdrop-blur-sm p-8 shadow-xl border border-white/10 animate-fade-in">
                <WaitlistForm />
              </div>
            ) : (
              <Button
                onClick={() => setShowWaitlist(true)}
                className="bg-white px-10 py-6 text-xl text-blue-900 hover:bg-gray-100 hover:scale-105 transition-all animate-pulse-slow"
                size="lg"
              >
                Join the Waitlist
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer - Redesigned for better consistency */}
      <footer className="bg-gray-900 py-16 text-center text-white">
        <div className="container mx-auto px-6">
          <p className="mb-3 text-3xl font-bold text-blue-400">Druid</p>
          <p className="mb-8 text-lg text-gray-300">
            Send money instantly to anyone, anywhere.
          </p>
          <div className="mb-10 flex justify-center space-x-8">
            <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Terms</a>
            <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Privacy</a>
            <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Contact</a>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Druid. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
