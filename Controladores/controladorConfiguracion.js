const RANGOS = {
    facil:   { dinero: [150, 300], energia: [100, 150], terreno: ["4","9","16"]},
    normal:  { dinero: [75, 200],  energia: [70, 130],  terreno: ["4","9","16"]},
    dificil: { dinero: [50, 100],  energia: [50, 80],   terreno: ["4","9"]}
};

const $ = id => document.getElementById(id);
const getVal = name => document.querySelector(`input[name='${name}']:checked`)?.value;

const inputs = {
    nombre: $("nombreGranjero"), granja: $("nombreGranja"), 
    dinero: $("dineroInicial"), energia: $("energiaInicial"),
    cultivo: $("cultivoFavorito")
};

function gestionarError(id, msg = "", input = null) {
    $(id).textContent = msg;
    if (input) input.classList.toggle("invalido", !!msg);
}

function actualizarRangos() {
    const dif = getVal('dificultad');
    const r = RANGOS[dif];


    [['dinero', 'Dinero'], ['energia', 'Energia']].forEach(([key, id]) => {
        const [min, max] = r[key];
        inputs[key].min = min; inputs[key].max = max;
        $(`lbl${id}Min`).textContent = min; $(`lbl${id}Max`).textContent = max;
        
        inputs[key].value = Math.min(Math.max(inputs[key].value, min), max);
        $(`lbl${id}`).textContent = inputs[key].value;
    });


    document.querySelectorAll("input[name='terreno']").forEach(radio => {
        const ok = r.terreno.includes(radio.value);
        radio.disabled = !ok;
        Object.assign(radio.nextElementSibling.style, { opacity: ok ? "1" : "0.35", cursor: ok ? "pointer" : "not-allowed" });
        if (!ok && radio.checked) document.querySelector("input[name='terreno'][value='9']").checked = true;
    });

    $("hintDificultad").textContent = r.hint;
    actualizarResumen();
}

function actualizarResumen() {
    const dif = getVal('dificultad');
    const difTexto = { facil: "Fácil", normal: "Normal", dificil: "Difícil" };
    const tamTexto = { "4": "Pequeño (2×2)", "9": "Mediano (3×3)", "16": "Grande (4×4)" };

    $("resumen").innerHTML = `
        <strong>Granjero:</strong> ${inputs.nombre.value.trim() || "—"} | <strong>Granja:</strong> ${inputs.granja.value.trim() || "—"}<br>
        <strong>Dificultad:</strong> ${difTexto[dif]} | <strong>Terreno:</strong> ${tamTexto[getVal('terreno')]}<br>
        <strong>Dinero:</strong> ${inputs.dinero.value} 💰 | <strong>Energía:</strong> ${inputs.energia.value} ⚡<br>
        <strong>Cultivo favorito:</strong> ${inputs.cultivo.value} (5 semillas al inicio)
    `;
    $("resumen").classList.add("visible");
}

function validar() {
    let ok = true;
    const dif = getVal('dificultad'), r = RANGOS[dif];
    const val = (inp, id, min, msg) => {
        const v = inp.value.trim();
        const err = v.length < min ? msg : "";
        gestionarError(id, err, inp);
        if (err) ok = false;
    };

    val(inputs.nombre, "errNombre", 2, "Mínimo 2 caracteres.");
    val(inputs.granja, "errGranja", 3, "Mínimo 3 caracteres.");
    
    if (!r.terreno.includes(getVal('terreno'))) {
        gestionarError("errTerreno", "Terreno no disponible en esta dificultad");
        ok = false;
    } else gestionarError("errTerreno");

    return ok;
}

$("formConfig").onclick = e => { if (e.target.type === "radio") actualizarRangos(); };
$("formConfig").oninput = e => {
    if (e.target.type === "range") $(e.target.id.replace('Inicial', '')).previousElementSibling.querySelector('strong').textContent = e.target.value;
    actualizarResumen();
};

$("formConfig").onsubmit = e => {
    e.preventDefault();
    if (!validar()) return;

    const dif = getVal('dificultad');
    const semillas = { Tomate: 0, Calabaza: 0, Berenjena: 0 };
    semillas[inputs.cultivo.value] = 5;

    localStorage.setItem("config", JSON.stringify({
        nombreGranjero: inputs.nombre.value.trim(),
        nombreGranja: inputs.granja.value.trim(),
        dificultad: dif,
        dinero: +inputs.dinero.value,
        energia: +inputs.energia.value,
        numParcelas: +getVal('terreno'),
        cultivoFavorito: inputs.cultivo.value,
        semillas
    }));

    ["granjero", "parcela", "herramientas", "cosecha", "preciosAjustados"].forEach(k => localStorage.removeItem(k));
    location.href = "index.html";
};

$("btnVolver").onclick = () => location.href = "menu.html";
actualizarRangos();