import React, { useState, useEffect } from 'react';
import api from '../config/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/dashboard/stats');
            setStats(response.data.data);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Cargando dashboard...</div>;
    }

    if (!stats) {
        return <div className="error">Error al cargar estadísticas</div>;
    }

    return (
        <div className="admin-dashboard">
            <h1>Panel de Administración</h1>
            
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>Usuarios</h3>
                        <p className="stat-number">{stats.totalUsuarios}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-info">
                        <h3>Eventos</h3>
                        <p className="stat-number">{stats.totalEventos}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🎫</div>
                    <div className="stat-info">
                        <h3>Boletos Vendidos</h3>
                        <p className="stat-number">{stats.totalBoletos}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <h3>Ingresos Totales</h3>
                        <p className="stat-number">Q{stats.ingresosTotal?.toFixed(2) || '0.00'}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🔜</div>
                    <div className="stat-info">
                        <h3>Eventos Próximos</h3>
                        <p className="stat-number">{stats.eventosProximos}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-section">
                <h2>Top 5 Eventos Más Vendidos</h2>
                <div className="top-events">
                    {stats.topEventos && stats.topEventos.length > 0 ? (
                        <table className="events-table">
                            <thead>
                                <tr>
                                    <th>Evento</th>
                                    <th>Boletos Vendidos</th>
                                    <th>Ingresos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.topEventos.map(event => (
                                    <tr key={event.id}>
                                        <td>{event.titulo}</td>
                                        <td>{event.boletos_vendidos || 0}</td>
                                        <td>Q{event.ingresos?.toFixed(2) || '0.00'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No hay datos disponibles</p>
                    )}
                </div>
            </div>

            <div className="dashboard-section">
                <h2>Ventas por Mes (Últimos 6 meses)</h2>
                <div className="sales-chart">
                    {stats.boletosporMes && stats.boletosporMes.length > 0 ? (
                        <table className="sales-table">
                            <thead>
                                <tr>
                                    <th>Mes</th>
                                    <th>Boletos Vendidos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.boletosporMes.map(item => (
                                    <tr key={item.mes}>
                                        <td>{item.mes}</td>
                                        <td>{item.cantidad}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No hay datos de ventas</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
