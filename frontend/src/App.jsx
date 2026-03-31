import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Courses from './pages/Courses';
import Batches from './pages/Batches';
import Fees from './pages/Fees';
import Attendance from './pages/Attendance';
import Landing from './pages/Landing';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="courses" element={<Courses />} />
          <Route path="batches" element={<Batches />} />
          <Route path="fees" element={<Fees />} />
          <Route path="attendance" element={<Attendance />} />
        </Route>

        <Route path="/" element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;
