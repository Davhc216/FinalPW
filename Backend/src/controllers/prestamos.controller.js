import { prisma } from '../database/prisma.js';

// Obtener todos los préstamos de un usuario
export const getPrestamos = async (req, res) => {
  try {
    const { usuario_id } = req.query;

    if (!usuario_id) {
      return res.status(400).json({ error: 'usuario_id es requerido' });
    }

    const userId = parseInt(usuario_id);

    const prestamos = await prisma.prestamo.findMany({
      where: {
        usuarioId: userId
      },
      include: {
        usuario: {
          select: {
            nombre: true
          }
        }
      },
      orderBy: {
        fechaSolicitud: 'desc'
      }
    });

    // Formatear respuesta
    const formattedPrestamos = prestamos.map(p => ({
      ...p,
      usuario_id: p.usuarioId,
      tasa_interes: p.tasaInteres,
      plazo_meses: p.plazoMeses,
      fecha_solicitud: p.fechaSolicitud,
      fecha_aprobacion: p.fechaAprobacion,
      fecha_vencimiento: p.fechaVencimiento,
      usuario_nombre: p.usuario?.nombre
    }));

    res.json({ prestamos: formattedPrestamos });
  } catch (error) {
    console.error('Error en getPrestamos:', error);
    res.status(500).json({ error: 'Error al obtener préstamos' });
  }
};

// Obtener préstamo por ID
export const getPrestamoById = async (req, res) => {
  try {
    const { id } = req.params;

    const prestamo = await prisma.prestamo.findUnique({
      where: { id: parseInt(id) },
      include: {
        usuario: {
          select: {
            nombre: true
          }
        }
      }
    });

    if (!prestamo) {
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }

    // Formatear respuesta
    const formattedPrestamo = {
      ...prestamo,
      usuario_id: prestamo.usuarioId,
      tasa_interes: prestamo.tasaInteres,
      plazo_meses: prestamo.plazoMeses,
      fecha_solicitud: prestamo.fechaSolicitud,
      fecha_aprobacion: prestamo.fechaAprobacion,
      fecha_vencimiento: prestamo.fechaVencimiento,
      usuario_nombre: prestamo.usuario?.nombre
    };

    res.json({ prestamo: formattedPrestamo });
  } catch (error) {
    console.error('Error en getPrestamoById:', error);
    res.status(500).json({ error: 'Error al obtener préstamo' });
  }
};

// Crear préstamo
export const createPrestamo = async (req, res) => {
  try {
    const { usuario_id, monto, tasa_interes, plazo_meses } = req.body;

    if (!usuario_id) {
      return res.status(400).json({ error: 'usuario_id es requerido' });
    }

    if (!monto || monto <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    if (!plazo_meses || plazo_meses <= 0) {
      return res.status(400).json({ error: 'Plazo inválido' });
    }

    const userId = parseInt(usuario_id);
    const tasa = tasa_interes || 5.00;

    // Calcular fecha de vencimiento
    const fechaVencimiento = new Date();
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + plazo_meses);

    const prestamo = await prisma.prestamo.create({
      data: {
        usuarioId: userId,
        monto: parseFloat(monto),
        tasaInteres: parseFloat(tasa),
        plazoMeses: parseInt(plazo_meses),
        estado: 'pendiente',
        fechaVencimiento: fechaVencimiento
      }
    });

    res.status(201).json({
      message: 'Préstamo solicitado exitosamente',
      prestamo: {
        id: prestamo.id,
        monto: prestamo.monto,
        tasa_interes: prestamo.tasaInteres,
        plazo_meses: prestamo.plazoMeses,
        estado: prestamo.estado
      }
    });
  } catch (error) {
    console.error('Error en createPrestamo:', error);
    res.status(500).json({ error: 'Error al crear préstamo' });
  }
};

// Actualizar préstamo
export const updatePrestamo = async (req, res) => {
  try {
    const { id } = req.params;
    const { monto, tasa_interes, plazo_meses } = req.body;

    // Verificar que el préstamo existe
    const prestamo = await prisma.prestamo.findUnique({
      where: { id: parseInt(id) }
    });

    if (!prestamo) {
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }

    if (prestamo.estado !== 'pendiente') {
      return res.status(400).json({ 
        error: 'Solo se pueden actualizar préstamos pendientes' 
      });
    }

    const updateData = {};

    if (monto) {
      updateData.monto = parseFloat(monto);
    }

    if (tasa_interes) {
      updateData.tasaInteres = parseFloat(tasa_interes);
    }

    if (plazo_meses) {
      updateData.plazoMeses = parseInt(plazo_meses);
      
      // Recalcular fecha de vencimiento
      const fechaVencimiento = new Date();
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + parseInt(plazo_meses));
      updateData.fechaVencimiento = fechaVencimiento;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    await prisma.prestamo.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({ message: 'Préstamo actualizado exitosamente' });
  } catch (error) {
    console.error('Error en updatePrestamo:', error);
    res.status(500).json({ error: 'Error al actualizar préstamo' });
  }
};

// Aprobar préstamo
export const aprobarPrestamo = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.$transaction(async (tx) => {
      // Obtener préstamo
      const prestamo = await tx.prestamo.findUnique({
        where: { id: parseInt(id) }
      });

      if (!prestamo) {
        throw new Error('Préstamo no encontrado');
      }

      if (prestamo.estado !== 'pendiente') {
        throw new Error('Solo se pueden aprobar préstamos pendientes');
      }

      // Actualizar estado del préstamo
      await tx.prestamo.update({
        where: { id: parseInt(id) },
        data: {
          estado: 'aprobado',
          fechaAprobacion: new Date()
        }
      });

      // Acreditar el monto al usuario
      await tx.usuario.update({
        where: { id: prestamo.usuarioId },
        data: {
          saldo: {
            increment: prestamo.monto
          }
        }
      });

      // Crear transacción de depósito
      await tx.transaccion.create({
        data: {
          usuarioId: prestamo.usuarioId,
          tipo: 'deposito',
          monto: prestamo.monto,
          descripcion: `Préstamo aprobado #${id}`
        }
      });
    });

    res.json({ message: 'Préstamo aprobado exitosamente' });
  } catch (error) {
    console.error('Error en aprobarPrestamo:', error);
    if (error.message === 'Préstamo no encontrado') {
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }
    if (error.message === 'Solo se pueden aprobar préstamos pendientes') {
      return res.status(400).json({ error: 'Solo se pueden aprobar préstamos pendientes' });
    }
    res.status(500).json({ error: 'Error al aprobar préstamo' });
  }
};

// Rechazar préstamo
export const rechazarPrestamo = async (req, res) => {
  try {
    const { id } = req.params;

    const prestamo = await prisma.prestamo.findUnique({
      where: { id: parseInt(id) }
    });

    if (!prestamo) {
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }

    if (prestamo.estado !== 'pendiente') {
      return res.status(400).json({ 
        error: 'Solo se pueden rechazar préstamos pendientes' 
      });
    }

    await prisma.prestamo.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'rechazado'
      }
    });

    res.json({ message: 'Préstamo rechazado exitosamente' });
  } catch (error) {
    console.error('Error en rechazarPrestamo:', error);
    res.status(500).json({ error: 'Error al rechazar préstamo' });
  }
};
