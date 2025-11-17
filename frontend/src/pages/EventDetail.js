import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import './EventDetail.css';

const EventDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cantidad, setCantidad] = useState(1);
    const [purchasing, setPurchasing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchEvent();
        // eslint-disable-next-line
    }, [id]);

    const fetchEvent = async () => {
        try {
            const response = await api.get(`/events/${id}`);
            setEvent(response.data.data);
        } catch (error) {
            console.error('Error al cargar evento:', error);
            setMessage({ type: 'error', text: 'Error al cargar el evento' });
            setTimeout(() => navigate('/'), 2000);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async () => {
        if (!user) {
            setMessage({ type: 'error', text: 'Debes iniciar sesión para comprar boletos' });
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        if (cantidad < 1 || cantidad > event.boletos_disponibles) {
            setMessage({ type: 'error', text: 'Cantidad inválida' });
            return;
        }

        setPurchasing(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.post('/tickets/purchase', {
                evento_id: event.id,
                cantidad: parseInt(cantidad),
                metodo_pago: 'efectivo'
            });

            setMessage({ 
                type: 'success', 
                text: `¡Compra exitosa! Total: Q${response.data.data.total}` 
            });
            
            setTimeout(() => navigate('/my-tickets'), 2000);
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Error al comprar boletos' 
            });
        } finally {
            setPurchasing(false);
        }
    };

    const incrementQuantity = () => {
        if (cantidad < Math.min(event.boletos_disponibles, 10)) {
            setCantidad(cantidad + 1);
        }
    };

    const decrementQuantity = () => {
        if (cantidad > 1) {
            setCantidad(cantidad - 1);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getAvailabilityStatus = () => {
        if (event.boletos_disponibles === 0) {
            return { class: 'sold-out', text: '🚫 Agotado', icon: '🚫' };
        } else if (event.boletos_disponibles < 50) {
            return { class: 'limited', text: '⚠️ Últimos boletos', icon: '⚠️' };
        } else {
            return { class: 'available', text: '✅ Disponible', icon: '✅' };
        }
    };

    if (loading) {
        return (
            <div className="event-detail">
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="event-detail">
                <div className="loading-container">
                    <h2>Evento no encontrado</h2>
                </div>
            </div>
        );
    }

    const availability = getAvailabilityStatus();

    return (
        <div className="event-detail">
            {/* Hero Section */}
            <div className="event-hero">
                {event.imagen ? (
                    <img 
                        src={`http://localhost:5000/uploads/${event.imagen}`} 
                        alt={event.titulo}
                        className="event-hero-image"
                    />
                ) : (
                    <div className="event-hero-image" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}></div>
                )}
                <div className="event-hero-overlay">
                    <div className="event-hero-content">
                        <span className="event-category-badge">
                            {event.categoria_nombre || 'General'}
                        </span>
                        <h1 className="event-hero-title">{event.titulo}</h1>
                        <div className="event-hero-meta">
                            <div className="event-hero-meta-item">
                                <span>📅</span>
                                <span>{formatDate(event.fecha_evento)}</span>
                            </div>
                            <div className="event-hero-meta-item">
                                <span>📍</span>
                                <span>{event.ubicacion}</span>
                            </div>
                            <div className="event-hero-meta-item">
                                <span>👤</span>
                                <span>{event.organizador_nombre}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="event-content">
                <div className="event-grid">
                    {/* Event Info */}
                    <div className="event-info-card">
                        {message.text && (
                            <div className={`alert alert-${message.type}`}>
                                <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
                                {message.text}
                            </div>
                        )}

                        <div className="event-section">
                            <h2 className="event-section-title">
                                <span>📝</span>
                                Descripción del Evento
                            </h2>
                            <p className="event-description">
                                {event.descripcion || 'Un evento increíble que no te puedes perder. Disfruta de una experiencia única llena de entretenimiento y diversión.'}
                            </p>
                        </div>

                        <div className="event-section">
                            <h2 className="event-section-title">
                                <span>ℹ️</span>
                                Información del Evento
                            </h2>
                            <div className="event-details-list">
                                <div className="event-detail-item">
                                    <span className="event-detail-icon">📅</span>
                                    <div className="event-detail-content">
                                        <div className="event-detail-label">Fecha y Hora</div>
                                        <div className="event-detail-value">
                                            {formatDate(event.fecha_evento)}
                                        </div>
                                    </div>
                                </div>

                                <div className="event-detail-item">
                                    <span className="event-detail-icon">📍</span>
                                    <div className="event-detail-content">
                                        <div className="event-detail-label">Ubicación</div>
                                        <div className="event-detail-value">{event.ubicacion}</div>
                                    </div>
                                </div>

                                <div className="event-detail-item">
                                    <span className="event-detail-icon">👤</span>
                                    <div className="event-detail-content">
                                        <div className="event-detail-label">Organizador</div>
                                        <div className="event-detail-value">{event.organizador_nombre}</div>
                                    </div>
                                </div>

                                <div className="event-detail-item">
                                    <span className="event-detail-icon">🎫</span>
                                    <div className="event-detail-content">
                                        <div className="event-detail-label">Capacidad</div>
                                        <div className="event-detail-value">
                                            {event.boletos_disponibles} disponibles de {event.capacidad_total}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Card */}
                    <div className="event-booking-card">
                        <div className="event-price-section">
                            <div className="event-price-label">Precio por boleto</div>
                            <div className="event-price">
                                <span className="event-price-currency">Q</span>
                                {event.precio}
                            </div>
                        </div>

                        <div className={`event-availability ${availability.class}`}>
                            <span>{availability.icon}</span>
                            <span>{availability.text}</span>
                        </div>

                        {event.boletos_disponibles > 0 ? (
                            <form className="booking-form" onSubmit={(e) => { e.preventDefault(); handlePurchase(); }}>
                                <div className="quantity-selector">
                                    <label>Cantidad de boletos</label>
                                    <div className="quantity-controls">
                                        <button 
                                            type="button"
                                            className="quantity-button"
                                            onClick={decrementQuantity}
                                            disabled={cantidad <= 1}
                                        >
                                            −
                                        </button>
                                        <span className="quantity-display">{cantidad}</span>
                                        <button 
                                            type="button"
                                            className="quantity-button"
                                            onClick={incrementQuantity}
                                            disabled={cantidad >= Math.min(event.boletos_disponibles, 10)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="total-section">
                                    <div className="total-label">Total a pagar</div>
                                    <div className="total-amount">
                                        Q{(event.precio * cantidad).toFixed(2)}
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    className="book-button"
                                    disabled={purchasing}
                                >
                                    {purchasing ? '⏳ Procesando...' : '🎫 Comprar Boletos'}
                                </button>

                                <p className="booking-note">
                                    Al comprar, aceptas nuestros términos y condiciones. 
                                    Recibirás tus boletos por correo electrónico.
                                </p>
                            </form>
                        ) : (
                            <div className="booking-note" style={{ textAlign: 'center', padding: '20px' }}>
                                <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--error-color)' }}>
                                    Lo sentimos, este evento está agotado
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
