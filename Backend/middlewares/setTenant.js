import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

/**
 * Middleware to ensure the tenant (hacienda) identifier is available on the request.
 * It expects either `req.user` (populated by the authentication middleware) or a
 * valid JWT token in the `Authorization` header. The tenant id is stored in
 * `req.tenantId` for downstream model calls.
 */
export const setTenant = async (req, res, next) => {
  try {
    // If the authentication middleware already set req.user, reuse it.
    if (req.user && (req.user.hacienda_id || req.user.haciendaId)) {
      req.tenantId = req.user.hacienda_id || req.user.haciendaId;
      return next();
    }

    // Otherwise, decode the token directly.
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) {
      return res.status(401).json({ success: false, error: 'Token no proporcionado para tenant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tenantId = decoded.hacienda_id || decoded.haciendaId;
    if (!tenantId) {
      return res.status(400).json({ success: false, error: 'Tenant identifier missing in token' });
    }
    req.tenantId = tenantId;
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';
    console.error(`❌ Error en setTenant: ${err.message}`);
    return res.status(401).json({ success: false, error: message });
  }
};
