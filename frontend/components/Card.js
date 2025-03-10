import React, { useEffect } from "react";
import Link from "next/link";
import useStore from "../store/store";
import Image from "next/image";

export default function Card({ currentProducts }) {
  const { dolarBlue, fetchDolarBlue } = useStore();

  useEffect(() => {
    fetchDolarBlue();
  }, [fetchDolarBlue]);

  const getDisponibilidad = (product) => {
    const hasTallas = product.tallas && Object.keys(product.tallas).length > 0;
  
    if (hasTallas && product.encargo) {
      return { message: "Disponible en 3 días", color: "text-yellow-500" };
    } else if (hasTallas) {
      return { message: "Entrega inmediata", color: "text-green-500" };
    } else {
      return { message: "Disponible en 20 días", color: "text-red-500" };
    }
  };
  

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {currentProducts.map((product) => {
          const disponibilidad = getDisponibilidad(product);
          return (
            <Link href={`/producto/${product._id}`} key={product.id}>
              <div key={product._id} className="flex flex-col h-[500px] transition-transform transform hover:scale-105">
                <div className="relative w-full h-[300px]">
                  <Image
                    src={product.image}
                    alt={product.nombre}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col mt-2 space-y-1">
                  <h3 className="text-lg font-semibold">{product.nombre}</h3>
                  <h5 className="text-sm leading-relaxed text-gray-500">
                    {product.description}
                  </h5>
                  <div className="flex flex-col">
                    <p className="text-lg font-bold text-gray-800">${product.precio} USD</p>
                    <p className="text-lg font-bold text-gray-800">
                      ${(product.precio * dolarBlue).toFixed(2)} ARS
                    </p>
                    <span className={disponibilidad.color}>{disponibilidad.message}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
