import bcrypt from 'bcryptjs';
import { prisma } from '../database/prisma.js';

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        saldo: true,
        createdAt: true
      }
    });

    res.json({ users });
  } catch (error) {
    console.error('Error en getUsers:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Obtener usuario por ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nombre: true,
        email: true,
        saldo: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error en getUserById:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password } = req.body;

    // Verificar si el usuario existe
    const existingUser = await prisma.usuario.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const updateData = {};

    if (nombre) {
      updateData.nombre = nombre;
    }

    if (email) {
      updateData.email = email;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error en updateUser:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.usuario.delete({
      where: { id: parseInt(id) }
    }).catch(() => null);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error en deleteUser:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};
