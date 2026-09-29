import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-md w-full p-8 rounded-3xl border border-border bg-card text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-primary">
            Error 404
          </span>
          <h1 className="text-3xl font-black tracking-tight">Page Not Found</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The page or resume you are looking for doesn&apos;t exist, has been moved, or is private.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full text-xs gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </Button>
          </Link>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="radiant" className="w-full text-xs gap-1.5">
              <Home className="w-3.5 h-3.5" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
