import React from 'react';
import { GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Batches() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 animate-in fade-in pb-12"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Batches</h2>
          <p className="text-muted-foreground mt-1">Manage class schedules, timings, and batch assignments.</p>
        </div>
      </div>
      <div className="bg-card border border-border shadow-sm rounded-2xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
        <p className="text-muted-foreground max-w-md">Batch organization features will be available in the next release. You can schedule classes and assign students soon.</p>
      </div>
    </motion.div>
  );
}
