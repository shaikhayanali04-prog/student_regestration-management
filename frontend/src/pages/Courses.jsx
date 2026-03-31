import React from 'react';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Courses() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 animate-in fade-in pb-12"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Courses Management</h2>
          <p className="text-muted-foreground mt-1">View and manage all your offered courses and curriculums.</p>
        </div>
      </div>
      <div className="bg-card border border-border shadow-sm rounded-2xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
        <p className="text-muted-foreground max-w-md">The courses module is under development. You'll be able to create, edit, and organize all your courses here.</p>
      </div>
    </motion.div>
  );
}
