import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, User, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { EmptyState } from '../components/ui/empty-state';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    (s.name && s.name.toLowerCase().includes(search.toLowerCase())) || 
    (s.email && s.email.toLowerCase().includes(search.toLowerCase())) ||
    (s.phone && s.phone.includes(search))
  );

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Students Directory</h2>
          <p className="text-muted-foreground mt-1">Manage enrollments, statuses, and contact information.</p>
        </div>
        <Button className="rounded-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all ml-auto hover:shadow-lg hover:-translate-y-0.5">
          <Plus className="w-5 h-5 mr-2" /> Add Student
        </Button>
      </div>

      <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between bg-muted/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-full bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-sm transition-all"
            />
          </div>
          <Button variant="outline" className="rounded-full shadow-sm text-muted-foreground bg-background hover:bg-muted font-medium">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[300px]"><Button variant="ghost" className="p-0 hover:bg-transparent font-semibold flex items-center gap-2">Name <ArrowUpDown className="w-3 h-3" /></Button></TableHead>
              <TableHead className="font-semibold hidden sm:table-cell">Contact Info</TableHead>
              <TableHead className="font-semibold">Join Date</TableHead>
              <TableHead className="font-semibold text-center hidden md:table-cell">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {loading ? (
                // Skeleton Loading State
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full"/><div className="space-y-2"><Skeleton className="h-4 w-[150px]"/><Skeleton className="h-3 w-[100px]"/></div></div></TableCell>
                    <TableCell className="hidden sm:table-cell"><div className="space-y-2"><Skeleton className="h-4 w-[180px]"/><Skeleton className="h-3 w-[120px]"/></div></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]"/></TableCell>
                    <TableCell className="text-center hidden md:table-cell"><Skeleton className="h-6 w-16 mx-auto rounded-full"/></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full ml-auto"/></TableCell>
                  </TableRow>
                ))
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <motion.tr 
                    key={student.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="group hover:bg-muted/30 transition-colors border-b"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/20 to-indigo-500/20 text-primary flex items-center justify-center font-bold relative ring-1 ring-border shadow-sm">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{student.name}</p>
                          <p className="text-sm text-muted-foreground">ID: #{student.id.toString().padStart(4, '0')}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <p className="font-medium text-foreground">{student.email}</p>
                      <p className="text-sm text-muted-foreground">{student.phone}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium">
                      {new Date(student.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      <Badge variant={student.status === 'active' ? 'success' : 'secondary'} className="capitalize">
                        {student.status || 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="group-hover:bg-muted rounded-full">
                        <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 flex-col p-0 border-0">
                    <EmptyState 
                      title="No students found" 
                      description="We couldn't track down any matching students. Try adjusting your search filters."
                      action={<Button variant="outline" onClick={() => setSearch('')}>Clear Filters</Button>} 
                    />
                  </TableCell>
                </TableRow>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
        <div className="p-4 border-t border-border bg-muted/10 text-xs text-muted-foreground font-medium text-center sm:text-left flex justify-between items-center">
          <span>Showing {filteredStudents.length} of {students.length} students</span>
          <div className="hidden sm:flex gap-1">
            <Button variant="outline" size="sm" className="h-7 rounded text-xs" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="h-7 rounded text-xs">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
