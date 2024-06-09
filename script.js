let db;
let puntos = [];

window.onload = function() {
    let request = indexedDB.open("DianaDB", 1);

    request.onerror = function(event) {
        console.log("Error al abrir la base de datos:", event.target.errorCode);
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        listarPuntos();
    };

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        let objectStore = db.createObjectStore("Puntos", { autoIncrement: true });
        objectStore.createIndex("x", "x", { unique: false });
        objectStore.createIndex("y", "y", { unique: false });
        objectStore.createIndex("puntos", "puntos", { unique: false });
    };

    dibujarDiana();

    let canvas = document.getElementById('dianaCanvas');
    let diana = document.getElementById('diana');
    canvas.width = diana.width;
    canvas.height = diana.height;

    diana.onclick = function(event) {
        let rect = diana.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        let puntos = calcularPuntos(x, y);
        agregarPunto(x, y, puntos);
    };

    document.getElementById('calcular-centro').onclick = function() {
        calcularCentroMedio();
    };

    document.getElementById('borrar-datos').onclick = function() {
        borrarTodosLosPuntos();
    };

    document.getElementById('calcular-total').onclick = function() {
        calcularTotalPuntos();
    };
};

function dibujarDiana() {
    let canvas = document.getElementById('diana');
    let ctx = canvas.getContext('2d');
    const colors = ['white', 'white', 'black', 'black', 'blue', 'blue', 'red', 'red', 'yellow', 'yellow'];
    const radius = [200, 180, 160, 140, 120, 100, 80, 60, 40, 20];
    
    for (let i = 0; i < radius.length; i++) {
        ctx.beginPath();
        ctx.arc(200, 200, radius[i], 0, Math.PI * 2);
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = (colors[i] === 'black') ? 'white' : 'black';
        ctx.stroke();
        ctx.closePath();
    }

    // Copiar el contenido del canvas de la diana al canvas dianaCanvas
    let dianaCanvas = document.getElementById('dianaCanvas');
    let ctxCanvas = dianaCanvas.getContext('2d');
    ctxCanvas.drawImage(canvas, 0, 0);
}

function agregarPunto(x, y, puntos) {
    let transaction = db.transaction(["Puntos"], "readwrite");
    let objectStore = transaction.objectStore("Puntos");
    let request = objectStore.add({ x: x, y: y, puntos: puntos });

    request.onsuccess = function() {
        console.log("Punto agregado:", { x, y, puntos });
        listarPuntos();
    };

    request.onerror = function(event) {
        console.log("Error al agregar punto:", event.target.errorCode);
    };
}

function listarPuntos() {
    puntos = [];
    let transaction = db.transaction(["Puntos"], "readonly");
    let objectStore = transaction.objectStore("Puntos");

    objectStore.openCursor().onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            puntos.push(cursor.value);
            cursor.continue();
        } else {
            dibujarPuntos();
        }
    };
}

function dibujarPuntos() {
    let canvas = document.getElementById('dianaCanvas');
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redibujar la diana
    let diana = document.getElementById('diana');
    ctx.drawImage(diana, 0, 0);

    for (let punto of puntos) {
        ctx.beginPath();
        ctx.arc(punto.x, punto.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    }
}

function calcularCentroMedio() {
    if (puntos.length === 0) {
        document.getElementById('resultado').innerText = "No hay puntos registrados.";
        return;
    }

    let sumaX = 0;
    let sumaY = 0;

    for (let punto of puntos) {
        sumaX += punto.x;
        sumaY += punto.y;
    }

    let centroX = sumaX / puntos.length;
    let centroY = sumaY / puntos.length;

    document.getElementById('resultado').innerText = `Centro Medio: (${centroX.toFixed(2)}, ${centroY.toFixed(2)})`;
    
    let canvas = document.getElementById('dianaCanvas');
    let ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(centroX, centroY, 10, 0, Math.PI * 2);
    ctx.strokeStyle = 'blue';
    ctx.stroke();
    ctx.closePath();
}

function borrarTodosLosPuntos() {
    let transaction = db.transaction(["Puntos"], "readwrite");
    let objectStore = transaction.objectStore("Puntos");

    let request = objectStore.clear();

    request.onsuccess = function() {
        console.log("Todos los puntos han sido borrados.");
        listarPuntos();
        document.getElementById('resultado').innerText = "";
    };

    request.onerror = function(event) {
        console.log("Error al borrar todos los puntos:", event.target.errorCode);
    };
}

function calcularPuntos(x, y) {
    const distances = [200, 180, 160, 140, 120, 100, 80, 60, 40, 20];
    const scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let distancia = Math.sqrt(Math.pow(x - 200, 2) + Math.pow(y - 200, 2));
    for (let i = distances.length - 1; i >= 0; i--) {
        if (distancia <= distances[i]) {
            return scores[i];
        }
    }
    return 0;
}

function calcularTotalPuntos() {
    if (puntos.length === 0) {
        document.getElementById('resultado').innerText = "No hay puntos registrados.";
        return;
    }

    let totalPuntos = 0;

    for (let punto of puntos) {
        totalPuntos += punto.puntos;
    }

    document.getElementById('resultado').innerText = `Total de Puntos: ${totalPuntos}`;
}
