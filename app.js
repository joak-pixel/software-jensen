document.addEventListener('DOMContentLoaded', () => {
    function guardarStock() {
    const insumos = [];
    lista.querySelectorAll('tr').forEach(tr => {
        const tds = tr.querySelectorAll('td');
        insumos.push({
            nombre: tds[0].textContent,
            cantidad: tds[1].textContent,
            tipo: tds[2].textContent
        });
    });
    localStorage.setItem('stock', JSON.stringify(insumos));
}

function cargarStock() {
    const insumos = JSON.parse(localStorage.getItem('stock_jensen') || '[]');
    lista.innerHTML = '';
    insumos.forEach(insumo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${insumo.nombre}</td>
            <td>${insumo.cantidad}</td>
            <td>${insumo.tipo}</td>
            <td>
                <button class="editar">Editar</button>
                <button class="eliminar">Eliminar</button>
                <button class="seleccionar">Seleccionar</button>
            </td>
        `;
        lista.appendChild(tr);
    });
}

function guardarHistorial() {
    const historial = [];
    tablaHistorial.querySelectorAll('tr').forEach(tr => {
        const tds = tr.querySelectorAll('td');
        historial.push({
            nombre: tds[0].textContent,
            cantidad: tds[1].textContent,
            fecha: tds[2].textContent
        });
    });
    localStorage.setItem('historial_jensen', JSON.stringify(historial));
}

function cargarHistorial() {
    const historial = JSON.parse(localStorage.getItem('historial_jensen') || '[]');
    tablaHistorial.innerHTML = '';
    historial.forEach(registro => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${registro.nombre}</td>
            <td>${registro.cantidad}</td>
            <td>${registro.fecha}</td>
        `;
        tablaHistorial.appendChild(tr);
    });
}
const formSalida = document.getElementById('formSalida');
const tablaHistorial = document.getElementById('tablaHistorial');

formSalida.addEventListener('submit', function(e) {
    
    e.preventDefault();

    const nombre = insumoSeleccionado.value.trim();
    const cantidadRetiro = document.getElementById('cantidadRetiro').value.trim();

    if (!nombre) {
        alert('Debes seleccionar un insumo.');
        return;
    }
    if (!cantidadRetiro || isNaN(cantidadRetiro) || cantidadRetiro <= 0) {
        alert('Cantidad inválida.');
        return;
    }

    // Registrar en historial
    const tr = document.createElement('tr');
    const fecha = new Date().toLocaleString();
    tr.innerHTML = `
        <td>${nombre}</td>
        <td>${cantidadRetiro}</td>
        <td>${fecha}</td>
    `;
    tablaHistorial.appendChild(tr);
guardarHistorial();

// Descontar del stock
    if (filaSeleccionada) {
        const cantidadActualTd = filaSeleccionada.querySelectorAll('td')[1];
        let cantidadActual = parseInt(cantidadActualTd.textContent, 10);
        let cantidadARetirar = parseInt(cantidadRetiro, 10);

        if (cantidadARetirar > cantidadActual) {
            alert('No hay suficiente stock para retirar esa cantidad.');
            return;
        }

        cantidadActualTd.textContent = cantidadActual - cantidadARetirar;
    }
    // Limpiar campo cantidad
    document.getElementById('cantidadRetiro').value = '';
    // Limpiar selección
    if (filaSeleccionada) {
        filaSeleccionada.classList.remove('resaltado');
        filaSeleccionada = null;
        insumoSeleccionado.value = '';
    }
    // Limpiar campo insumo seleccionado
    insumoSeleccionado.value = '';

});
    const form = document.getElementById('formInsumo');
    const lista = document.getElementById('listaInsumos');
    const insumoSeleccionado = document.getElementById('insumoSeleccionado');
    let filaSeleccionada = null;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const cantidad = document.getElementById('cantidad').value.trim();
        const tipo = document.getElementById('tipo').value.trim();

        if (nombre && cantidad && tipo) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${nombre}</td>
                <td>${cantidad}</td>
                <td>${tipo}</td>
                <td>
                    <button class="editar">Editar</button>
                    <button class="eliminar">Eliminar</button>
                    <button class="seleccionar">Seleccionar</button>
                </td>
            `;
            lista.appendChild(tr);

            form.reset();
        }
        guardarStock();
    });

    lista.addEventListener('click', function(e) {
        // Eliminar insumo con advertencia
        if (e.target.classList.contains('eliminar')) {
            if (confirm('¿Seguro que deseas eliminar este insumo?')) {
                if (filaSeleccionada === e.target.closest('tr')) {
                    insumoSeleccionado.value = '';
                    filaSeleccionada.classList.remove('resaltado');
                    filaSeleccionada = null;
                }
                e.target.closest('tr').remove();
            }
        }

        // Editar insumo
        if (e.target.classList.contains('editar')) {
            const tr = e.target.closest('tr');
            const tds = tr.querySelectorAll('td');
            document.getElementById('nombre').value = tds[0].textContent;
            document.getElementById('cantidad').value = tds[1].textContent;
            document.getElementById('tipo').value = tds[2].textContent;
            tr.remove();
        }

        // Seleccionar insumo
        if (e.target.classList.contains('seleccionar')) {
            if (filaSeleccionada) {
                filaSeleccionada.classList.remove('resaltado');
            }
            filaSeleccionada = e.target.closest('tr');
            filaSeleccionada.classList.add('resaltado');
            insumoSeleccionado.value = filaSeleccionada.querySelector('td').textContent;
        }
        guardarStock();
    });

    // Estilo para resaltar la fila seleccionada
    const style = document.createElement('style');
    style.innerHTML = `
        .resaltado {
            background-color: #ffe082 !important;
        }
    `;
    document.head.appendChild(style);

    cargarStock();
cargarHistorial();
});