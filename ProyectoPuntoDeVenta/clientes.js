const tableBody = document.getElementById('clientes-table-body');
const form = document.getElementById('client-form');

let clientes = [];

function formatearMoneda(valor) {
    return `RD$ ${Number(valor).toLocaleString('es-DO')}`;
}

function renderClientes() {
    tableBody.innerHTML = '';

    if (clientes.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No hay clientes registrados todavía.</td></tr>';
        return;
    }

    clientes.forEach((cliente) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${cliente.nombre}</strong></td>
            <td>${cliente.telefono}</td>
            <td>${cliente.localidad}</td>
            <td><span class="badge">${cliente.vehiculo}</span></td>
            <td>${formatearMoneda(cliente.totalComprado)}</td>
        `;
        tableBody.appendChild(row);
    });
}

async function cargarClientes() {
    clientes = await window.AutoPartsDB.getClients();
    renderClientes();
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());
    await window.AutoPartsDB.addClient(data);
    form.reset();
    await cargarClientes();
});

async function inicializarClientes() {
    await window.AutoPartsDB.initDatabase();
    await cargarClientes();
    window.AutoPartsDB.subscribeToChanges((tipo) => {
        if (tipo === 'clients') {
            cargarClientes();
        }
    });
}

inicializarClientes();
