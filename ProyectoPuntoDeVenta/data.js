// data.js
const productosBase = [
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

function obtenerInventario() {
    // Busca si ya hay datos guardados en el navegador
    let inventario = localStorage.getItem('inventarioAutoParts');
    
    // Si no hay, carga los productos base y los guarda
    if (!inventario) {
        localStorage.setItem('inventarioAutoParts', JSON.stringify(productosBase));
        return productosBase;
    }
    
    // Si ya hay, los convierte de texto a objeto y los devuelve
    return JSON.parse(inventario);
}

function guardarInventario(inventario) {
    // Guarda los cambios actualizados en el navegador
    localStorage.setItem('inventarioAutoParts', JSON.stringify(inventario));
}