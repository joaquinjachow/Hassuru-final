import React, { useState, useEffect } from "react";
import useStore from "../store/store";
import Image from "next/image";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { useCartStore } from '../store/cartStore';

export default function Detail({ product }) {
  const [showTallas, setShowTallas] = useState(false);
  const [selectedTalla, setSelectedTalla] = useState(null);
  const [customTalla, setCustomTalla] = useState("");
  const { dolarBlue, fetchDolarBlue } = useStore();
  const router = useRouter();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const addToCart = useCartStore(state => state.addToCart);

  useEffect(() => {
    fetchDolarBlue();
    
    // Actualizar el valor cada 5 minutos
    const interval = setInterval(() => {
      fetchDolarBlue();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchDolarBlue]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setLoadingRelated(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos`);
        const allProducts = await response.json();
        const marcas = Array.isArray(product.marca) ? product.marca : [product.marca];
        // Productos de la misma marca con entrega disponible
        const related = allProducts.filter(p => 
          p._id !== product._id && 
          marcas.some(marca => Array.isArray(p.marca) ? p.marca.includes(marca) : p.marca === marca) &&
          Array.isArray(p.tallas) && p.tallas.length > 0 && !p.encargo
        );
        if (related.length > 0) {
          setRelatedProducts(related.slice(0, 6));
        } else {
          // Si no hay, mostrar productos de otras marcas con entrega disponible
          const otrosDisponibles = allProducts.filter(p => 
            p._id !== product._id &&
            (!marcas.some(marca => Array.isArray(p.marca) ? p.marca.includes(marca) : p.marca === marca)) &&
            Array.isArray(p.tallas) && p.tallas.length > 0 && !p.encargo
          );
          setRelatedProducts(otrosDisponibles.slice(0, 6));
        }
      } catch (error) {
        console.error("Error al cargar productos relacionados:", error);
      } finally {
        setLoadingRelated(false);
      }
    };

    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);

  const handleCompraClick = () => {
    if (selectedTalla) {
      addToCart({
        productoId: product._id,
        nombre: product.nombre,
        cantidad: 1,
        imagen: product.image?.url || product.image || '/placeholder.jpg',
        precio: selectedTalla.precioTalla,
        precioARS: (selectedTalla.precioTalla * dolarBlue),
        talle: selectedTalla.talla
      });
      toast.success('Producto añadido al carrito');
      return;
    }
    if (customTalla) {
      // Si es encargo personalizado, sigue el flujo de WhatsApp
      const message = `Hola, quiero encargar esta prenda ${product.nombre} en talle ${customTalla}`;
      const whatsappUrl = `https://api.whatsapp.com/send?phone=3512595858&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
      return;
    }
    setShowTallas(true);
  };

  const handleTallaSelect = (talla) => {
    if (selectedTalla === talla) {
      setSelectedTalla(null);
    } else {
      setSelectedTalla(talla);
      setCustomTalla("");
    }
  };

  // Función para obtener la URL de la imagen
  const getImageUrl = () => {
    // Si no hay imagen, devolver una imagen por defecto
    if (!product.image) return "/placeholder.jpg";
    
    // Si la imagen es una URL de Cloudinary, usarla directamente
    if (typeof product.image === 'string' && product.image.includes('cloudinary')) {
      return product.image;
    }
    
    // Si la imagen es un objeto con data (nuevo formato), usar la ruta de la API
    if (product._id) {
      return `${process.env.NEXT_PUBLIC_URL || "http://localhost:5001"}/api/productos/${product._id}/image?w=600&q=85`;
    }
    
    return "/placeholder.jpg";
  };

  return (
    <>
      <div className="container py-10 mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Imagen a la izquierda */}
          <div className="w-full lg:w-1/2 mb-6 lg:mb-0">
            <div className="relative w-full h-[420px] sm:h-[520px] md:h-[600px] lg:h-[700px]">
              <img
                src={getImageUrl()}
                alt={product.nombre}
                width={1200}
                height={800}
                loading="eager"
                className="object-contain w-full h-full rounded-xl bg-white "
              />
            </div>
          </div>
          {/* Info a la derecha */}
          <div className="flex flex-col w-full lg:w-1/2 p-2 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 lg:text-4xl mb-2">{product.nombre}</h2>
            <div className="space-y-2 text-gray-800">
              <p className="text-sm text-gray-500 mb-2">{product.descripcion}</p>
              <p className="text-4xl font-bold">${product.precio} USD</p>
              <p className="text-lg text-gray-400">${(product.precio * dolarBlue).toFixed(2)} ARS</p>
            </div>
            <div className="mt-4">
              <h3 className="mb-2 text-lg font-semibold text-gray-800">Tallas disponibles:</h3>
              {product.tallas && product.tallas.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.tallas.map((talla) => (
                    <button
                      key={talla._id}
                      onClick={() => handleTallaSelect(talla)}
                      className={`px-4 py-2 border rounded-md ${
                        selectedTalla?._id === talla._id
                          ? "bg-red-600 text-white border-red-600"
                          : "border-gray-300 hover:border-red-600"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-medium">{talla.talla}</span>
                        <span className="text-sm">${talla.precioTalla} USD</span>
                        <span className="text-xs text-gray-500">${(talla.precioTalla * dolarBlue).toFixed(2)} ARS</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-yellow-600 font-medium">Te traemos el par desde Estados Unidos con demora de 20/30 días</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customTalla}
                      onChange={(e) => setCustomTalla(e.target.value)}
                      placeholder="Ingresa tu talle"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {product.tallas && product.tallas.length > 0 ? (
                product.tallas.some((tallaObj) => tallaObj.precioTalla > 0) ? (
                  product.encargo ? (
                    <span className="text-yellow-500">Disponible en 3 días</span>
                  ) : (
                    <span className="text-green-500">Entrega inmediata</span>
                  )
                ) : (
                  <span className="text-red-500">Disponible en 20 días</span>
                )
              ) : (
                <span className="text-yellow-500">Encargo desde Estados Unidos (20-30 días)</span>
              )}
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>✓</span>
              <p>Artículo verificado, 100% original.</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>📦</span>
              {Object.entries(product.tallas).some(([_, stock]) => stock > 0) ? (
                <p>Quedan {Object.values(product.tallas).reduce((acc, stock) => acc + stock, 0)} en stock. Ordena pronto.</p>
              ) : (
                <p>Stock Disponible. Pide tu talle.</p>
              )}
            </div>
            {selectedTalla && (
              <div className="mt-2 text-sm text-gray-600">
                Has seleccionado la talla: <span className="font-bold">{selectedTalla.talla}</span>
                <button
                  onClick={() => setSelectedTalla(null)}
                  className="ml-2 text-sm text-red-500 hover:underline"
                >
                  Deseleccionar
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 mt-4 lg:grid-cols-2">
              <div className="p-4 text-sm text-center text-gray-600 border rounded-md">
                Envíos gratis a todo el país.
              </div>
              <div className="p-4 text-sm text-center text-gray-600 border rounded-md">
                Entrega en Córdoba Capital
              </div>
            </div>
            <div className="mt-4">
              <button
                className={`flex items-center justify-center w-full px-4 py-2 text-white bg-green-500 border border-gray-400 rounded-md hover:bg-green-600`}
                onClick={handleCompraClick}
              >
                {product.tallas && product.tallas.length > 0 ? (
                  selectedTalla ? "Añadir al carrito" : "Seleccionar talla"
                ) : (
                  customTalla ? "Comprar" : "Encargar ahora"
                )}
              </button>
            </div>
            {/* Medios de pago */}
            <div className="p-4 mt-6 bg-white border border-gray-300 rounded-md shadow-md">
              <h3 className="text-lg font-semibold text-gray-800">Medios de pago disponibles:</h3>
              <ul className="mt-2 space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="text-green-500">✔️</span>
                  <span className="ml-2">Zelle, Cashapp, USDT/CRYPTO</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500">✔️</span>
                  <span className="ml-2">Transferencia en pesos</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500">✔️</span>
                  <span className="ml-2">Transferencia en U$D (solo desde cuentas internacionales)</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500">✔️</span>
                  <span className="ml-2">Efectivo (Córdoba & Buenos Aires)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Sección de productos relacionados más cerca del detalle */}
      {(loadingRelated || relatedProducts.length > 0) && (
        <div className="container mt-8 mx-auto">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">Productos relacionados</h2>
          <div className="flex gap-6 overflow-x-auto pb-2">
            {loadingRelated
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="min-w-[240px] max-w-[240px] p-4 border rounded-lg flex-shrink-0 bg-gray-200 animate-pulse">
                    <div className="w-full h-64 mb-4 bg-gray-300 rounded-lg" />
                    <div className="h-5 w-3/4 mb-2 bg-gray-300 rounded" />
                    <div className="h-4 w-1/2 mb-1 bg-gray-300 rounded" />
                    <div className="h-4 w-2/3 mb-2 bg-gray-300 rounded" />
                    <div className="h-8 w-full bg-gray-300 rounded" />
                  </div>
                ))
              : relatedProducts.slice(0, 6).map((relatedProduct) => {
                  // Calcular precio en pesos
                  const precioPesos = dolarBlue ? Math.round(relatedProduct.precio * dolarBlue) : null;
                  // Determinar disponibilidad y estilos
                  let disponibilidad = relatedProduct.disponibilidad || "Sin info";
                  let disponibilidadLabel = disponibilidad;
                  let disponibilidadClass = "bg-gray-300 text-black";
                  if (
                    disponibilidad === "Entrega inmediata" ||
                    (!relatedProduct.encargo && Array.isArray(relatedProduct.tallas) && relatedProduct.tallas.length > 0)
                  ) {
                    disponibilidadLabel = "Entrega inmediata";
                    disponibilidadClass = "bg-green-500 text-white";
                  } else if (
                    disponibilidad === "Disponible en 3 días" ||
                    (relatedProduct.encargo && Array.isArray(relatedProduct.tallas) && relatedProduct.tallas.length > 0)
                  ) {
                    disponibilidadLabel = "Disponible en 3 días";
                    disponibilidadClass = "bg-yellow-400 text-gray-900";
                  } else if (
                    disponibilidad === "Disponible en 20 días" ||
                    (!Array.isArray(relatedProduct.tallas) || relatedProduct.tallas.length === 0)
                  ) {
                    disponibilidadLabel = "Disponible en 20 días";
                    disponibilidadClass = "bg-red-500 text-white";
                  }
                  return (
                    <div
                      key={relatedProduct._id}
                      className="min-w-[240px] max-w-[240px] p-4 transition duration-200 border rounded-lg hover:shadow-lg flex-shrink-0 bg-white cursor-pointer"
                      onClick={() => router.push(`/producto/${relatedProduct._id}`)}
                      tabIndex={0}
                      role="button"
                      onKeyPress={e => { if (e.key === 'Enter') router.push(`/producto/${relatedProduct._id}`); }}
                    >
                      <div className="relative w-full h-64 mb-4">
                        <Image
                          src={relatedProduct.image?.url || "/placeholder.jpg"}
                          alt={relatedProduct.nombre}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-lg"
                        />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-800 truncate">{relatedProduct.nombre}</h3>
                      <p className="mb-1 text-gray-600">USD ${relatedProduct.precio}</p>
                      {precioPesos && (
                        <p className="mb-2 text-gray-600">${precioPesos.toLocaleString("es-AR")} ARS</p>
                      )}
                      <div className={`w-full px-4 py-2 text-center text-sm font-medium rounded ${disponibilidadClass}`}>{disponibilidadLabel}</div>
                    </div>
                  );
                })}
          </div>
        </div>
      )}
    </>
  );
}
