document.addEventListener('DOMContentLoaded', () => {
    // Elementos principales
    const appContainer = document.getElementById('appContainer');
    const registroContainer = document.getElementById('registroContainer');
    const loginContainer = document.getElementById('loginContainer');
    const formRegistro = document.getElementById('formRegistro');
    const formLogin = document.getElementById('formLogin');
    const formInsumo = document.getElementById('formInsumo');
    const formSalida = document.getElementById('formSalida');
    const lista = document.getElementById('listaInsumos');
    const tablaHistorial = document.getElementById('tablaHistorial');
    const insumoSeleccionado = document.getElementById('insumoSeleccionado');
    let filaSeleccionada = null;

    // --- Funciones de usuarios ---
    function guardarUsuarios(usuarios) {
        localStorage.setItem('usuarios_jensen', JSON.stringify(usuarios));
    }

    function cargarUsuarios() {
        return JSON.parse(localStorage.getItem('usuarios_jensen') || '[]');
    }

    function mostrarPantallaSegunUsuario() {
        const usuarioActual = JSON.parse(sessionStorage.getItem('usuarioActual'));

        if (!usuarioActual) {
            registroContainer.style.display = 'block';
            loginContainer.style.display = 'block';
            appContainer.style.display = 'none';
        } else {
            registroContainer.style.display = 'none';
            loginContainer.style.display = 'none';
            appContainer.style.display = 'block';
            document.querySelector('.titulo-principal').style.display = 'block';

            // Admin puede ver formulario de agregar stock
            formInsumo.style.display = usuarioActual.nivel === 'admin' ? 'block' : 'none';
        }
    }

    // --- Registro ---
    formRegistro.addEventListener('submit', (e) => {
        e.preventDefault();
        const usuario = document.getElementById('regUsuario').value.trim();
        const password = document.getElementById('regPassword').value;
        const nivel = document.getElementById('regNivel').value;

        let usuarios = cargarUsuarios();
        if (usuarios.some(u => u.usuario === usuario)) {
            alert('El usuario ya existe.');
            return;
        }

        usuarios.push({ usuario, password, nivel });
        guardarUsuarios(usuarios);
        alert('Usuario registrado correctamente.');
        formRegistro.reset();
    });

    // --- Login ---
 // --- Manejo de sesión --- //
function iniciarSesion(usuario) {
    sessionStorage.setItem("usuarioActual", usuario);
    mostrarPantallaSegunUsuario();
}

function cerrarSesion() {
    sessionStorage.removeItem("usuarioActual");
    mostrarPantallaSegunUsuario();
}

function mostrarPantallaSegunUsuario() {
    const usuario = sessionStorage.getItem("usuarioActual");
    const loginContainer = document.getElementById("loginContainer");
    const appContainer = document.getElementById("appContainer");

    if (usuario) {
        loginContainer.style.display = "none";
        appContainer.style.display = "block";
    } else {
        loginContainer.style.display = "block";
        appContainer.style.display = "none";
    }
}

// --- Listeners --- //
document.addEventListener("DOMContentLoaded", () => {
    const btnLogin = document.getElementById("btnLogin");
    const btnLogout = document.getElementById("btnLogout");

    if (btnLogin) {
        btnLogin.addEventListener("click", () => {
            const user = document.getElementById("usuario").value;
            const pass = document.getElementById("password").value;

            // login simple (ejemplo)
            if (user === "admin" && pass === "1234") {
                iniciarSesion(user);
            } else {
                alert("Usuario o contraseña incorrectos");
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener("click", cerrarSesion);
    }

    mostrarPantallaSegunUsuario(); // inicializa la pantalla correcta
});

    // --- Stock ---
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
        localStorage.setItem('stock_jensen', JSON.stringify(insumos));
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

    formInsumo.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value.trim();
        const cantidad = document.getElementById('cantidad').value.trim();
        const tipo = document.getElementById('tipo').value.trim();

        if (!nombre || !cantidad || !tipo) return;

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
        formInsumo.reset();
        guardarStock();
    });

    lista.addEventListener('click', (e) => {
        const tr = e.target.closest('tr');
        if (e.target.classList.contains('eliminar')) {
            if (confirm('¿Seguro que deseas eliminar este insumo?')) {
                if (filaSeleccionada === tr) {
                    insumoSeleccionado.value = '';
                    filaSeleccionada.classList.remove('resaltado');
                    filaSeleccionada = null;
                }
                tr.remove();
                guardarStock();
            }
        } else if (e.target.classList.contains('editar')) {
            const tds = tr.querySelectorAll('td');
            document.getElementById('nombre').value = tds[0].textContent;
            document.getElementById('cantidad').value = tds[1].textContent;
            document.getElementById('tipo').value = tds[2].textContent;
            tr.remove();
            guardarStock();
        } else if (e.target.classList.contains('seleccionar')) {
            if (filaSeleccionada) filaSeleccionada.classList.remove('resaltado');
            filaSeleccionada = tr;
            filaSeleccionada.classList.add('resaltado');
            insumoSeleccionado.value = tr.querySelector('td').textContent;
        }
    });

    // --- Historial ---
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

    formSalida.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = insumoSeleccionado.value.trim();
        const cantidadRetiro = document.getElementById('cantidadRetiro').value.trim();

        if (!nombre) return alert('Debes seleccionar un insumo.');
        if (!cantidadRetiro || isNaN(cantidadRetiro) || cantidadRetiro <= 0) return alert('Cantidad inválida.');

        const tr = document.createElement('tr');
        const fecha = new Date().toLocaleString();
        tr.innerHTML = `<td>${nombre}</td><td>${cantidadRetiro}</td><td>${fecha}</td>`;
        tablaHistorial.appendChild(tr);
        guardarHistorial();

        if (filaSeleccionada) {
            let cantidadActual = parseInt(filaSeleccionada.querySelectorAll('td')[1].textContent, 10);
            let cantidadARetirar = parseInt(cantidadRetiro, 10);
            if (cantidadARetirar > cantidadActual) return alert('No hay suficiente stock.');
            filaSeleccionada.querySelectorAll('td')[1].textContent = cantidadActual - cantidadARetirar;
        }

        insumoSeleccionado.value = '';
        filaSeleccionada?.classList.remove('resaltado');
        filaSeleccionada = null;
        document.getElementById('cantidadRetiro').value = '';
        guardarStock();
    });

    // --- Inicialización ---
    mostrarPantallaSegunUsuario();
    cargarStock();
    cargarHistorial();

    // --- Estilo resaltado ---
    const style = document.createElement('style');
    style.innerHTML = `.resaltado { background-color: #ffe082 !important; }`;
    document.head.appendChild(style);
});