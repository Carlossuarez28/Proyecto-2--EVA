const CONFIG_URL = 'configuracion.html';
const GAME_URL   = 'index.html';
const GITHUB_URL = 'https://github.com/Carlossuarez28/Proyecto-2--EVA';

const btnNueva     = document.getElementById('btnNueva');
const btnContinuar = document.getElementById('btnContinuar');
const btnEliminar  = document.getElementById('btnEliminar');
const btnGithub    = document.getElementById('btnGithub');
const infoPartida  = document.getElementById('infoPartida');
const overlay      = document.getElementById('overlay');
const modalMensaje = document.getElementById('modalMensaje');
const btnConfirmar = document.getElementById('btnConfirmarModal');
const btnCancelar  = document.getElementById('btnCancelarModal');

function hayPartidaGuardada() {
    return localStorage.getItem('granjero') !== null &&
           localStorage.getItem('parcela')  !== null;
}

function obtenerResumenPartida() {
    try {
        const g = JSON.parse(localStorage.getItem('granjero'));
        const p = JSON.parse(localStorage.getItem('parcela')) || [];
        const cultivosActivos = p.filter(x => x.cultivoActual).length;
        return `Dinero: <strong>${g.dinero} monedas</strong> | Parcelas activas: <strong>${cultivosActivos}/${p.length}</strong>`;
    } catch {
        return 'Partida guardada encontrada.';
    }
}

function abrirModal(mensaje, onConfirmar) {
    modalMensaje.innerHTML = mensaje;
    overlay.classList.add('activo');
    btnConfirmar.onclick = () => { cerrarModal(); onConfirmar(); };
}

function cerrarModal() {
    overlay.classList.remove('activo');
}

function inicializar() {
    btnGithub.href = GITHUB_URL;
    if (hayPartidaGuardada()) {
        btnContinuar.disabled = false;
        btnEliminar.disabled  = false;
        infoPartida.innerHTML = 'Partida guardada: ' + obtenerResumenPartida();
        infoPartida.classList.add('visible');
    }
}


btnNueva.addEventListener('click', () => {
    if (hayPartidaGuardada()) {
        abrirModal(
            'Seguro que quieres empezar <strong>una nueva partida</strong>? Se perderan todos los datos guardados.',
            () => {
                localStorage.removeItem('granjero');
                localStorage.removeItem('parcela');
                localStorage.removeItem('config');
                localStorage.removeItem('herramientas');
                localStorage.removeItem('cosecha');
                localStorage.removeItem('preciosAjustados');
                window.location.href = CONFIG_URL;
            }
        );
    } else {
        window.location.href = CONFIG_URL;
    }
});

btnContinuar.addEventListener('click', () => {
    if (!btnContinuar.disabled) window.location.href = GAME_URL;
});

btnEliminar.addEventListener('click', () => {
    if (btnEliminar.disabled) return;
    abrirModal(
        'Seguro que quieres <strong>eliminar la partida</strong>? Esta accion no se puede deshacer.',
        () => {
            localStorage.removeItem('granjero');
            localStorage.removeItem('parcela');
            localStorage.removeItem('config');
            localStorage.removeItem('herramientas');
            localStorage.removeItem('cosecha');
            localStorage.removeItem('preciosAjustados');
            window.location.reload();
        }
    );
});

btnCancelar.addEventListener('click', cerrarModal);
overlay.addEventListener('click', e => { if (e.target === overlay) cerrarModal(); });

inicializar();