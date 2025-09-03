document.addEventListener('DOMContentLoaded', () => {

    // =============================================================
    // 1. OBTENER REFERENCIAS A ELEMENTOS DEL DOM
    // =============================================================
    const appContainer = document.getElementById('appContainer');
    const registroContainer = document.getElementById('registroContainer');
    const loginContainer = document.getElementById('loginContainer');
    const formRegistro = document.getElementById('formRegistro');
    const formLogin = document.getElementById('formLogin');
    const formInsumo = document.getElementById('formInsumo');
    const formSalida = document.getElementById('formSalida');
    const btnLogout = document.getElementById('btnLogout');
    const seccionAgregar = document.getElementById('seccionAgregar');
    const seccionRetirar = document.getElementById('seccionRetirar');
    const listaInsumos = document.getElementById('listaInsumos');
    const tablaHistorial = document.getElementById('tablaHistorial'); 
    const buscador = document.getElementById('buscador');
    const linkRegistro = document.getElementById('linkRegistro');
    const linkLogin = document.getElementById('linkLogin');

    let filaSeleccionada = null;

    // =============================================================
    // 2. FUNCIONES DE ALMACENAMIENTO (LocalStorage)
    // =============================================================
    const guardar = (clave, valor) => localStorage.setItem(clave, JSON.stringify(valor));
    const cargar = (clave) => JSON.parse(localStorage.getItem(clave) || '[]');

    // =============================================================
    // 3. FUNCIONES DE SESIÓN Y VISTA
    // =============================================================
    const iniciarSesion = (usuario) => {
        sessionStorage.setItem('usuarioActual', JSON.stringify(usuario));
        actualizarVista();
    };

    const cerrarSesion = () => {
        sessionStorage.removeItem('usuarioActual');
        formLogin.reset();
        actualizarVista();
    };

    const obtenerUsuarioActual = () => JSON.parse(sessionStorage.getItem('usuarioActual'));

    function actualizarVista() {
        const usuarioActual = obtenerUsuarioActual();

        if (usuarioActual) {
            loginContainer.style.display = 'none';
            registroContainer.style.display = 'none';
            appContainer.style.display = 'block';

            renderizarInsumos();
            renderizarHistorial();

            if (usuarioActual.nivel === 'administrador') {
                seccionAgregar.style.display = 'block';
                seccionRetirar.style.display = 'block';
            } else if (usuarioActual.nivel === 'operario') {
                seccionAgregar.style.display = 'none';
                seccionRetirar.style.display = 'block';
            }
        } else {
            loginContainer.style.display = 'block';
            registroContainer.style.display = 'none';
            appContainer.style.display = 'none';
        }
    }

    // =============================================================
    // 4. LÓGICA DE INVENTARIO E HISTORIAL
    // =============================================================
    function renderizarInsumos(filtro = '') {
        const insumos = cargar('insumos_jensen');
        listaInsumos.innerHTML = '';
        const filtroLowerCase = filtro.toLowerCase();

        const insumosFiltrados = insumos.filter(insumo => 
            insumo.nombre.toLowerCase().includes(filtroLowerCase) ||
            insumo.tipo.toLowerCase().includes(filtroLowerCase)
        );

        insumosFiltrados.forEach(insumo => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${insumo.nombre}</td>
                <td>${insumo.cantidad}</td>
                <td>${insumo.tipo}</td>
                <td><button class="btn-seleccionar" data-nombre="${insumo.nombre}">Seleccionar</button></td>
            `;

            if (insumo.cantidad === 0) {
                tr.classList.add('stock-critico');
            } else if (insumo.cantidad <= 5) {
                tr.classList.add('stock-advertencia');
            }

            listaInsumos.appendChild(tr);
        });
    }

    function renderizarHistorial() {
        const historial = cargar('historial_jensen');
        tablaHistorial.innerHTML = '';
        historial.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>${new Date(item.fecha).toLocaleString()}</td>
            `;
            tablaHistorial.appendChild(tr);
        });
    }

    // =============================================================
    // 5. EVENT LISTENERS
    // =============================================================
    linkRegistro.addEventListener('click', (e) => {
        e.preventDefault();
        loginContainer.style.display = 'none';
        registroContainer.style.display = 'block';
    });

    linkLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registroContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });
    
    formRegistro.addEventListener('submit', (e) => {
        e.preventDefault();
        const usuario = document.getElementById('regUsuario').value.trim();
        const password = document.getElementById('regPassword').value;
        const nivel = document.getElementById('regNivel').value;
        if (!usuario || !password || !nivel) {
            alert('Todos los campos son obligatorios.');
            return;
        }
        let usuarios = cargar('usuarios_jensen');
        if (usuarios.some(u => u.usuario === usuario)) {
            alert('El nombre de usuario ya existe.');
            return;
        }
        usuarios.push({ usuario, password, nivel });
        guardar('usuarios_jensen', usuarios);
        alert('Usuario registrado. Ahora puedes iniciar sesión.');
        formRegistro.reset();
        registroContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });

    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const usuarioInput = document.getElementById('loginUsuario').value;
        const passwordInput = document.getElementById('loginPassword').value;
        const usuarios = cargar('usuarios_jensen');
        const usuarioEncontrado = usuarios.find(u => u.usuario === usuarioInput && u.password === passwordInput);
        if (usuarioEncontrado) {
            iniciarSesion(usuarioEncontrado);
        } else {
            alert('Usuario o contraseña incorrectos.');
        }
    });

    btnLogout.addEventListener('click', cerrarSesion);

    formInsumo.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value.trim();
        const cantidad = parseInt(document.getElementById('cantidad').value);
        const tipo = document.getElementById('tipo').value.trim();
        if (!nombre || !tipo || isNaN(cantidad) || cantidad <= 0) {
            alert('Por favor, completa todos los campos correctamente.');
            return;
        }
        let insumos = cargar('insumos_jensen');
        const insumoExistente = insumos.find(i => i.nombre.toLowerCase() === nombre.toLowerCase());
        if (insumoExistente) {
            insumoExistente.cantidad += cantidad;
        } else {
            insumos.push({ nombre, cantidad, tipo });
        }
        guardar('insumos_jensen', insumos);
        renderizarInsumos();
        formInsumo.reset();
    });
    
    listaInsumos.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-seleccionar')) {
            const nombre = e.target.getAttribute('data-nombre');
            document.getElementById('insumoSeleccionado').value = nombre;

            if (filaSeleccionada) {
                filaSeleccionada.classList.remove('resaltado');
            }
            filaSeleccionada = e.target.closest('tr');
            filaSeleccionada.classList.add('resaltado');
            
            // --- INICIO DE NUEVAS FUNCIONALIDADES ---

            // 1. Mover la vista hacia el formulario de retiro con un scroll suave.
            seccionRetirar.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // 2. Aplicar efecto de destello al campo de cantidad y enfocarlo.
            const cantidadRetiroInput = document.getElementById('cantidadRetiro');
            cantidadRetiroInput.classList.add('flash-effect');
            cantidadRetiroInput.focus();

            // 3. Quitar la clase del efecto después de 1.5 segundos para que pueda repetirse.
            setTimeout(() => {
                cantidadRetiroInput.classList.remove('flash-effect');
            }, 1500); 
        }
    });

    formSalida.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('insumoSeleccionado').value;
        const cantidadRetiro = parseInt(document.getElementById('cantidadRetiro').value);

        if (!nombre || isNaN(cantidadRetiro) || cantidadRetiro <= 0) {
            alert('Selecciona un insumo y especifica una cantidad válida.');
            return;
        }
        let insumos = cargar('insumos_jensen');
        const insumo = insumos.find(i => i.nombre === nombre);

        if (!insumo) {
            alert("Error: El insumo seleccionado no se encontró.");
            return;
        }

        if (insumo.cantidad < cantidadRetiro) {
            alert('No hay stock suficiente para retirar esa cantidad.');
            return;
        }
        insumo.cantidad -= cantidadRetiro;
        guardar('insumos_jensen', insumos);

        let historial = cargar('historial_jensen');
        historial.unshift({ nombre, cantidad: cantidadRetiro, fecha: new Date() });
        guardar('historial_jensen', historial);

        renderizarInsumos();
        renderizarHistorial();
        formSalida.reset();
        if (filaSeleccionada) {
            filaSeleccionada.classList.remove('resaltado');
            filaSeleccionada = null;
        }
    });

    buscador.addEventListener('input', (e) => {
        renderizarInsumos(e.target.value);
    });

    // =============================================================
    // 6. INICIALIZACIÓN
    // =============================================================
    actualizarVista();

});

