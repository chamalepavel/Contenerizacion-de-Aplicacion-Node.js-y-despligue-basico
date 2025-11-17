import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import './Home.css';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        categoria: '',
        page: 1
    });
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        fetchCategories();
        fetchEvents();
        // eslint-disable-next-line
    }, [filters]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data.data);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    };

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.categoria) params.append('categoria', filters.categoria);
            params.append('page', filters.page);
            params.append('limit', 9);

            const response = await api.get(`/events?${params}`);
            setEvents(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error al cargar eventos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters({ ...filters, page: 1 });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleDateString('es', { month: 'short' }).toUpperCase();
        return { day, month };
    };

    return (
        <div className="home">
            {/* Hero Section */}
            <div className="hero">
                <div className="hero-content">
                    <h1>🎭 Descubre Eventos Increíbles</h1>
                    <p>Encuentra y compra boletos para los mejores conciertos, festivales, deportes y más</p>
                </div>
            </div>

            {/* Search Section */}
            <div className="search-section">
                <div className="search-container">
                    <h2 className="search-title">Busca tu próximo evento</h2>
                    <form onSubmit={handleSearch} className="search-filters">
                        <div className="search-input-group">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Buscar eventos, artistas, lugares..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="search-input"
                            />
                        </div>
                        <select
                            value={filters.categoria}
                            onChange={(e) => setFilters({ ...filters, categoria: e.target.value, page: 1 })}
                            className="search-select"
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                            ))}
                        </select>
                        <button type="submit" className="search-button">
                            Buscar Eventos
                        </button>
                    </form>
                </div>
            </div>

            {/* Events Section */}
            <div className="events-section">
                <div className="section-header">
                    <h2 className="section-title">Eventos Destacados</h2>
                    {pagination.total > 0 && (
                        <span className="events-count">
                            {pagination.total} {pagination.total === 1 ? 'evento' : 'eventos'} encontrados
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : events.length === 0 ? (
                    <div className="no-events">
                        <div className="no-events-icon">🎫</div>
                        <h3>No se encontraron eventos</h3>
                        <p>Intenta ajustar tus filtros de búsqueda</p>
                    </div>
                ) : (
                    <>
                        <div className="events-grid">
                            {events.map(event => {
                                const { day, month } = formatDate(event.fecha_evento);
                                return (
                                    <Link 
                                        to={`/events/${event.id}`} 
                                        key={event.id} 
                                        className="event-card"
                                    >
                                        <div className="event-image-container">
                                            {event.imagen ? (
                                                <img 
                                                    src={`http://localhost:5000/uploads/${event.imagen}`} 
                                                    alt={event.titulo}
                                                    className="event-image"
                                                />
                                            ) : (
                                                <div className="event-image" style={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '64px'
                                                }}>
                                                    🎭
                                                </div>
                                            )}
                                            {event.boletos_disponibles < 50 && event.boletos_disponibles > 0 && (
                                                <div className="event-badge">¡Últimos boletos!</div>
                                            )}
                                            {event.boletos_disponibles === 0 && (
                                                <div className="event-badge" style={{background: '#ef4444'}}>Agotado</div>
                                            )}
                                            <div className="event-date-badge">
                                                <div className="event-date-day">{day}</div>
                                                <div className="event-date-month">{month}</div>
                                            </div>
                                        </div>
                                        <div className="event-content">
                                            <span className="event-category">
                                                {event.categoria_nombre || 'General'}
                                            </span>
                                            <h3 className="event-title">{event.titulo}</h3>
                                            <p className="event-description">
                                                {event.descripcion || 'Evento increíble que no te puedes perder'}
                                            </p>
                                            <div className="event-footer">
                                                <div className="event-location">
                                                    <span>📍</span>
                                                    <span>{event.ubicacion}</span>
                                                </div>
                                                <div>
                                                    <div className="event-price">Q{event.precio}</div>
                                                    <div className="event-price-label">por boleto</div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {pagination.totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                    disabled={filters.page === 1}
                                    className="pagination-button"
                                >
                                    ← Anterior
                                </button>
                                <span className="pagination-info">
                                    Página {pagination.page} de {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                    disabled={filters.page === pagination.totalPages}
                                    className="pagination-button"
                                >
                                    Siguiente →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Home;
