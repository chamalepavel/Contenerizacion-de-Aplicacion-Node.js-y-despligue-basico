import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetail from './pages/EventDetail';
import MyTickets from './pages/MyTickets';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

const PrivateRoute = ({ children, adminOnly = false }) => {
    const { user, isAdmin } = useAuth();
    
    if (!user) {
        return <Navigate to="/login" />;
    }
    
    if (adminOnly && !isAdmin()) {
        return <Navigate to="/" />;
    }
    
    return children;
};

function AppContent() {
    return (
        <Router>
            <div className="App">
                <Navbar />
                <div className="container">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/events/:id" element={<EventDetail />} />
                        <Route 
                            path="/my-tickets" 
                            element={
                                <PrivateRoute>
                                    <MyTickets />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/admin" 
                            element={
                                <PrivateRoute adminOnly={true}>
                                    <AdminDashboard />
                                </PrivateRoute>
                            } 
                        />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
