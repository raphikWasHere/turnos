let datosCalendario = new Map();

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const lineas = event.target.result.split('\n');
            datosCalendario.clear();
            
            lineas.forEach(linea => {
                const [fecha, turnos] = linea.split(':').map(i => i.trim());
                if(fecha && turnos) datosCalendario.set(fecha, turnos);
            });
            
            const fechas = Array.from(datosCalendario.keys());
            if(fechas.length > 0) {
                const primeraFecha = parseFecha(fechas[0]);
                const ultimaFecha = parseFecha(fechas[fechas.length-1]);
                
                document.getElementById('startDate').value = formatFechaInput(primeraFecha);
                document.getElementById('endDate').value = formatFechaInput(ultimaFecha);
            }
        } catch (error) {
            console.error("Error procesando archivo:", error);
            alert(`Error: ${error.message}`);
        }
    };
    
    reader.readAsText(file);
});

function generarCalendario() {
    const start = document.getElementById('startDate').valueAsDate;
    const end = document.getElementById('endDate').valueAsDate;
    
    if(!start || !end || start > end) {
        alert("Por favor seleccione un rango de fechas válido");
        return;
    }

    const calendario = document.getElementById('calendario');
    calendario.innerHTML = '';
    
    let current = new Date(start);
    const last = new Date(end);
    let diasSemanaActual = Array(7).fill(null);

    while(current <= last) {
        const diaSemana = (current.getDay() + 6) % 7; // Convertir a 0=Lunes, 6=Domingo
        const dia = crearDiaElemento(current, start, end);
        
        diasSemanaActual[diaSemana] = dia;

        if(diaSemana === 6 || current.getTime() === last.getTime()) {
            const semana = document.createElement('div');
            semana.className = 'semana';
            
            // Rellenar semana completa
            for(let i = 0; i < 7; i++) {
                const dia = diasSemanaActual[i] || crearDiaVacio();
                semana.appendChild(dia);
            }

            calendario.appendChild(semana);
            diasSemanaActual = Array(7).fill(null);
        }

        current.setDate(current.getDate() + 1);
    }
}

function crearDiaElemento(date, start, end) {
    const dia = document.createElement('div');
    dia.className = 'dia';
    const dentroRango = date >= start && date <= end;
    const fechaStr = formatFecha(date);
    
    dia.innerHTML = `
        <div class="numero-dia">${formatFechaDia(date)}</div>
        ${dentroRango ? generarTurnos(fechaStr) : ''}
    `;
    
    if(!dentroRango) dia.classList.add('dia-vacio');
    return dia;
}

function crearDiaVacio() {
    const dia = document.createElement('div');
    dia.className = 'dia dia-vacio';
    dia.innerHTML = `<div class="numero-dia"></div>`;
    return dia;
}

function generarTurnos(fecha) {
    const turnos = datosCalendario.get(fecha) || 'P R M';
    return `
        <div class="turnos">
            ${['P','R','M'].map(letra => {
                const estado = obtenerEstadoTurno(letra, turnos);
                return `<div class="turno ${estado}" data-persona="${letra}">${letra}</div>`;
            }).join('')}
        </div>
    `;
}

function obtenerEstadoTurno(letra, turnos) {
    const regex = new RegExp(letra, 'gi');
    const match = turnos.match(regex);
    
    if(!match) return 'inactivo';
    const coincidenciaExacta = match.some(m => m === letra);
    return coincidenciaExacta ? 'activo' : 'minuscula';
}

// Nueva función para formato dd/mm/aa
function formatFechaDia(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = String(date.getFullYear()).slice(2);
    return `${d}/${m}/${y}`;
}

// Función original para formato dd-mm-aaaa (necesaria para el parseo)
function formatFecha(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
}

function formatFechaInput(date) {
    return date.toISOString().split('T')[0];
}

function parseFecha(fechaStr) {
    const [d, m, y] = fechaStr.split('-');
    return new Date(y, m-1, d);
}

