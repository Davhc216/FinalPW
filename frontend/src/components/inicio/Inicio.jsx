import { useEffect , useState} from 'react';
import { useNavigate , useLocation, data} from 'react-router';
import './Inicio.css';

function Inicio() {



    
    const [data, setData] = useState([]);

        useEffect(() => {

            fetch("http://jsonplaceholder.typicode.com/posts")
            .then((response) => response.json())
            .then((json) => setData(json))
            .catch((error) => console.log(error))

        }, [])

  return (

    <div>
      <h1>Hola Bienvenido</h1>
      <ul>
        {
          data.map((item) => (
            <li className='cajitas'>{item.title}</li>
          ))
        }
      </ul>
    </div>
  );
}
export default Inicio;