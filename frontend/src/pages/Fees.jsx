import React from 'react';
import { DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Fees() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 animate-in fade-in pb-12"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Fee Collection</h2>
          <p className="text-muted-foreground mt-1">Manage payments, invoices, and financial records.</p>
        </div>
      </div>
      <div className="bg-card border border-border shadow-sm rounded-2xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <DollarSign className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
        <p className="text-muted-foreground max-w-md">Fee module is on the roadmap. Record payments and generate receipts for your students efficiently right from this dashboard.</p>
      </div>
    </motion.div>
  );
}
