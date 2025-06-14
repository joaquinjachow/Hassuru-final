import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/router';
import SearchBar from "./SearchBar";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [marcasPorCategoria, setMarcasPorCategoria] = useState({
    zapatillas: [],
    ropa: [],
    accesorios: []
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);
    const handleResize = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  // Cargar las marcas por categoría
  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos`);
        const productos = await response.json();
        
        const marcasPorCat = {
          zapatillas: new Set(),
          ropa: new Set(),
          accesorios: new Set()
        };

        productos.forEach(producto => {
          if (producto.categoria && producto.marca) {
            // Manejar el array de marcas
            const marcas = Array.isArray(producto.marca) ? producto.marca : [producto.marca];
            
            // Agregar cada marca a su categoría correspondiente
            marcas.forEach(marca => {
              if (producto.categoria === "zapatillas") {
                marcasPorCat.zapatillas.add(marca);
              } else if (producto.categoria === "ropa") {
                marcasPorCat.ropa.add(marca);
              } else if (producto.categoria === "accesorios") {
                marcasPorCat.accesorios.add(marca);
              }
            });
          }
        });

        setMarcasPorCategoria({
          zapatillas: Array.from(marcasPorCat.zapatillas).sort(),
          ropa: Array.from(marcasPorCat.ropa).sort(),
          accesorios: Array.from(marcasPorCat.accesorios).sort()
        });
      } catch (error) {
        console.error('Error al cargar las marcas:', error);
      }
    };

    fetchMarcas();
  }, []);

  const handleMarcaClick = (categoria, marca) => {
    router.push(`/productos/categoria/${categoria}?marca=${encodeURIComponent(marca)}`);
    setIsOpen(false);
  };

  const handleSearch = (query) => {
    if (query && query.trim()) {
      router.push(`/productos?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <>
      <nav className="relative p-12 shadow-md">
        <div className="absolute inset-0 w-full h-full">
          <Link href="/">
            <img
              src="https://i.ibb.co/1WvGB4R/banner-3.png"
              alt="Background"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              width={1200}
              height={400}
              fetchpriority="high"
            />
          </Link>
        </div>
      </nav>
      <nav className="relative bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8 w-full justify-center">
              <Link href="/" className="py-2 hover:text-gray-300">
                Inicio
              </Link>

              {/* Enlaces directos a categorías */}
              <Link href="/productos/talla/zapatillas" className="py-2 hover:text-gray-300">
                Zapatillas
              </Link>
              <Link href="/productos/talla/ropa" className="py-2 hover:text-gray-300">
                Ropa
              </Link>

              {/* Stock Dropdown */}
              <div className="relative group">
                <button className="py-2 hover:text-gray-300">
                  Stock
                </button>
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-[800px] bg-gray-800 bg-opacity-90 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="py-6 px-8 grid grid-cols-3 gap-8">
                    {/* Zapatillas Column */}
                    <div>
                      <Link 
                        href="/productos/talla/zapatillas"
                        className="block text-lg font-semibold mb-4 text-white hover:text-gray-300"
                      >
                        ZAPATILLAS
                      </Link>
                      {marcasPorCategoria.zapatillas.map((marca, index) => (
                        <button
                          key={index}
                          onClick={() => handleMarcaClick('zapatillas', marca)}
                          className="block w-full text-left py-1 text-gray-300 hover:text-white"
                        >
                          {marca}
                        </button>
                      ))}
                    </div>

                    {/* Ropa Column */}
                    <div>
                      <Link 
                        href="/productos/talla/ropa"
                        className="block text-lg font-semibold mb-4 text-white hover:text-gray-300"
                      >
                        ROPA
                      </Link>
                      {marcasPorCategoria.ropa.map((marca, index) => (
                        <button
                          key={index}
                          onClick={() => handleMarcaClick('ropa', marca)}
                          className="block w-full text-left py-1 text-gray-300 hover:text-white"
                        >
                          {marca}
                        </button>
                      ))}
                    </div>

                    {/* Tecnología Column */}
                    <div>
                      <Link 
                        href="/productos/categoria/accesorios"
                        className="block text-lg font-semibold mb-4 text-white hover:text-gray-300"
                      >
                        TECNOLOGÍA
                      </Link>
                      {marcasPorCategoria.accesorios.map((marca, index) => (
                        <button
                          key={index}
                          onClick={() => handleMarcaClick('accesorios', marca)}
                          className="block w-full text-left py-1 text-gray-300 hover:text-white"
                        >
                          {marca}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Link href="/encargos" className="py-2 hover:text-gray-300">
                Encargos
              </Link>

              {/* Search Bar */}
              <div className="flex items-center">
                <SearchBar onSearch={handleSearch} isHamburgerOpen={false} />
              </div>
            </div>

            {/* Mobile Navigation - Always Visible */}
            <div className="md:hidden flex items-center justify-between w-full">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md hover:bg-gray-700 focus:outline-none z-50"
              >
                <span className={`block w-6 h-0.5 bg-white mb-1 ${isOpen ? 'transform rotate-45 translate-y-1.5' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-white mb-1 ${isOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-white ${isOpen ? 'transform -rotate-45 -translate-y-1.5' : ''}`}></span>
              </button>

              <div className="flex items-center space-x-4">
                <Link 
                  href="/productos/talla/zapatillas"
                  className="text-base px-3 py-2 rounded-md hover:text-gray-300 active:bg-gray-700 focus:bg-gray-700 transition-all"
                >
                  Zapatillas
                </Link>
                <Link 
                  href="/productos/talla/ropa"
                  className="text-base px-3 py-2 rounded-md hover:text-gray-300 active:bg-gray-700 focus:bg-gray-700 transition-all"
                >
                  Ropa
                </Link>
                <Link 
                  href="/productos/categoria/accesorios"
                  className="text-base px-3 py-2 rounded-md hover:text-gray-300 active:bg-gray-700 focus:bg-gray-700 transition-all"
                >
                  Tecnología
                </Link>
              </div>

              <div className="w-10">
                <SearchBar isHamburgerOpen={isOpen} />
              </div>
            </div>
          </div>

          {/* Mobile menu content */}
          {isOpen && (
            <div className="md:hidden py-4">
              <Link 
                href="/"
                className="block py-2 px-4 hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Inicio
              </Link>

              {/* Zapatillas Mobile */}
              <div className="mb-4">
                <div className="pl-4">
                  {marcasPorCategoria.zapatillas.map((marca, index) => (
                    <button
                      key={index}
                      onClick={() => handleMarcaClick('zapatillas', marca)}
                      className="block w-full py-2 px-4 text-sm text-left hover:bg-gray-700"
                    >
                      {marca}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ropa Mobile */}
              <div className="mb-4">
                <div className="pl-4">
                  {marcasPorCategoria.ropa.map((marca, index) => (
                    <button
                      key={index}
                      onClick={() => handleMarcaClick('ropa', marca)}
                      className="block w-full py-2 px-4 text-sm text-left hover:bg-gray-700"
                    >
                      {marca}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tecnología Mobile */}
              <div className="mb-4">
                <Link 
                  href="/productos/categoria/accesorios"
                  className="block py-2 px-4 hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  TECNOLOGÍA
                </Link>
                <div className="pl-4">
                  {marcasPorCategoria.accesorios.map((marca, index) => (
                    <button
                      key={index}
                      onClick={() => handleMarcaClick('accesorios', marca)}
                      className="block w-full py-2 px-4 text-sm text-left hover:bg-gray-700"
                    >
                      {marca}
                    </button>
                  ))}
                </div>
              </div>

              <Link 
                href="/encargos" 
                className="block py-2 px-4 hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Encargos
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
