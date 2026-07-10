// inventario.js
const tbody = document.getElementById('tabla-inventario-body');

function renderTabla() {
    const inventario = obtenerInventario();
    tbody.innerHTML = ''; // Limpiamos la tabla

    inventario.forEach(prod => {
        const tr = document.createElement('tr');
        
        // Lógica de colores para el estado del stock
        let estadoHtml = '';
        if (prod.stock > 5) {
            estadoHtml = '<span style="color: #27ae60; font-weight: bold;">En Stock</span>';
        } else if (prod.stock > 0) {
            estadoHtml = '<span style="color: #f39c12; font-weight: bold;">Bajo</span>';
        } else {
            estadoHtml = '<span style="color: var(--accent); font-weight: bold;">Agotado</span>';
        }

        tr.innerHTML = `
            <td>${prod.sku}</td>
            <td>${prod.nombre}</td>
            <td>RD$ ${prod.precio.toLocaleString('es-DO')}</td>
            <td><strong>${prod.stock}</strong></td>
            <td>${estadoHtml}</td>
            <td class="action-links">
                <a href="#">Editar</a>
                <a href="#" class="delete">Eliminar</a>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Inicializar
renderTabla();