export default function PrincipalImage() {
  return (
    <section
      className="relative w-screen max-w-full h-225 bg-top bg-contain bg-no-repeat mx-auto"
      style={{ backgroundImage: `url(${import.meta.env.VITE_BACKEND_URL_MEDIA}/photo.jpg)` }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
        <p className="text-xl italic drop-shadow-md">Bienvenido a</p>
        <h1 className="text-6xl font-bold drop-shadow-lg my-2">Recíclame</h1>
      </div>
    </section>
  );
}
