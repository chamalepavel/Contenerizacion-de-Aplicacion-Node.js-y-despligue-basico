import React, { useState, useEffect } from 'react';
import api from '../config/api';
import './MyTickets.css';

const MyTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await api.get('/tickets/my-tickets');
            setTickets(response.data.data);
        } catch (error) {
            console.error('Error al cargar boletos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (ticketId) => {
        if (!window.confirm('¿Estás seguro de cancelar este boleto?')) {
            return;
        }

        try {
            await api.delete(`/tickets/${ticketId}`);
            alert('Boleto cancelado exitosamente');
            fetchTickets();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al cancelar boleto');
        }
    };

    const getStatusBadge = (estado) => {
        const badges = {
            pagado: { text: 'Pagado', class: 'status-paid' },
            usado: { text: 'Usado', class: 'status-used' },
            cancelado: { text: 'Cancelado', class: 'status-cancelled' },
            reservado: { text: 'Reservado', class: 'status-reserved' }
        };
        return badges[estado] || { text: estado, class: '' };
    };

    if (loading) {
        return <div className="loading">Cargando boletos...</div>;
    }

    return (
        <div className="my-tickets">
            <h1>Mis Boletos</h1>
            
            {tickets.length === 0 ? (
                <div className="no-tickets">
                    <p>No tienes boletos aún</p>
                    <a href="/" className="browse-button">Explorar Eventos</a>
                </div>
            ) : (
                <div className="tickets-list">
                    {tickets.map(ticket => {
                        const status = getStatusBadge(ticket.estado);
                        return (
                            <div key={ticket.id} className="ticket-card">
                                <div className="ticket-header">
                                    <h3>{ticket.evento_titulo}</h3>
                                    <span className={`status-badge ${status.class}`}>
                                        {status.text}
                                    </span>
                                </div>
                                
                                <div className="ticket-details">
                                    <p><strong>Código:</strong> {ticket.codigo_boleto}</p>
                                    <p><strong>Fecha del Evento:</strong> {new Date(ticket.fecha_evento).toLocaleString()}</p>
                                    <p><strong>Ubicación:</strong> {ticket.ubicacion}</p>
                                    <p><strong>Precio Pagado:</strong> Q{ticket.precio_pagado}</p>
                                    <p><strong>Fecha de Compra:</strong> {new Date(ticket.fecha_compra).toLocaleString()}</p>
                                </div>

                                {ticket.estado === 'pagado' && (
                                    <button 
                                        onClick={() => handleCancel(ticket.id)}
                                        className="cancel-button"
                                    >
                                        Cancelar Boleto
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyTickets;
