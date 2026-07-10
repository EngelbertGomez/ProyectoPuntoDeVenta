const productos = [
    { id: 1, sku: 'SUSP-4X4-01', nombre: 'Kit de Suspensión 4x4 (2")', precio: 45000, stock: 10 },
    { id: 2, sku: 'TIRE-AT-285', nombre: 'Neumático Off-Road A/T 285/70R17', precio: 12500, stock: 10 },
    { id: 3, sku: 'WNC-12K-00', nombre: 'Winche de 12,000 lbs', precio: 32000, stock: 10 },
    { id: 4, sku: 'BRK-PAD-09', nombre: 'Pastillas de Freno (Cerámica)', precio: 2800, stock: 10 },
    { id: 5, sku: 'FIL-OIL-K5', nombre: 'Filtro de Aceite Sintético', precio: 850, stock: 10 },
    { id: 6, sku: 'LGT-LED-BAR', nombre: 'Barra LED 42 pulgadas', precio: 5400, stock: 10 },
    { id: 7, sku: 'BATT-12V-75', nombre: 'Batería 12V 75Ah', precio: 6200, stock: 10 },
    { id: 8, sku: 'SPK-PLG-IR', nombre: 'Bujías de Iridio (Set x4)', precio: 3100, stock: 10 },
    { id: 9, sku: 'ALT-120A', nombre: 'Alternador 120A', precio: 8900, stock: 10 },
    { id: 10, sku: 'RAD-ALU-01', nombre: 'Radiador de Aluminio', precio: 7500, stock: 10 }
];

const grid = document.getElementById('product-grid');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const statusMessage = document.getElementById('status-message');
const btnClear = document.getElementById('btn-clear');
const btnCheckout = document.getElementById('btn-checkout');

let carrito = [];

function renderProductos() {
    grid.innerHTML = '';

    productos.forEach((producto) => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Determinar clase de stock
        const stockClass = producto.stock > 0 ? 'stock-ok' : 'stock-out';
        
        card.innerHTML = `
            <span class="sku">${producto.sku}</span>
            <h3>${producto.nombre}</h3>
            <p class="price">RD$ ${producto.precio.toLocaleString('es-DO')}</p>
            <div class="stock-info ${stockClass}">Stock: ${producto.stock}</div>
            <button class="add-btn" data-id="${producto.id}" ${producto.stock === 0 ? 'disabled' : ''}>
                ${producto.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
            </button>
        `;
        grid.appendChild(card);
    });

    // Eventos a los botones de "Agregar"
    const addButtons = document.querySelectorAll('.add-btn');
    addButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = Number(e.target.dataset.id);
            agregarAlCarrito(id);
        });
    });
}

function renderCarrito() {
    if (carrito.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-state">
                Seleccione un producto para agregarlo a la cuenta.
            </div>
        `;
        cartTotal.textContent = 'RD$ 0.00';
        return;
    }

    cartItems.innerHTML = '';
    let subtotal = 0;

    carrito.forEach((item) => {
        const itemTotal = item.precio * item.cantidad;
        subtotal += itemTotal;

        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-title">${item.nombre}</div>
                <div class="cart-item-price">${item.sku}</div>
                <div class="qty-controls">
                    <button class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
                    <span>${item.cantidad}</span>
                    <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
                </div>
            </div>
            <div>
                <div style="font-weight: bold;">RD$ ${itemTotal.toLocaleString('es-DO')}</div>
                <button class="remove-btn" data-action="remove" data-id="${item.id}">Eliminar</button>
            </div>
        `;
        cartItems.appendChild(row);
    });

    cartTotal.textContent = `RD$ ${subtotal.toLocaleString('es-DO')}`;
}

function agregarAlCarrito(id) {
    const productoOriginal = productos.find(p => p.id === id);

    if (productoOriginal.stock <= 0) return;

    productoOriginal.stock -= 1;

    const existente = carrito.find((item) => item.id === id);
    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({ ...productoOriginal, cantidad: 1 });
    }

    renderProductos();
    renderCarrito();
    statusMessage.textContent = `${productoOriginal.nombre} agregado al carrito.`;
}

function cambiarCantidad(id, accion) {
    const itemCarrito = carrito.find((producto) => producto.id === id);
    const productoOriginal = productos.find((p) => p.id === id);

    if (!itemCarrito || !productoOriginal) return;

    if (accion === 'increase') {
        if (productoOriginal.stock > 0) {
            productoOriginal.stock -= 1;
            itemCarrito.cantidad += 1;
        } else {
            statusMessage.textContent = 'Stock insuficiente.';
            return;
        }
    } else if (accion === 'decrease') {
        itemCarrito.cantidad -= 1;
        productoOriginal.stock += 1;
    }

    if (itemCarrito.cantidad <= 0) {
        carrito = carrito.filter((producto) => producto.id !== id);
    }

    renderProductos();
    renderCarrito();
}

function limpiarCarrito() {
    carrito.forEach(item => {
        const prodOriginal = productos.find(p => p.id === item.id);
        if (prodOriginal) {
            prodOriginal.stock += item.cantidad;
        }
    });

    carrito = [];
    renderProductos();
    renderCarrito();
    statusMessage.textContent = 'Carrito vaciado. Stock restaurado.';
}

function procesarPago() {
    if (carrito.length === 0) {
        statusMessage.textContent = 'Agregue productos antes de procesar el pago.';
        return;
    }

    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    statusMessage.textContent = `Pago procesado por RD$ ${total.toLocaleString('es-DO')}.`;
    
    carrito = [];
    renderCarrito();
}

btnClear.addEventListener('click', limpiarCarrito);
btnCheckout.addEventListener('click', procesarPago);

cartItems.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === 'remove') {
        const item = carrito.find((i) => i.id === id);
        const prodOriginal = productos.find(p => p.id === id);
        if (item && prodOriginal) {
            prodOriginal.stock += item.cantidad;
        }
        
        carrito = carrito.filter((item) => item.id !== id);
        renderProductos();
        renderCarrito();
        statusMessage.textContent = 'Producto eliminado del carrito.';
    } else {
        cambiarCantidad(id, action);
    }
});

// Inicialización
renderProductos();
renderCarrito();