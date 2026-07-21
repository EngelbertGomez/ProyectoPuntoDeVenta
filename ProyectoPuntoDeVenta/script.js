const grid = document.getElementById('product-grid');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const statusMessage = document.getElementById('status-message');
const receiptOutput = document.getElementById('receipt-output');
const btnClear = document.getElementById('btn-clear');
const btnCheckout = document.getElementById('btn-checkout');

let productos = [];
let carrito = [];

function formatearMoneda(valor) {
    return `RD$ ${valor.toLocaleString('es-DO')}`;
}

function generarFactura(items, total) {
    const fecha = new Date().toLocaleString('es-DO');
    const lineas = [
        '=== AutoParts POS ===',
        'Factura de venta',
        `Fecha: ${fecha}`,
        '-------------------',
        ...items.map(item => `${item.cantidad}x ${item.nombre} - ${formatearMoneda(item.precio * item.cantidad)}`),
        '-------------------',
        `Total: ${formatearMoneda(total)}`
    ];

    return lineas.join('\n');
}

function mostrarFactura(items, total) {
    if (!receiptOutput) return;

    const textoFactura = generarFactura(items, total);
    receiptOutput.innerHTML = '';

    const titulo = document.createElement('div');
    titulo.className = 'receipt-title';
    titulo.textContent = 'Factura emitida';

    const bloque = document.createElement('pre');
    bloque.textContent = textoFactura;

    receiptOutput.appendChild(titulo);
    receiptOutput.appendChild(bloque);

    console.log(textoFactura);

    window.setTimeout(() => {
        if (typeof window.print === 'function') {
            window.print();
        }
    }, 150);
}

function renderProductos() {
    grid.innerHTML = '';

    productos.forEach((producto) => {
        const card = document.createElement('div');
        card.className = 'card';

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

async function cargarProductos() {
    productos = await window.AutoPartsDB.getInventory();
    renderProductos();
    renderCarrito();
}

async function guardarProductos() {
    await window.AutoPartsDB.saveInventory(productos);
}

async function agregarAlCarrito(id) {
    const productoOriginal = productos.find(p => p.id === id);

    if (!productoOriginal || productoOriginal.stock <= 0) return;

    productoOriginal.stock -= 1;
    await guardarProductos();

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

async function cambiarCantidad(id, accion) {
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

    await guardarProductos();
    renderProductos();
    renderCarrito();
}

async function limpiarCarrito() {
    carrito.forEach(item => {
        const prodOriginal = productos.find(p => p.id === item.id);
        if (prodOriginal) {
            prodOriginal.stock += item.cantidad;
        }
    });

    carrito = [];
    await guardarProductos();
    renderProductos();
    renderCarrito();
    statusMessage.textContent = 'Carrito vaciado. Stock restaurado.';
}

async function procesarPago() {
    if (carrito.length === 0) {
        statusMessage.textContent = 'Agregue productos antes de procesar el pago.';
        return;
    }

    const itemsProcesados = [...carrito];
    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

    statusMessage.textContent = `Pago procesado por ${formatearMoneda(total)}. Factura lista para imprimir.`;
    mostrarFactura(itemsProcesados, total);

    carrito = [];
    renderCarrito();
}

btnClear.addEventListener('click', () => limpiarCarrito());
btnCheckout.addEventListener('click', () => procesarPago());

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
        guardarProductos().then(() => {
            renderProductos();
            renderCarrito();
            statusMessage.textContent = 'Producto eliminado del carrito.';
        });
    } else {
        cambiarCantidad(id, action);
    }
});

async function inicializarPOS() {
    await window.AutoPartsDB.initDatabase();
    await cargarProductos();
    window.AutoPartsDB.subscribeToChanges((tipo) => {
        if (tipo === 'inventory') {
            cargarProductos();
        }
    });
}

inicializarPOS();