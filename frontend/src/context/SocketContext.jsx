import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [latestAlert, setLatestAlert] = useState(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      if (user) {
        newSocket.emit('join_user', user._id || user.id);
        if (user.role === 'GAUSHALA_OWNER' && user.gaushala) {
          const gId = typeof user.gaushala === 'object' ? user.gaushala._id || user.gaushala.id : user.gaushala;
          newSocket.emit('join_gaushala', gId);
        }
        if (user.role === 'SUPER_ADMIN') {
          newSocket.emit('join_admin');
        }
      }
    });

    newSocket.on('new_notification', (data) => {
      setLatestAlert(data);
    });

    newSocket.on('gaushala_alert', (data) => {
      setLatestAlert(data);
    });

    newSocket.on('admin_alert', (data) => {
      setLatestAlert(data);
    });

    newSocket.on('new_broadcast_request', (data) => {
      setLatestAlert({
        title: '⚡ New Broadcast Alert (5 Nearest Shelters)',
        message: `${data.requestType} #${data.trackingId} (~${data.distanceKm} km). First to accept claims it!`
      });
    });

    newSocket.on('broadcast_request_claimed', (data) => {
      setLatestAlert({
        title: '⚡ Request Claimed by Other Shelter',
        message: data.message || `Request ${data.trackingId} was accepted by ${data.claimedBy} and removed from your queue.`
      });
    });

    newSocket.on('request_accepted', (data) => {
      setLatestAlert({
        title: '✅ Request Accepted!',
        message: `${data.gaushalaName} has accepted your request (${data.trackingId}).`
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const clearAlert = () => setLatestAlert(null);

  return (
    <SocketContext.Provider value={{ socket, latestAlert, clearAlert }}>
      {children}
      {latestAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-white border-2 border-[#D6A23A] shadow-xl rounded-xl p-4 transition transform ease-out duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[#80501D]">
                GauAashray Realtime Alert
              </p>
              <h4 className="font-bold text-stone-900 mt-0.5">{latestAlert.title}</h4>
              <p className="text-sm text-stone-600 mt-1">{latestAlert.message}</p>
            </div>
            <button
              onClick={clearAlert}
              className="text-stone-400 hover:text-stone-700 ml-3 text-lg font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

