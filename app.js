// Espera a que todo el HTML esté cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

    // =============================================================
    // 1. OBTENER REFERENCIAS A ELEMENTOS DEL DOM
    // =============================================================
    // Contenedores principales
    const appContainer = document.getElementById('appContainer');
    const registroContainer = document.getElementById('registroContainer');
    const loginContainer = document.getElementById('loginContainer');

    // Secciones dentro de la App (¡NUEVO!)
    const seccionAgregar = document.getElementById('seccionAgregar');
    const seccionRetirar = document.getElementById('seccionRetirar');

    // Formularios
    const formRegistro = document.getElementById('formRegistro');
    const formLogin = document.getElementById('formLogin');
    const formInsumo = document.getElementById('formInsumo');
    const formSalida = document.getElementById('formSalida');

    // Botones e Inputs
    const btnLogout = document.getElementById('btnLogout');
    const buscador = document.getElementById('buscador');
    const insumoSeleccionadoInput = document.getElementById('insumoSeleccionado');

    // Tablas y Listas
    const listaInsumosBody = document.getElementById('listaInsumos');
    const tablaHistorialBody = document.getElementById('tablaHistorial');


    // =============================================================
    // 2. FUNCIONES DE ALMACENAMIENTO (LocalStorage)
    // =============================================================
    const guardarEnStorage = (clave, valor) => localStorage.setItem(clave, JSON.stringify(valor));
    const cargarDeStorage = (clave) => JSON.parse(localStorage.getItem(clave) || '[]');

    // -- Funciones específicas --
    const guardarUsuarios = (usuarios) => guardarEnStorage('usuarios_jensen', usuarios);
    const cargarUsuarios = () => cargarDeStorage('usuarios_jensen');
    const guardarInsumos = (insumos) => guardarEnStorage('insumos_jensen', insumos);
    const cargarInsumos = () => cargarDeStorage('insumos_jensen');
    const guardarHistorial = (historial) => guardarEnStorage('historial_jensen', historial);
    const cargarHistorial = () => cargarDeStorage('historial_jensen');


    // =============================================================
    // 3. FUNCIONES PARA MANEJAR LA SESIÓN (SessionStorage)
    // =============================================================
    function iniciarSesion(usuario) {
        sessionStorage.setItem('usuarioActual', JSON.stringify(usuario));
        actualizarVista();
    }

    function cerrarSesion() {
        sessionStorage.removeItem('usuarioActual');
        formLogin.reset();
        actualizarVista();
    }

    function obtenerUsuarioActual() {
        return JSON.parse(sessionStorage.getItem('usuarioActual'));
    }


    // =============================================================
    // 4. FUNCIONES PARA RENDERIZAR (DIBUJAR EN PANTALLA)
    // =============================================================
    function renderizarInsumos(filtro = '') {
        const insumos = cargarInsumos();
        listaInsumosBody.innerHTML = ''; // Limpiar la tabla antes de dibujar

        const insumosFiltrados = insumos.filter(insumo =>
            insumo.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
            insumo.tipo.toLowerCase().includes(filtro.toLowerCase())
        );

        if (insumosFiltrados.length === 0) {
            listaInsumosBody.innerHTML = '<tr><td colspan="4">No hay insumos en el inventario.</td></tr>';
            return;
        }

        insumosFiltrados.forEach(insumo => {
            const tr = document.createElement('tr');
            let claseStock = '';
            if (insumo.cantidad === 0) {
                claseStock = 'stock-critico';
            } else if (insumo.cantidad > 0 && insumo.cantidad <= 5) {
                claseStock = 'stock-advertencia';
            }
            tr.className = claseStock;

            tr.innerHTML = `
                <td>${insumo.nombre}</td>
                <td>${insumo.cantidad}</td>
                <td>${insumo.tipo}</td>
                <td>
                    <button class="btn-seleccionar" data-nombre="${insumo.nombre}">Seleccionar</button>
                </td>
            `;
            listaInsumosBody.appendChild(tr);
        });
    }

    function renderizarHistorial() {
        const historial = cargarHistorial();
        tablaHistorialBody.innerHTML = '';

        if (historial.length === 0) {
            tablaHistorialBody.innerHTML = '<tr><td colspan="3">No hay retiros registrados.</td></tr>';
            return;
        }
        
        historial.slice().reverse().forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>${new Date(item.fecha).toLocaleString()}</td>
            `;
            tablaHistorialBody.appendChild(tr);
        });
    }


    // =============================================================
    // 5. FUNCIÓN PARA ACTUALIZAR LA VISTA (UI) (¡MODIFICADO!)
    // =============================================================
    function actualizarVista() {
        const usuarioActual = obtenerUsuarioActual();

        if (usuarioActual) {
            // --- Hay un usuario logueado ---
            loginContainer.style.display = 'none';
            registroContainer.style.display = 'none';
            appContainer.style.display = 'block';

            renderizarInsumos();
            renderizarHistorial();

            // --- Lógica de permisos por rol MODIFICADA ---
            // Ahora controla la visibilidad de las secciones completas
            if (usuarioActual.nivel === 'administrador') {
                seccionAgregar.style.display = 'block';
                seccionRetirar.style.display = 'block';
            } else if (usuarioActual.nivel === 'operario') {
                seccionAgregar.style.display = 'none';
                seccionRetirar.style.display = 'block';
            }

        } else {
            // --- No hay nadie logueado ---
            loginContainer.style.display = 'block';
            registroContainer.style.display = 'block';
            appContainer.style.display = 'none';
        }
    }


    // =============================================================
    // 6. EVENT LISTENERS (MANEJADORES DE EVENTOS)
    // =============================================================

    // --- Formulario de REGISTRO ---
    formRegistro.addEventListener('submit', (e) => {
        e.preventDefault();
        const usuario = document.getElementById('regUsuario').value.trim();
        const password = document.getElementById('regPassword').value;
        const nivel = document.getElementById('regNivel').value;

        if (!usuario || !password || !nivel) {
            alert('Todos los campos son obligatorios.');
            return;
        }

        let usuarios = cargarUsuarios();
        if (usuarios.some(u => u.usuario === usuario)) {
            alert('El nombre de usuario ya existe.');
            return;
        }

        usuarios.push({ usuario, password, nivel });
        guardarUsuarios(usuarios);
        alert('Usuario registrado correctamente. Ahora puedes iniciar sesión.');
        formRegistro.reset();
    });

    // --- Formulario de LOGIN ---
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const usuarioInput = document.getElementById('loginUsuario').value;
        const passwordInput = document.getElementById('loginPassword').value;
        const usuarios = cargarUsuarios();
        const usuarioEncontrado = usuarios.find(u => u.usuario === usuarioInput && u.password === passwordInput);

        if (usuarioEncontrado) {
            iniciarSesion(usuarioEncontrado);
        } else {
            alert('Usuario o contraseña incorrectos.');
        }
    });

    // --- Botón de LOGOUT ---
    btnLogout.addEventListener('click', cerrarSesion);

    // --- Formulario para AGREGAR INSUMO ---
    formInsumo.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value.trim();
        const cantidad = parseInt(document.getElementById('cantidad').value);
        const tipo = document.getElementById('tipo').value.trim();

        if (!nombre || !tipo || isNaN(cantidad) || cantidad <= 0) {
            alert('Por favor, complete todos los campos correctamente.');
            return;
        }

        let insumos = cargarInsumos();
        const insumoExistente = insumos.find(ins => ins.nombre.toLowerCase() === nombre.toLowerCase());

        if (insumoExistente) {
            insumoExistente.cantidad += cantidad;
        } else {
            insumos.push({ nombre, cantidad, tipo });
        }

        guardarInsumos(insumos);
        renderizarInsumos();
        formInsumo.reset();
        alert('Stock agregado correctamente.');
    });

    // --- Formulario para RETIRAR INSUMO ---
    formSalida.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombreInsumo = insumoSeleccionadoInput.value;
        const cantidadRetiro = parseInt(document.getElementById('cantidadRetiro').value);

        if (!nombreInsumo || isNaN(cantidadRetiro) || cantidadRetiro <= 0) {
            alert('Seleccione un insumo y especifique una cantidad válida.');
            return;
        }

        let insumos = cargarInsumos();
        const insumo = insumos.find(ins => ins.nombre === nombreInsumo);

        if (!insumo) {
            alert('El insumo seleccionado ya no existe.');
            return;
        }
        if (insumo.cantidad < cantidadRetiro) {
            alert(`No hay stock suficiente. Stock actual: ${insumo.cantidad}`);
            return;
        }
        
        insumo.cantidad -= cantidadRetiro;
        guardarInsumos(insumos);

        let historial = cargarHistorial();
        historial.push({
            nombre: nombreInsumo,
            cantidad: cantidadRetiro,
            fecha: new Date().toISOString()
        });
        guardarHistorial(historial);

        renderizarInsumos();
        renderizarHistorial();
        formSalida.reset();
        alert('Stock retirado correctamente.');
    });
    
    // --- Botón SELECCIONAR en la lista de insumos ---
    listaInsumosBody.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('btn-seleccionar')) {
            const nombre = e.target.getAttribute('data-nombre');
            insumoSeleccionadoInput.value = nombre;
        }
    });

    // --- BUSCADOR de insumos ---
    buscador.addEventListener('input', (e) => {
        renderizarInsumos(e.target.value);
    });


    // =============================================================
    // 7. INICIALIZACIÓN
    // =============================================================
    actualizarVista();

});

