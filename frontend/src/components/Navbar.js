import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    🎫 EventoPlatform
                </Link>
                
                <ul className="nav-menu">
                    <li className="nav-item">
                        <Link to="/" className="nav-link">Eventos</Link>
                    </li>
                    
                    {user ? (
                        <>
                            <li className="nav-item">
                                <Link to="/my-tickets" className="nav-link">Mis Boletos</Link>
                            </li>
                            
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link to="/admin" className="nav-link">Admin</Link>
                                </li>
                            )}
                            
                            <li className="nav-item">
                                <span className="nav-user">👤 {user.nombre}</span>
                            </li>
                            
                            <li className="nav-item">
                                <button onClick={handleLogout} className="nav-button">
                                    Cerrar Sesión
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="nav-item">
                                <Link to="/login" className="nav-link">Iniciar Sesión</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/register" className="nav-button">Registrarse</Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
