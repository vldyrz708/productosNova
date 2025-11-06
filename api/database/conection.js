const mongoose = require("mongoose");

const conection = async () => {
  console.log("Conectando a la base de datos...");

  try {
    await mongoose.connect("mongodb://localhost:27017/productos_k-pop");
    console.log("::: Conectado a la base de datos. :::");
  } catch (error) {
    console.log("Error en la conexion a la base de datos");
    throw new Error(
      "::: ERROR No se ha podido conectar a la base de datos :::"
    );
  }
};

module.exports = conection;