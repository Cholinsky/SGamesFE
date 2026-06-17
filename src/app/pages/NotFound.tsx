import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="text-center">
        <h1 className="mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-9xl font-bold text-transparent">
          404
        </h1>
        <h2 className="mb-4 text-3xl font-bold text-white">
          Página no encontrada
        </h2>
        <p className="mb-8 text-gray-400">
          Lo sentimos, la página que buscas no existe.
        </p>
        <Link to="/">
          <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
            <Home className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}
