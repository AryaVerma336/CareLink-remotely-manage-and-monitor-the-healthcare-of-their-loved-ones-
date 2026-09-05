import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { db } from '../config/db';

export function setupSocketIO(io: Server) {
  io.on('connection', (socket: Socket) => {
    logger.info(`Socket client connected: ${socket.id}`);

    // Join trip room for live tracking
    socket.on('join_trip', (tripId: string) => {
      socket.join(`trip_${tripId}`);
      logger.info(`Socket ${socket.id} joined tracking room trip_${tripId}`);
    });

    // Driver updates GPS coordinates live
    socket.on('update_location', (data: { tripId: string; lat: number; lng: number; status?: string }) => {
      const { tripId, lat, lng, status } = data;

      try {
        db.prepare('UPDATE trips SET driver_lat = ?, driver_lng = ? WHERE id = ?').run(lat, lng, tripId);
        
        // Broadcast location to relative & patient in the trip room
        io.to(`trip_${tripId}`).emit('location_updated', {
          tripId,
          lat,
          lng,
          status,
          timestamp: new Date().toISOString(),
        });
      } catch (err: any) {
        logger.error(`Failed to update socket location for trip ${tripId}: ${err.message}`);
      }
    });

    // Emergency SOS Alert broadcast
    socket.on('trigger_sos', (sosData: { patientName: string; lat: number; lng: number; address: string }) => {
      logger.warn(`🚨 EMERGENCY SOS BROADCAST via Socket from ${sosData.patientName}`);
      io.emit('emergency_sos_broadcast', {
        ...sosData,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket client disconnected: ${socket.id}`);
    });
  });
}
