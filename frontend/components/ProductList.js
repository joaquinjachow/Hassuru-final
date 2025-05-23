import React, { useState } from "react";
import ProductRow from "./ProductRow";
import { MdFilterAltOff } from "react-icons/md";
import { MdAdd } from "react-icons/md";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import AddProductModal from './AddProductModal';
import useStore from "../store/store";

const ProductList = ({ editableProducts, setEditableProducts, selectedProduct, setSelectedProduct, fetchProducts, fetchProductsFiltered }) => {
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [encargoFilter, setEncargoFilter] = useState(false);
  const [priceSort, setPriceSort] = useState("");
  const { dolarBlue } = useStore();
  const [isModalOpen, setModalOpen] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  const handleProductSelect = (id) => {
    setSelectedProduct(id);
  };

  const handleRemoveFilters = () => {
    setCategoriaFilter("");
    setNameFilter("");
    setEncargoFilter(false);  // Limpiar filtro de encargo
    setPriceSort(""); // Limpiar ordenamiento por precio
    fetchProducts();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    // Refresh the product list when the modal is closed
    if (typeof fetchProducts === 'function') {
      fetchProducts();
    }
  };

  // Filtrar productos
  let filteredProducts = editableProducts.filter((producto) => {
    const nameMatch = producto.nombre.toLowerCase().includes(nameFilter.toLowerCase());
    const categoryMatch = categoriaFilter ? producto.categoria === categoriaFilter : true;
    const encargoMatch = encargoFilter ? producto.encargo === true : true;
    return nameMatch && categoryMatch && encargoMatch;
  });

  // Ordenar productos por precio
  if (priceSort === "asc") {
    filteredProducts = [...filteredProducts].sort((a, b) => a.precio - b.precio);
  } else if (priceSort === "desc") {
    filteredProducts = [...filteredProducts].sort((a, b) => b.precio - a.precio);
  }

  // Pagination calculations
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [categoriaFilter, nameFilter, encargoFilter, priceSort]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-xl font-semibold text-black">Lista de Productos</h2>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center p-3 mb-4 text-white transition duration-200 bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 lg:hidden"
      >
        <MdAdd className="mr-2" />
        Agregar Producto
      </button>
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col items-center gap-4 mb-6 sm:flex-row">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="w-full p-2 border rounded sm:w-auto"
        />
        <select
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value)}
          className="w-full p-2 border rounded sm:w-auto"
        >
          <option value="">Seleccione una categoría</option>
          <option value="zapatillas">Zapatillas</option>
          <option value="ropa">Ropa</option>
          <option value="accesorios">Accesorios</option>
        </select>
        <select
          value={priceSort}
          onChange={(e) => setPriceSort(e.target.value)}
          className="w-full p-2 border rounded sm:w-auto"
        >
          <option value="">Ordenar por precio</option>
          <option value="asc">Menor a mayor</option>
          <option value="desc">Mayor a menor</option>
        </select>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="encargoFilter"
            checked={encargoFilter}
            onChange={() => setEncargoFilter(!encargoFilter)} // Actualización correcta de encargoFilter
            className="w-4 h-4"
          />
          <label htmlFor="encargoFilter">Filtrar por Encargo</label>
        </div>
        <button
          type="button"
          onClick={handleRemoveFilters}
          className="w-full p-2 text-center text-white bg-red-500 rounded sm:w-auto"
        >
          <MdFilterAltOff className="inline-block mr-1" />
          <span className="hidden md:inline-block">Remover Filtros</span>
        </button>
        <div className="flex items-center p-2 text-center bg-blue-100 rounded sm:w-auto">
          <span className="hidden mr-2 text-lg font-bold text-green-500 md:inline-block">Dólar Blue:</span>
          <span className="text-lg font-semibold">${dolarBlue}</span>
        </div>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full text-left table-auto">
          <thead className="text-base">
            <tr className="text-gray-700 bg-gray-100">
              <th className="px-2 py-2">#</th>
              <th className="px-2 py-2">Seleccionar</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Marca</th>
              <th className="px-4 py-2">Categoría</th>
              <th className="px-4 py-2">Precios (USD/AR)</th>
              <th className="px-4 py-2">Tallas (Precio)</th>
              <th className="px-4 py-2">Colores</th>
              <th className="px-4 py-2">Imagen</th>
              <th className="px-4 py-2">Destacado</th>
              <th className="px-4 py-2">Destacado Z</th>
              <th className="px-4 py-2">Encargo</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((producto, index) => (
              <ProductRow
                key={producto._id}
                producto={producto}
                index={indexOfFirstProduct + index + 1}
                selectedProduct={selectedProduct}
                handleProductSelect={handleProductSelect}
                setEditableProducts={setEditableProducts}
                fetchProducts={fetchProducts}
                editableProducts={editableProducts}
                setSelectedProduct={setSelectedProduct}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between w-full gap-2 mt-4 px-4 py-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-600 transition-colors duration-200 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdChevronLeft size={24} />
          </button>
          
          {/* First page */}
          {currentPage > 2 && (
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              1
            </button>
          )}

          {/* Left ellipsis */}
          {currentPage > 3 && (
            <span className="px-2 text-gray-500">...</span>
          )}

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => {
              if (totalPages <= 5) return true;
              if (page === 1 || page === totalPages) return false;
              return Math.abs(currentPage - page) <= 1;
            })
            .map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}

          {/* Right ellipsis */}
          {currentPage < totalPages - 2 && (
            <span className="px-2 text-gray-500">...</span>
          )}

          {/* Last page */}
          {currentPage < totalPages - 1 && (
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-600 transition-colors duration-200 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdChevronRight size={24} />
          </button>
        </div>

        {/* Page info */}
        <div className="text-sm text-gray-600">
          Mostrando {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} de {filteredProducts.length} productos
        </div>
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        fetchProducts={fetchProducts}
      />
    </div>
  );
};

export default ProductList;
