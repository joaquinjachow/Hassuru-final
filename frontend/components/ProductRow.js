import React, { useState, useEffect, useRef } from "react";
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoAddCircleOutline } from "react-icons/io5";
import { toast } from "react-hot-toast";
import useStore from "../store/store";
import Image from "next/image";
import SizeSelectionModal from './SizeSelectionModal';
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/router";

const URL1 = process.env.NEXT_PUBLIC_URL || 'https://web-production-73e61.up.railway.app';

const ProductRow = ({
  producto,
  index,
  selectedProduct,
  handleProductSelect,
  editableProducts,
  setEditableProducts,
  fetchProducts,
  setSelectedProduct,
  isSelected,
  onSelect
}) => {
  const [newTalla, setNewTalla] = useState("");
  const [newStock, setNewStock] = useState(0);
  const [newColor, setNewColor] = useState("");
  const { dolarBlue, fetchDolarBlue, productAdded } = useStore();
  const [newImage, setNewImage] = useState(null);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sizePrices, setSizePrices] = useState({});
  const { checkAuth } = useAuth();
  const router = useRouter();
  const hasFetchedRef = useRef(false);
  const [newMarca, setNewMarca] = useState("");

  useEffect(() => {
    fetchDolarBlue();
  }, [fetchDolarBlue]);

  useEffect(() => {
    if (producto && producto.image) {
      if (typeof producto.image === 'string' && producto.image.includes('cloudinary')) {
        setNewImage(producto.image);
      } else {
        const timestamp = new Date().getTime();
        setNewImage(`${URL1}/api/productos/${producto._id}/image?t=${timestamp}`);
      }
    }
  }, [producto]);

  useEffect(() => {
    if (producto && typeof producto.marca === 'string') {
      const marcas = producto.marca.split(',').map(m => m.trim()).filter(Boolean);
      const updatedProduct = { ...producto, marca: marcas };
      setEditableProducts(prevProducts =>
        prevProducts.map(prod =>
          prod._id === producto._id ? updatedProduct : prod
        )
      );
    }
  }, [producto]);

  const handleTallaChange = (e, tallaIndex) => {
    const { value } = e.target;
    const updatedProduct = {
      ...producto,
      tallas: producto.tallas.map((talla, index) =>
        index === tallaIndex
          ? { ...talla, talla: value }
          : talla
      ),
    };
    setEditableProducts((prevProducts) =>
      prevProducts.map((prod) =>
        prod._id === producto._id ? updatedProduct : prod
      )
    );
  };

  const handleAddTalla = () => {
    if (newTalla && parseFloat(newStock) > 0) {
      const updatedProduct = {
        ...producto,
        tallas: [...producto.tallas, { talla: newTalla, precioTalla: parseFloat(newStock) }],
      };
      setEditableProducts((prevProducts) =>
        prevProducts.map((prod) =>
          prod._id === producto._id ? updatedProduct : prod
        )
      );
      setNewTalla("");
      setNewStock("");
    } else {
      alert("Por favor ingresa un nombre de talla válido y precio de la Talla.");
    }
  };

  const handleDeleteTalla = (tallaIndex) => {
    const updatedProduct = {
      ...producto,
      tallas: producto.tallas.filter((_, index) => index !== tallaIndex),
    };
    setEditableProducts((prevProducts) =>
      prevProducts.map((prod) =>
        prod._id === producto._id ? updatedProduct : prod
      )
    );
  };

  const handleColorChange = (e, colorIndex) => {
    const updatedProduct = {
      ...producto,
      colores: producto.colores.map((color, index) =>
        index === colorIndex ? { ...color, color: e.target.value } : color
      ),
    };

    setEditableProducts((prevProducts) =>
      prevProducts.map((prod) =>
        prod._id === producto._id ? updatedProduct : prod
      )
    );
  };


  const handleAddColor = () => {
    if (newColor.trim()) {
      const updatedProduct = {
        ...producto,
        colores: [...producto.colores, { color: newColor.trim() }],
      };

      setEditableProducts((prevProducts) =>
        prevProducts.map((prod) =>
          prod._id === producto._id ? updatedProduct : prod
        )
      );

      setNewColor(""); // Limpiar el campo de entrada
    } else {
      alert("Por favor ingresa un color válido.");
    }
  };

  const handleDeleteColor = (colorIndex) => {
    const updatedProduct = {
      ...producto,
      colores: producto.colores.filter((_, index) => index !== colorIndex),
    };

    setEditableProducts((prevProducts) =>
      prevProducts.map((prod) =>
        prod._id === producto._id ? updatedProduct : prod
      )
    );
  };


  const handleProductUpdate = async (producto) => {
    try {
      toast.loading("Actualizando producto...");
      // Enviar las marcas como array
      const updatedProduct = { 
        ...producto, 
        marca: Array.isArray(producto.marca) ? producto.marca : [producto.marca]
      };
      // Enviar la actualización al servidor
      const response = await fetch(`${URL1}/api/productos/${producto._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedProduct),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el producto");
      }
      const updatedProductData = await response.json();
      setEditableProducts(prevProducts =>
        prevProducts.map(prod =>
          prod._id === producto._id ? updatedProductData : prod
        )
      );
      fetchProducts();
      setSelectedProduct(null);
      toast.dismiss();
      toast.success("Producto actualizado con éxito");
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      toast.dismiss();
      toast.error(error.message);
    }
  };
  const handleProductDelete = async () => {
    if (!await checkAuth()) {
      return;
    }

    try {
      const response = await fetch(`${URL1}/api/productos/${producto._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 401) {
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      }

      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }

      toast.success("Producto eliminado con éxito");
      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    }
  };
  

  const handleProductChange = (e, field, producto) => {
    const updatedProduct = { ...producto, [field]: e.target.value };
    setEditableProducts((prevProducts) =>
      prevProducts.map((prod) =>
        prod._id === producto._id ? updatedProduct : prod
      )
    );
  };


  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar el tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona un archivo de imagen válido');
      return;
    }



    try {
      // Mostrar un mensaje de carga
      toast.loading('Actualizando imagen...');

      const formData = new FormData();
      formData.append('image', file);

      // Enviar la imagen al servidor
      const response = await fetch(`${URL1}/api/productos/${producto._id}/image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la imagen');
      }

      // Obtener el producto actualizado
      const updatedProduct = await response.json();
      
      // Actualizar el estado local con el producto actualizado
      setEditableProducts(prevProducts =>
        prevProducts.map(prod =>
          prod._id === producto._id ? updatedProduct : prod
        )
      );

      // Forzar una actualización de la imagen en la interfaz
      const timestamp = new Date().getTime();
      setNewImage(`${URL1}/api/productos/${producto._id}/image?t=${timestamp}`);

      // Actualizar la lista de productos
      fetchProducts();

      // Mostrar mensaje de éxito
      toast.dismiss();
      toast.success('Imagen actualizada con éxito');
    } catch (error) {
      console.error('Error:', error);
      toast.dismiss();
      toast.error(error.message);
    }
  };

  const getImageUrl = (product) => {
    // Si no hay imagen, devolver una imagen por defecto
    if (!product || !product.image) return "/placeholder.jpg";
    
    // Si la imagen es una URL de Cloudinary, usarla directamente
    if (typeof product.image === 'string' && product.image.includes('cloudinary')) {
      return product.image;
    }
    
    // Si la imagen es un objeto con data (nuevo formato), usar la ruta de la API
    if (product._id) {
      const timestamp = new Date().getTime();
      return `${URL1}/api/productos/${product._id}/image?t=${timestamp}`;
    }
    
    return "/placeholder.jpg";
  };

  const handleDestacadoChange = (e) => {
    const updatedProduct = { ...producto, destacado: e.target.checked };
    setEditableProducts((prevProducts) =>
      prevProducts.map((prod) =>
        prod._id === producto._id ? updatedProduct : prod
      )
    );
  };

  const handleDestacadoZapatillasChange = (e) => {
    const updatedProduct = { ...producto, destacado_zapatillas: e.target.checked };
    setEditableProducts((prevProducts) =>
      prevProducts.map((prod) =>
        prod._id === producto._id ? updatedProduct : prod
      )
    );
  };

  const handleEncargoChange = (e) => {
    const updatedProduct = { ...producto, encargo: e.target.checked };
    setEditableProducts((prevProducts) =>
      prevProducts.map((prod) =>
        prod._id === producto._id ? updatedProduct : prod
      )
    );
  };

  const handleOpenSizeModal = () => {
    setSelectedSizes(producto.tallas.map(t => t.talla));
    const prices = {};
    producto.tallas.forEach(talla => {
      prices[talla.talla] = talla.precioTalla;
    });
    setSizePrices(prices);
    setIsSizeModalOpen(true);
  };

  const handleUpdateSizes = () => {
    const newTallas = selectedSizes.map(size => ({
      talla: size,
      precioTalla: parseFloat(sizePrices[size]) || 0
    }));

    setEditableProducts(prevProducts => 
      prevProducts.map(prod => 
        prod._id === producto._id ? { ...prod, tallas: newTallas } : prod
      )
    );

    setSelectedSizes([]);
    setSizePrices({});
    setIsSizeModalOpen(false);
  };

  const handleAddMarca = (producto) => {
    if (newMarca) {
      const marcasActuales = Array.isArray(producto.marca) ? producto.marca : (producto.marca ? [producto.marca] : []);
      const marcasUnicas = Array.from(new Set([...marcasActuales, newMarca.trim()]));
      const updatedProduct = {
        ...producto,
        marca: marcasUnicas,
      };
      setEditableProducts(prevProducts =>
        prevProducts.map(prod =>
          prod._id === producto._id ? updatedProduct : prod
        )
      );
      setNewMarca('');
    }
  };

  const handleRemoveMarca = (producto, marcaToRemove) => {
    const updatedProduct = {
      ...producto,
      marca: Array.isArray(producto.marca) 
        ? producto.marca.filter((marca) => marca !== marcaToRemove)
        : [],
    };
    handleProductChange({ target: { value: updatedProduct.marca } }, "marca", updatedProduct);
  };

  return (
    <tr className="overflow-x-auto text-gray-600">
      <td className="px-4 py-2 border">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
        />
      </td>
      <td className="px-4 py-2 border">
        {index}
      </td>
      <td className="px-2 py-2 border">
        {selectedProduct === producto._id ? (
          <input
            type="text"
            value={producto.nombre}
            onChange={(e) => handleProductChange(e, "nombre", producto)}
            className="w-full p-1 border"
          />
        ) : (
          producto.nombre
        )}
      </td>
      <td className="px-2 py-2 border">
        {selectedProduct === producto._id ? (
          <input
            type="text"
            value={producto.descripcion}
            onChange={(e) => handleProductChange(e, "descripcion", producto)}
            className="w-full p-1 border"
          />
        ) : (
          producto.descripcion
        )}
      </td>
      <td className="px-2 py-2 border">
        {selectedProduct === producto._id ? (
          <div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newMarca}
                onChange={e => setNewMarca(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMarca(producto);
                  }
                }}
                placeholder="Agregar marca"
                className="flex-1 p-1 border"
              />
              <button
                type="button"
                onClick={() => handleAddMarca(producto)}
                className="px-2 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(producto.marca) && producto.marca.map((marca, index) => (
                <div key={index} className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 rounded">
                  <span>{marca}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMarca(producto, marca)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {Array.isArray(producto.marca) && producto.marca.map((marca, index) => (
              <div key={index} className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 rounded">
                <span>{marca}</span>
              </div>
            ))}
          </div>
        )}
      </td>
      <td className="px-2 py-2 border">
        {selectedProduct === producto._id ? (
          <select
            value={producto.categoria}
            onChange={(e) => handleProductChange(e, "categoria", producto)}
            className="w-full p-1 border"
          >
            <option value="zapatillas">Zapatillas</option>
            <option value="ropa">Ropa</option>
            <option value="accesorios">Accesorios</option>
          </select>
        ) : (
          producto.categoria
        )}
      </td>
      <td className="px-2 py-2 border">
        {selectedProduct === producto._id ? (
          <input
            type="number"
            value={producto.precio}
            onChange={(e) => handleProductChange(e, "precio", producto)}
            className="w-full p-1 border"
          />
        ) : (
          <div>
            <p>${producto.precio} USD</p>
            <p>${(producto.precio * dolarBlue).toFixed(2)} ARS</p>
          </div>
        )}
      </td>
      <td className="px-2 py-2 border">
        <div className="flex flex-col gap-1">
          {producto.tallas.map((talla, index) => (
            <div key={index} className="flex items-center gap-2">
              <span>{talla.talla}</span>
              {selectedProduct === producto._id && (
                <button
                  onClick={() => handleDeleteTalla(index)}
                  className="p-1 text-white bg-red-500 rounded"
                >
                  <RiDeleteBin5Line />
                </button>
              )}
            </div>
          ))}
          {selectedProduct === producto._id && (
            <>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTalla}
                  onChange={(e) => setNewTalla(e.target.value)}
                  placeholder="Nueva talla"
                  className="w-20 p-1 border"
                />
                <input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  placeholder="Precio"
                  className="w-20 p-1 border"
                />
                <button
                  onClick={handleAddTalla}
                  className="p-1 text-white bg-blue-500 rounded"
                >
                  <IoAddCircleOutline />
                </button>
              </div>
              <button
                type="button"
                onClick={handleOpenSizeModal}
                className="px-2 py-1 mb-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Seleccionar tallas
              </button>
              <SizeSelectionModal
                isOpen={isSizeModalOpen}
                onClose={() => setIsSizeModalOpen(false)}
                selectedSizes={selectedSizes}
                setSelectedSizes={setSelectedSizes}
                sizePrices={sizePrices}
                setSizePrices={setSizePrices}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleUpdateSizes}
                  className="px-2 py-1 text-white bg-green-600 rounded hover:bg-green-700"
                >
                  Guardar tallas seleccionadas
                </button>
              </div>
            </>
          )}
        </div>
      </td>
      <td className="px-2 py-2 border">
        <div className="flex flex-col gap-1">
          {producto.colores.map((color, index) => (
            <div key={index} className="flex items-center gap-2">
              <span>{color.color}</span>
              {selectedProduct === producto._id && (
                <button
                  onClick={() => handleDeleteColor(index)}
                  className="p-1 text-white bg-red-500 rounded"
                >
                  <RiDeleteBin5Line />
                </button>
              )}
            </div>
          ))}
          {selectedProduct === producto._id && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="Nuevo color"
                className="w-full p-1 border"
              />
              <button
                onClick={handleAddColor}
                className="p-1 text-white bg-blue-500 rounded"
              >
                <IoAddCircleOutline />
              </button>
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-2 border">
        <div className="relative w-16 h-16">
          <Image
            src={newImage || getImageUrl(producto)}
            alt={producto.nombre}
            width={64}
            height={64}
            className="object-cover w-full h-full"
            unoptimized={true}
          />
          {selectedProduct === producto._id && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <span className="text-white text-sm">Cambiar imagen</span>
              </label>
            </div>
          )}
        </div>
      </td>
      <td className="px-2 py-2 border">
        {selectedProduct === producto._id ? (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={producto.destacado}
              onChange={handleDestacadoChange}
              className="mr-2"
            />
            Destacado
          </label>
        ) : producto.destacado ? (
          "Sí"
        ) : (
          "No"
        )}
      </td>
      <td className="px-2 py-2 border">
        {selectedProduct === producto._id ? (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={producto.destacado_zapatillas}
              onChange={handleDestacadoZapatillasChange}
              className="mr-2"
            />
            Destacado Z
          </label>
        ) : producto.destacado_zapatillas ? (
          "Sí"
        ) : (
          "No"
        )}
      </td>
      <td className="px-2 py-2 border">
        {selectedProduct === producto._id ? (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={producto.encargo}
              onChange={handleEncargoChange}
              className="mr-2"
            />
            Encargo
          </label>
        ) : producto.encargo ? (
          "Sí"
        ) : (
          "No"
        )}
      </td>
      <td className="px-2 py-2 text-center border">
        {selectedProduct === producto._id ? (
          <div>
            <button
              onClick={() => handleProductUpdate(producto)}
              className="px-2 py-1 text-white bg-blue-500 rounded"
            >
              Guardar
            </button>
            <button
              onClick={() => setSelectedProduct(null)}
              className="px-[6px] py-1 text-white bg-red-500 rounded my-1"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleProductSelect(producto._id)}
            className="px-2 py-1 text-white bg-blue-500 rounded"
          >
            Editar
          </button>
        )}
        <button
          onClick={handleProductDelete}
          className="px-2 py-1 text-white bg-red-500 rounded"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
};

export default ProductRow;
