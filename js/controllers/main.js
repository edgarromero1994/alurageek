import { servicesProducts } from "./services/product-services.js";

const productContainer = document.querySelector("[data-product]");
const form = document.querySelector("[data-form]");

function createCard(nombre, precio, imagen, id) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
    <img src="${imagen}" alt="${nombre}">
            <div class="description">
                <h2 class="nombre">${nombre}</h2>
                <div class="price-delete">
                    <span class="price">$${precio}</span>
                    <span class="btn-delete" data-id="${id}"><i class="ri-delete-bin-fill"></i></span>
                </div>
            </div>
    `;

    card.querySelector('.btn-delete').addEventListener('click', () => {
        // Mostrar el modal de confirmación antes de eliminar
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminarlo!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteProduct(id);
            }
        });
    });

    productContainer.appendChild(card);
    return card;
}

const render = async () => {
    try {
        const listProduct = await servicesProducts.productList();
        productContainer.innerHTML = '';  // Limpiar el contenedor antes de renderizar
        listProduct.forEach(product => {
            productContainer.appendChild(
                createCard(
                    product.nombre,
                    product.precio,
                    product.imagen,
                    product.id
                )
            )
        });
    } catch (error) {
        console.log(error)
    }
}

const limpiarBtn = document.getElementById("limpiar");
limpiarBtn.addEventListener("click", () => {
    document.getElementById("producto-form").reset(); 
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const nombreInput = document.querySelector("[data-name]");
    const precioInput = document.querySelector("[data-price]");
    const imagenInput = document.querySelector("[data-image]");

    if (nombreInput.value.trim() === "") {
        mostrarMensajeError(nombreInput, "Por favor, ingresa el nombre del producto.");
        return; 
    }
    if (precioInput.value.trim() === "") {
        mostrarMensajeError(precioInput, "Por favor, ingresa el precio del producto.");
        return;
    }
    if (imagenInput.value.trim() === "") {
        mostrarMensajeError(imagenInput, "Por favor, ingresa la URL de la imagen del producto.");
        return;
    }

    // Si todos los campos están llenos, enviar el formulario
    servicesProducts.createProducts(nombreInput.value, precioInput.value, imagenInput.value)
        .then((res) => {
            console.log(res);
            // Mostrar el modal de confirmación
            Swal.fire({
                icon: 'success',
                title: 'Producto Agregado',
                text: 'El producto ha sido agregado exitosamente.',
                timer: 2000,  // 2 segundos
                timerProgressBar: true,
                didClose: () => {
                    // Volver a renderizar la lista de productos después de que el modal se cierra
                    render();
                }
            });

            // Limpiar campos del formulario después del envío
            document.getElementById("producto-form").reset();
        })
        .catch((err) => console.log(err));
});

// Función para mostrar un mensaje de error debajo del campo vacío
function mostrarMensajeError(inputElement, mensaje) {
    const errorContainer = inputElement.nextElementSibling;
    errorContainer.textContent = mensaje;
}

function deleteProduct(productId) {
    servicesProducts.deleteProduct(productId)
        .then(() => {
            productContainer.innerHTML = '';
            render();
            Swal.fire(
                'Eliminado!',
                'El producto ha sido eliminado.',
                'success'
            )
        })
        .catch((err) => console.log(err));
}

render();