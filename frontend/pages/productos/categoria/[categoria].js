import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Card from "../../../components/Card";
import Filter from "../../../components/Filtro";
import Pagination from "../../../components/Pagination";
import { BounceLoader } from 'react-spinners';
import { sortProductsByAvailability } from '../../../utils/sortProducts';

export default function Categoria() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const router = useRouter();
  const { categoria } = router.query;

  const fetchProductsByCategory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/productos/categoria/${categoria}`);
      if (!response.ok) {
        throw new Error("Error al cargar los productos");
      }
      const data = await response.json();
      
      // Aplicar el ordenamiento antes de establecer los estados
      const sortedData = sortProductsByAvailability(data);
      setProducts(sortedData);
      setFilteredProducts(sortedData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDisponibilidad = (product) => {
    const hasTallas = Array.isArray(product.tallas) && product.tallas.length > 0;

    if (hasTallas && product.encargo) {
      return "Disponible en 3 días";
    } else if (hasTallas) {
      return "Entrega inmediata";
    } else {
      return "Disponible en 20 días";
    }
  };

  useEffect(() => {
    if (categoria) {
      fetchProductsByCategory();
    }
  }, [categoria]);

  // Agregar useEffect para reordenar cuando cambian los productos filtrados
  useEffect(() => {
    if (products.length > 0) {
      const sortedProducts = sortProductsByAvailability(products);
      setFilteredProducts(sortedProducts);
    }
  }, [products]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="container flex flex-col py-10 mx-auto lg:flex-row pb-20">
      <aside className="w-full mb-6 lg:w-1/4 lg:mb-0">
        <Filter
          products={products}
          setFilteredProducts={(newFilteredProducts) => {
            // Aplicar ordenamiento cuando se filtran los productos
            const sortedFiltered = sortProductsByAvailability(newFilteredProducts);
            setFilteredProducts(sortedFiltered);
          }}
        />
      </aside>
      <section className="flex flex-col w-full lg:w-3/4">
        {loading ? (
          <div className="flex items-center justify-center mt-[5%]"><BounceLoader color="#BE1A1D" /></div>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : currentProducts.length === 0 ? (
          <p>No hay productos disponibles.</p>
        ) : (
          <Card currentProducts={currentProducts} />
        )}
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </section>
    </div>
  );
}
