import { cargarXML, obtenerSemillas, obtenerHerramientas } from "../gestorXML.js";

//localStorage helpers
const cargarGranjero      = ()  => JSON.parse(localStorage.getItem("granjero"));
const guardarGranjero     = g   => localStorage.setItem("granjero", JSON.stringify(g));
const leerHerramientas    = ()  => JSON.parse(localStorage.getItem("herramientas")) || { azada:1, regadera:1, hoz:1 };
const guardarHerramientas = h   => localStorage.setItem("herramientas", JSON.stringify(h));
const leerCosecha         = ()  => JSON.parse(localStorage.getItem("cosecha"))      || { Tomate:0, Calabaza:0, Berenjena:0, Limon:0 };
const guardarCosecha      = c   => localStorage.setItem("cosecha", JSON.stringify(c));
const precioVentaReal     = (id, base) => (JSON.parse(localStorage.getItem("preciosAjustados")) || {})[id] ?? base;

//DOM helpers
const get = id => document.getElementById(id);
const overlay    = get("overlayConfirm");
const modalTexto = get("modalTexto");

function abrirModal(texto, onOk) {
    modalTexto.innerHTML = texto;
    overlay.classList.add("activo");
    get("btnConfirmar").onclick = () => { overlay.classList.remove("activo"); onOk(); };
}
get("btnCancelar").onclick = () => overlay.classList.remove("activo");
overlay.onclick = e => { if (e.target === overlay) overlay.classList.remove("activo"); };

//Renderizar
function renderizar() {
    const granjero     = cargarGranjero();
    const herramientas = leerHerramientas();
    const cosecha      = leerCosecha();
    if (!granjero) return;

    get("dineroDispo").textContent = granjero.dinero;

    //Semillas con filtro XPath
    get("listaSemillas").innerHTML = "";
    obtenerSemillas(get("filtroSemillas")?.value ?? "").forEach(s => {
        const coste = s.precioCompra * s.cantidadPaquete;
        const ok    = granjero.dinero >= coste;
        const card  = crearCard(`
            <span class="item-tienda-icono">${s.icono}</span>
            <div class="item-tienda-info">
                <div class="item-tienda-nombre">Semillas de ${s.nombre}</div>
                <div class="item-tienda-desc">⏱ ${s.tiempoMaduracion}s · 💵 ${s.precioVentaBase}💰/ud. — ${s.descripcion}</div>
            </div>
            <span class="item-tienda-precio">x${s.cantidadPaquete} · ${coste}💰</span>
            <button class="btn-accion btn-comprar" ${ok?"":"disabled"}>Comprar</button>
        `, !ok);
        card.querySelector(".btn-comprar").onclick = () =>
            abrirModal(`¿Comprar <strong>x${s.cantidadPaquete} Semillas de ${s.nombre}</strong> por <strong>${coste}💰</strong>?`, () => {
                granjero.semillas[s.id] = (granjero.semillas[s.id] || 0) + s.cantidadPaquete;
                granjero.dinero -= coste;
                guardarGranjero(granjero);
                renderizar();
            });
        get("listaSemillas").appendChild(card);
    });

    //Mejoras herramientas
    get("listaMejoras").innerHTML = "";
    obtenerHerramientas().forEach(herr => {
        const nivelActual = herramientas[herr.id] || 1;
        const siguiente   = herr.niveles.find(n => n.numero > nivelActual);
        let html;
        if (!siguiente) {
            html = `<span class="item-tienda-icono">${herr.icono}</span>
                    <div class="item-tienda-info"><div class="item-tienda-nombre">${herr.nombre}</div>
                    <div class="item-tienda-desc">Nivel máximo alcanzado</div></div>
                    <span class="mejora-max">★ Máx. Nv.${nivelActual}</span>`;
        } else {
            const ok = granjero.dinero >= siguiente.costeMejora;
            html = `<span class="item-tienda-icono">${herr.icono}</span>
                    <div class="item-tienda-info">
                        <div class="item-tienda-nombre">${herr.nombre} → Nv.${siguiente.numero}</div>
                        <div class="item-tienda-desc">${siguiente.efecto}</div>
                    </div>
                    <span class="item-tienda-precio">${siguiente.costeMejora}💰</span>
                    <button class="btn-accion btn-comprar" ${ok?"":"disabled"}>Mejorar</button>`;
            const card = crearCard(html, !ok);
            card.querySelector(".btn-comprar").onclick = () =>
                abrirModal(`¿Mejorar <strong>${herr.nombre}</strong> al Nv.${siguiente.numero} por <strong>${siguiente.costeMejora}💰</strong>?<br><small>${siguiente.efecto}</small>`, () => {
                    granjero.dinero -= siguiente.costeMejora;
                    herramientas[herr.id] = siguiente.numero;
                    guardarGranjero(granjero);
                    guardarHerramientas(herramientas);
                    renderizar();
                });
            get("listaMejoras").appendChild(card);
            return;
        }
        get("listaMejoras").appendChild(crearCard(html));
    });

    //Vender cosecha
    get("listaVenta").innerHTML = "";
    let total = 0;
    obtenerSemillas().forEach(s => {
        const cantidad = cosecha[s.id] || 0;
        const precio   = precioVentaReal(s.id, s.precioVentaBase);
        const subtotal = cantidad * precio;
        const bonus    = precio > s.precioVentaBase;
        total += subtotal;

        const card = crearCard(`
            <span class="item-tienda-icono">${s.icono}</span>
            <div class="item-tienda-info">
                <div class="item-tienda-nombre">${s.nombre}</div>
                <div class="item-tienda-desc">${precio}💰/ud.${bonus ? ` <span class="badge-azada">⛏️ +${precio-s.precioVentaBase}💰 Azada</span>` : ""}</div>
            </div>
            <span class="item-stock">x${cantidad}</span>
            <span class="item-tienda-precio">${subtotal}💰</span>
            <button class="btn-accion btn-vender" ${cantidad>0?"":"disabled"}>Vender todo</button>
        `, cantidad === 0);
        if (cantidad > 0) {
            card.querySelector(".btn-vender").onclick = () =>
                abrirModal(`¿Vender <strong>x${cantidad} ${s.nombre}</strong> por <strong>${subtotal}💰</strong>?`, () => {
                    const g = cargarGranjero(), c = leerCosecha();
                    g.dinero += subtotal; c[s.id] = 0;
                    guardarGranjero(g); guardarCosecha(c);
                    renderizar();
                });
        }
        get("listaVenta").appendChild(card);
    });

    const rv = get("resumenVenta");
    rv.innerHTML = total > 0 ? `Puedes ganar <strong>${total}💰</strong> vendiendo toda tu cosecha.` : "No tienes cosecha para vender.";
    rv.classList.add("visible");
}

//Helper para crear tarjetas
function crearCard(html, sinStock = false) {
    const div = document.createElement("div");
    div.className = "item-tienda" + (sinStock ? " sin-stock" : "");
    div.innerHTML = html;
    return div;
}

//Eventos
get("filtroSemillas")?.addEventListener("change", renderizar);
get("btnVolver").onclick = () => location.href = "index.html";

//Arranque
cargarXML().then(renderizar).catch(err => console.error("Error cargando datos.xml:", err));