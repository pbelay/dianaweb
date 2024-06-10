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

    let diana = document.getElementById('diana');

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

    document.getElementById('descargar-json').onclick = function() {
        descargarJSON();
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
    let canvas = document.getElementById('diana');
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redibujar la diana
    dibujarDiana();

    for (let punto of puntos) {
        ctx.beginPath();
        ctx.arc(punto.x, punto.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgb(120, 200, 150)';

        ctx.fill();
        ctx.closePath();
    }
}

function calcularCentroMedio() {
    if (puntos.length === 0) {
        document.getElementById('resultado').innerText = "Non hai puntos rexistrados.";
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

    let canvas = document.getElementById('diana');
    let ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(centroX, centroY, 10, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgb(10, 220, 010)';


    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.closePath();
}

function borrarTodosLosPuntos() {
    let transaction = db.transaction(["Puntos"], "readwrite");
    let objectStore = transaction.objectStore("Puntos");
    let request = objectStore.clear();

    request.onsuccess = function() {
        console.log("Todos los puntos han sido borrados.");
        puntos = [];
        dibujarPuntos();
        document.getElementById('resultado').innerText = "Datos borrados.";
    };

    request.onerror = function(event) {
        console.log("Error al borrar puntos:", event.target.errorCode);
    };
}

function calcularTotalPuntos() {
    let total = puntos.reduce((sum, punto) => sum + punto.puntos, 0);
    document.getElementById('resultado').innerText = `Total de Puntos: ${total}`;
}

function descargarJSON() {
    let exporta = new Object();
    exporta.nome=document.getElementById("nome").value ;
    exporta.frechas=document.getElementById("frechas").value;
    exporta.puntos = puntos;
    


    let json = JSON.stringify(exporta, null, 2);
    let blob = new Blob([json], { type: "application/json" });
    let url = URL.createObjectURL(blob);

    let a = document.createElement('a');
    a.href = url;
    a.download = "puntos.json";
    a.click();
}

function calcularPuntos(x, y) {
    
    let distancia = Math.sqrt((x - 200) * (x - 200) + (y - 200) * (y - 200)); // Distancia desde el centro de la diana

    if (distancia < 20) return 10;
    else if (distancia <= 40) return 9;
    else if (distancia <= 60) return 8;
    else if (distancia <= 80) return 7;
    else if (distancia <= 100) return 6;
    else if (distancia <= 120) return 5;
    else if (distancia <= 140) return 4;
    else if (distancia <= 160) return 3;
    else if (distancia <= 180) return 2;
    else if (distancia <= 200) return 1;
    else return 0;
}

