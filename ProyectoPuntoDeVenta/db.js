const DB_NAME = 'AutoPartsPOS';
const DB_VERSION = 1;
const STORE_INVENTORY = 'inventory';
const STORE_CLIENTS = 'clients';
const CHANNEL_NAME = 'autoparts-pos-sync';

const DEFAULT_INVENTORY = [
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

const DEFAULT_CLIENTS = [
    { id: 1, nombre: 'Carlos Rodríguez', telefono: '(809) 555-0123', localidad: 'Bajos de Haina', vehiculo: 'Toyota Hilux 2018', totalComprado: 85400 },
    { id: 2, nombre: 'María Fernández', telefono: '(829) 555-0456', localidad: 'San Cristóbal', vehiculo: 'Honda CR-V 2021', totalComprado: 12500 },
    { id: 3, nombre: 'José Pérez', telefono: '(849) 555-7890', localidad: 'Santo Domingo', vehiculo: 'Nissan Frontier 2015', totalComprado: 45000 }
];

let dbPromise = null;
let channel = null;

function requestToPromise(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function transactionToPromise(transaction) {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
    });
}

function connectChannel() {
    if (typeof BroadcastChannel === 'undefined') return null;
    if (!channel) {
        channel = new BroadcastChannel(CHANNEL_NAME);
    }
    return channel;
}

function notifyChange(type) {
    const ch = connectChannel();
    if (ch) {
        ch.postMessage({ type });
    }
}

function subscribeToChanges(callback) {
    const ch = connectChannel();
    if (!ch) return () => {};

    ch.onmessage = (event) => {
        if (event.data?.type) {
            callback(event.data.type);
        }
    };

    return () => {
        if (ch) {
            ch.onmessage = null;
        }
    };
}

async function initDatabase() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_INVENTORY)) {
                const inventoryStore = db.createObjectStore(STORE_INVENTORY, { keyPath: 'id' });
                inventoryStore.createIndex('sku', 'sku', { unique: true });
            }

            if (!db.objectStoreNames.contains(STORE_CLIENTS)) {
                db.createObjectStore(STORE_CLIENTS, { keyPath: 'id' });
            }
        };

        request.onsuccess = async (event) => {
            const db = event.target.result;
            try {
                await seedDefaultData(db);
                resolve(db);
            } catch (error) {
                reject(error);
            }
        };

        request.onerror = () => reject(request.error);
    });

    return dbPromise;
}

async function seedDefaultData(db) {
    const inventoryTransaction = db.transaction(STORE_INVENTORY, 'readwrite');
    const inventoryStore = inventoryTransaction.objectStore(STORE_INVENTORY);
    const inventoryCount = await requestToPromise(inventoryStore.count());

    if (inventoryCount === 0) {
        DEFAULT_INVENTORY.forEach(item => inventoryStore.put(item));
    }

    const clientsTransaction = db.transaction(STORE_CLIENTS, 'readwrite');
    const clientsStore = clientsTransaction.objectStore(STORE_CLIENTS);
    const clientsCount = await requestToPromise(clientsStore.count());

    if (clientsCount === 0) {
        DEFAULT_CLIENTS.forEach(client => clientsStore.put(client));
    }

    await Promise.all([
        transactionToPromise(inventoryTransaction),
        transactionToPromise(clientsTransaction)
    ]);
}

async function getInventory() {
    const db = await initDatabase();
    const transaction = db.transaction(STORE_INVENTORY, 'readonly');
    const store = transaction.objectStore(STORE_INVENTORY);
    return requestToPromise(store.getAll());
}

async function saveInventory(items) {
    const db = await initDatabase();
    const transaction = db.transaction(STORE_INVENTORY, 'readwrite');
    const store = transaction.objectStore(STORE_INVENTORY);

    items.forEach(item => store.put(item));

    await transactionToPromise(transaction);
    notifyChange('inventory');
    return items;
}

async function getClients() {
    const db = await initDatabase();
    const transaction = db.transaction(STORE_CLIENTS, 'readonly');
    const store = transaction.objectStore(STORE_CLIENTS);
    return requestToPromise(store.getAll());
}

async function addClient(clientData) {
    const db = await initDatabase();
    const transaction = db.transaction(STORE_CLIENTS, 'readwrite');
    const store = transaction.objectStore(STORE_CLIENTS);

    const client = {
        id: Date.now(),
        nombre: clientData.nombre,
        telefono: clientData.telefono,
        localidad: clientData.localidad,
        vehiculo: clientData.vehiculo,
        totalComprado: Number(clientData.totalComprado) || 0
    };

    store.put(client);
    await transactionToPromise(transaction);
    notifyChange('clients');
    return client;
}

window.AutoPartsDB = {
    initDatabase,
    getInventory,
    saveInventory,
    getClients,
    addClient,
    subscribeToChanges
};
