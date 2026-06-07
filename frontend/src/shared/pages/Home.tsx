import { useEffect } from 'react'
import HeroSection from '../components/PrincipalImage'
import { useUser } from '../context/UserContext';
export default function Home() {
  const { account } = useUser();
  const userRole = account?.role || null;

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/healthcheck`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor')
        }
        return response.text() // o .json() si esperas JSON
      })
      .then(() => {
        //console.log('Healthcheck OK:', data)
      })
      .catch(error => {
        console.error('Error llamando a healthcheck:', error)
      })
  }, [])
  //console.log("userRole", userRole);
  return (
    <div>
      <HeroSection />
      {(userRole==="VIEWER")}
    </div>
  );
}