
import { useNavigate } from "react-router";
import { useState } from "react";

function Box() {

    const navigate = useNavigate();

    const [nombre, setNombre] = useState("");


    const validarUsuario = () => {
        if(nombre === "Malla") {
            navigate('/menu', {state: {nombreUsuario: nombre}});
        } else {
            alert("Usuario no reconocido");
        }
    }

  return (
    <div>
        <h1> Bienvenido </h1>
        <input type="text" onChange={(e) => setNombre(e.target.value)}/>
        <button onClick={validarUsuario}>Iniciar Sesión</button>
    </div>
  );
}
export default Box;