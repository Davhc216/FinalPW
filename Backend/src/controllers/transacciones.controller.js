import { prisma } from '../database/prisma.js';

// Obtener todas las transacciones de un usuario
export const getTransacciones = async (req, res) => {
  try {
    const { usuario_id } = req.query;

    if (!usuario_id) {
      return res.status(400).json({ error: 'usuario_id es requerido' });
    }

    const userId = parseInt(usuario_id);

    const transacciones = await prisma.transaccion.findMany({
      where: {
        OR: [
          { usuarioId: userId },
          { usuarioDestinoId: userId }
        ]
      },
      include: {
        usuario: {
          select: {
            nombre: true
          }
        },
        usuarioDestino: {
          select: {
            nombre: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formatear respuesta para mantener compatibilidad
    const formattedTransacciones = transacciones.map(t => ({
      ...t,
      usuario_id: t.usuarioId,
      usuario_destino_id: t.usuarioDestinoId,
      created_at: t.createdAt,
      usuario_nombre: t.usuario?.nombre,
      usuario_destino_nombre: t.usuarioDestino?.nombre
    }));

    res.json({ transacciones: formattedTransacciones });
  } catch (error) {
    console.error('Error en getTransacciones:', error);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
};

// Obtener transacción por ID
export const getTransaccionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaccion = await prisma.transaccion.findUnique({
      where: { id: parseInt(id) },
      include: {
        usuario: {
          select: {
            nombre: true
          }
        },
        usuarioDestino: {
          select: {
            nombre: true
          }
        }
      }
    });

    if (!transaccion) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    // Formatear respuesta
    const formattedTransaccion = {
      ...transaccion,
      usuario_id: transaccion.usuarioId,
      usuario_destino_id: transaccion.usuarioDestinoId,
      created_at: transaccion.createdAt,
      usuario_nombre: transaccion.usuario?.nombre,
      usuario_destino_nombre: transaccion.usuarioDestino?.nombre
    };

    res.json({ transaccion: formattedTransaccion });
  } catch (error) {
    console.error('Error en getTransaccionById:', error);
    res.status(500).json({ error: 'Error al obtener transacción' });
  }
};

// Crear depósito
export const createDeposito = async (req, res) => {
  try {
    const { usuario_id, monto, descripcion } = req.body;

    if (!usuario_id) {
      return res.status(400).json({ error: 'usuario_id es requerido' });
    }

    if (!monto || monto <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    const userId = parseInt(usuario_id);

    await prisma.$transaction(async (tx) => {
      // Crear transacción
      await tx.transaccion.create({
        data: {
          usuarioId: userId,
          tipo: 'deposito',
          monto: parseFloat(monto),
          descripcion: descripcion || 'Depósito'
        }
      });

      // Actualizar saldo
      await tx.usuario.update({
        where: { id: userId },
        data: {
          saldo: {
            increment: parseFloat(monto)
          }
        }
      });
    });

    res.status(201).json({ 
      message: 'Depósito realizado exitosamente',
      monto 
    });
  } catch (error) {
    console.error('Error en createDeposito:', error);
    res.status(500).json({ error: 'Error al realizar depósito' });
  }
};

// Crear retiro
export const createRetiro = async (req, res) => {
  try {
    const { usuario_id, monto, descripcion } = req.body;

    if (!usuario_id) {
      return res.status(400).json({ error: 'usuario_id es requerido' });
    }

    if (!monto || monto <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    const userId = parseInt(usuario_id);

    await prisma.$transaction(async (tx) => {
      // Verificar saldo suficiente
      const user = await tx.usuario.findUnique({
        where: { id: userId },
        select: { saldo: true }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (user.saldo < parseFloat(monto)) {
        throw new Error('Saldo insuficiente');
      }

      // Crear transacción
      await tx.transaccion.create({
        data: {
          usuarioId: userId,
          tipo: 'retiro',
          monto: parseFloat(monto),
          descripcion: descripcion || 'Retiro'
        }
      });

      // Actualizar saldo
      await tx.usuario.update({
        where: { id: userId },
        data: {
          saldo: {
            decrement: parseFloat(monto)
          }
        }
      });
    });

    res.status(201).json({ 
      message: 'Retiro realizado exitosamente',
      monto 
    });
  } catch (error) {
    console.error('Error en createRetiro:', error);
    if (error.message === 'Saldo insuficiente') {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(500).json({ error: 'Error al realizar retiro' });
  }
};

// Crear transferencia
export const createTransferencia = async (req, res) => {
  try {
    const { usuario_id, monto, usuario_destino_id, descripcion } = req.body;

    if (!usuario_id) {
      return res.status(400).json({ error: 'usuario_id es requerido' });
    }

    if (!monto || monto <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    if (!usuario_destino_id) {
      return res.status(400).json({ error: 'Usuario destino es requerido' });
    }

    const userId = parseInt(usuario_id);
    const destinoId = parseInt(usuario_destino_id);

    if (userId === destinoId) {
      return res.status(400).json({ error: 'No puedes transferir a ti mismo' });
    }

    await prisma.$transaction(async (tx) => {
      // Verificar saldo suficiente
      const user = await tx.usuario.findUnique({
        where: { id: userId },
        select: { saldo: true }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (user.saldo < parseFloat(monto)) {
        throw new Error('Saldo insuficiente');
      }

      // Verificar que el usuario destino existe
      const destinoUser = await tx.usuario.findUnique({
        where: { id: destinoId },
        select: { id: true }
      });

      if (!destinoUser) {
        throw new Error('Usuario destino no encontrado');
      }

      // Crear transacción
      await tx.transaccion.create({
        data: {
          usuarioId: userId,
          tipo: 'transferencia',
          monto: parseFloat(monto),
          descripcion: descripcion || 'Transferencia',
          usuarioDestinoId: destinoId
        }
      });

      // Actualizar saldo del remitente
      await tx.usuario.update({
        where: { id: userId },
        data: {
          saldo: {
            decrement: parseFloat(monto)
          }
        }
      });

      // Actualizar saldo del destinatario
      await tx.usuario.update({
        where: { id: destinoId },
        data: {
          saldo: {
            increment: parseFloat(monto)
          }
        }
      });
    });

    res.status(201).json({ 
      message: 'Transferencia realizada exitosamente',
      monto 
    });
  } catch (error) {
    console.error('Error en createTransferencia:', error);
    if (error.message === 'Saldo insuficiente') {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }
    if (error.message === 'Usuario no encontrado' || error.message === 'Usuario destino no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al realizar transferencia' });
  }
};
