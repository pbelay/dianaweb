let db;
let puntos = [];
let tiradas = new Array();

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
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 7;
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



// Función para obtener el color según la puntuación
function obtenerColor(puntos) {
    switch (puntos) {
        case 1:
        case 2:
            return 'white';
        case 3:
        case 4:
            return 'black';
        case 5:
        case 6:
            return 'blue';
        case 7:
        case 8:
            return 'red';
        case 9:
        case 10:
            return 'yellow';
        default:
            return 'transparent'; // Si la puntuación no es válida, devolvemos transparente
    }
}

// Función para limpiar la diana
function limpiarDiana() {
    let canvas = document.getElementById('dianaCanvas');
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


$(document).ready(function() {
    $('#nueva-tirada').click(function() {
        
        limpiarDiana(); // Limpiar la diana
        // Copiar los valores del array puntos al array de tiradas
        tiradas.push(puntos.slice());

        let tiradaNum = $('#tabla-puntuaciones tr').length + 1;
        let puntosTirada = 0; // Inicializar los puntos de la tirada

        // Construir la fila de la tabla
        let fila = `<tr id="tirada-${tiradaNum}">`;

        // Añadir evento click al canvas para registrar los puntos de cada disparo
        $('#dianaCanvas').click(function(event) {
            let canvas = document.getElementById('dianaCanvas');
            let rect = canvas.getBoundingClientRect();
            let x = event.clientX - rect.left; // Coordenada x del click relativa al canvas
            let y = event.clientY - rect.top; // Coordenada y del click relativa al canvas
            let puntos = calcularPuntos(x, y); // Calcular los puntos del disparo según la posición del click
            let color = obtenerColor(puntos); // Obtener el color del disparo
            puntosTirada += puntos; // Sumar los puntos del disparo a los puntos totales de la tirada
            fila += `
                <td style="background-color: ${color};">${puntos}</td>
            `;
        });

        // Añadir botón para mostrar puntos totales de la tirada
        fila += `
            <td>
                <button class="btn btn-info mostrar-puntos-tirada">Mostrar Puntos</button>
            </td>
        `;

        fila += `</tr>`;
        
        // Añadir la fila a la tabla
        $('#tabla-puntuaciones').append(fila);
        
        // Evento para mostrar los puntos totales de la tirada
        $(`#tirada-${tiradaNum} .mostrar-puntos-tirada`).click(function() {
            alert(`Puntos totales de la tirada ${tiradaNum}: ${puntosTirada}`);
        });
        
    });
});




function calcularPuntos(x, y) {
    let radio = Math.sqrt((x - 200) * (x - 200) + (y - 200) * (y - 200)); // Distancia desde el centro de la diana
    let puntos = 0;

    // Determinar el número de puntos en función del radio
    if (radio <= 20) {
        puntos = 10;
    } else if (radio <= 40) {
        puntos = 9;
    } else if (radio <= 60) {
        puntos = 8;
    } else if (radio <= 80) {
        puntos = 7;
    } else if (radio <= 100) {
        puntos = 6;
    } else if (radio <= 120) {
        puntos = 5;
    } else if (radio <= 140) {
        puntos = 4;
    } else if (radio <= 160) {
        puntos = 3;
    } else if (radio <= 180) {
        puntos = 2;
    } else if (radio <= 200) {
        puntos = 1;
    } else {
        puntos = 0;
    }

    return puntos;
}
