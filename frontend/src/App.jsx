import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/LoginScreen';
import AdminLayout from './layout/AdminLayout.replacement';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import Courses from './pages/Courses';
import CourseProfile from './pages/CourseProfile';
import Batches from './pages/Batches';
import BatchProfile from './pages/BatchProfile';
import Fees from './pages/Fees';
import FeeLedgerProfile from './pages/FeeLedgerProfile';
import Attendance from './pages/Attendance';
import Faculty from './pages/Faculty';
import FacultyProfile from './pages/FacultyProfile';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="students/:studentId" element={<StudentProfile />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:courseId" element={<CourseProfile />} />
            <Route path="batches" element={<Batches />} />
            <Route path="batches/:batchId" element={<BatchProfile />} />
            <Route path="fees" element={<Fees />} />
            <Route path="fees/:feeId" element={<FeeLedgerProfile />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="faculty" element={<Faculty />} />
            <Route path="faculty/:facultyId" element={<FacultyProfile />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
