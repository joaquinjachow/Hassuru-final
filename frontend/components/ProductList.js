import React, { useState, useEffect, useCallback } from "react";
import ProductRow from "./ProductRow";
import { MdFilterAltOff, MdAdd } from "react-icons/md";
import AddProductModal from './AddProductModal';
import useStore from "../store/store";

const ProductList = ({ editableProducts, setEditableProducts, selectedProduct, setSelectedProduct }) => {
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [encargoFilter, setEncargoFilter] = useState(false);
  const { dolarBlue, fetchDolarBlue } = useStore();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Función para ordenar productos
  const sortProducts = useCallback((products) => {
    return [...products].sort((a, b) => {
      const getValue = (product) => {
        const hasTallas = Array.isArray(product.tallas) && product.tallas.length > 0;
        if (!hasTallas) return 3;
        return product.encargo ? 2 : 1;
      };
      return getValue(a) - getValue(b);
    });
  }, []);

  // Efecto para cargar el dólar blue
  useEffect(() => {
    if (isInitialLoad) {
      fetchDolarBlue();
      setIsInitialLoad(false);
    }
  }, [fetchDolarBlue, isInitialLoad]);

  // Aplicar filtros
  const filteredProducts = editableProducts.filter((producto) => {
    const nameMatch = producto.nombre.toLowerCase().includes(nameFilter.toLowerCase());
    const categoryMatch = categoriaFilter ? producto.categoria === categoriaFilter : true;
    const encargoMatch = encargoFilter ? producto.encargo === true : true;
    return nameMatch && categoryMatch && encargoMatch;
  });

  // Handlers
  const handleProductSelect = (id) => {
    setSelectedProduct(id);
  };

  const handleRemoveFilters = () => {
    setCategoriaFilter("");
    setNameFilter("");
    setEncargoFilter(false);
  };

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleAddProduct = useCallback((newProduct) => {
    setEditableProducts(prev => {
      const newProducts = [...prev, newProduct];
      return sortProducts(newProducts);
    });
  }, [sortProducts]);

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
            {filteredProducts.map((producto, index) => (
              <ProductRow
                key={producto._id}
                producto={producto}
                index={index}
                selectedProduct={selectedProduct}
                handleProductSelect={handleProductSelect}
                setEditableProducts={setEditableProducts}
                editableProducts={editableProducts}
                setSelectedProduct={setSelectedProduct}
              />
            ))}
          </tbody>
        </table>
      </div>
      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        setEditableProducts={setEditableProducts}
      />
    </div>
  );
};

export default ProductList;
