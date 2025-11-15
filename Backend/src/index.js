import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { prisma } from "./database/prisma.js";

const PORT = process.env.PORT || 4000;

async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Conectado a la base de datos");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al conectar la base de datos:", error);
    process.exit(1);
  }
}

main();

