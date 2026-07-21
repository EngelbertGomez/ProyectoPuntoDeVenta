const tbody = document.getElementById('tabla-inventario-body');

async function renderTabla() {
    const inventario = await window.AutoPartsDB.getInventory();
    tbody.innerHTML = '';

    inventario.forEach(prod => {
        let estadoHtml = '';
        if (prod.stock > 5) {
            estadoHtml = '<span style="color: #27ae60; font-weight: bold;">En Stock</span>';
        } else if (prod.stock > 0) {
            estadoHtml = '<span style="color: #f39c12; font-weight: bold;">Bajo</span>';
        } else {
            estadoHtml = '<span style="color: var(--accent); font-weight: bold;">Agotado</span>';
        }

        const tr = document.createElement('tr');
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

async function inicializarInventario() {
    await window.AutoPartsDB.initDatabase();
    await renderTabla();
    window.AutoPartsDB.subscribeToChanges((tipo) => {
        if (tipo === 'inventory') {
            renderTabla();
        }
    });
}

inicializarInventario();