let specialEvent = []

document.addEventListener('DOMContentLoaded', async function() {
    const calendarEl = document.getElementById('calendar');
    let eventos;
    let actividades;
    let events = [];

    //Token de refresh
    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem("refresh_token");
    
        if (!refreshToken) {
            console.error("No hay refresh token disponible. Cerrando sesión.");
            logoutUser();
            return;
        }
    
        try {
            const response = await fetch("http://127.0.0.1:8000/users/token/refresh/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh: refreshToken }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                localStorage.setItem("access_token", data.access);
                console.log(":arrows_counterclockwise: Token de acceso actualizado!");
            } else {
                console.error("Error al refrescar el token:", data);
                logoutUser();  
            }
        } catch (error) {
            console.error("Error en la solicitud de refresco de token:", error);
            logoutUser();
        }
    };
    
    // Función para cerrar sesión si el refresh token es inválido
    const logoutUser = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/AnimatedLoginPage/html/index.html";  
    };
    
    // Actualizar token cada 9 minutos (según la duración del token de acceso)
    setInterval(refreshAccessToken, 2 * 60 * 1000); 
    
    
    const fetchWithAuth = async (url, options = {}) => {
        let tokenR = localStorage.getItem("access_token");
    
        if (!tokenR) {
            console.error("No hay token disponible.");
            logoutUser();
            return;
        }
    
        const headers = {
            //los 3 puntos es por si quiero agregar mas encabezados
            ...options.headers,
            "Authorization": `Bearer ${tokenR}`,
            "Content-Type": "application/json"
        };
    
        let response = await fetch(url, { ...options, headers });
    
        // Si el token expiró, intentar refrescarlo y reintentar la solicitud
        if (response.status === 401) {
            console.warn("Token expirado. Intentando refrescar...");
            await refreshAccessToken();
            tokenR = localStorage.getItem("access_token"); // Obtener el nuevo token
    
            headers["Authorization"] = `Bearer ${tokenR}`;
            response = await fetch(url, { ...options, headers });
        }
    
        return response;
    };

    // Modal para información del usuario
    function setupUserModal() {
        const userContainer = document.getElementById('user-container');
        const userModal = document.getElementById('userModal');
        const userModalContent = document.getElementById('userModalContent');
        const closeModalButton = userModal.querySelector('.close');
        userContainer.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                const response = await fetchWithAuth('http://127.0.0.1:8000/users/my-profile/', {
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                const userInformation = `
                    <div class="user-profile">
                        <img src="/mainPageProject/img/avatar.png" alt="Profile" class="mb-3" width="80">
                        <h3>${data.username}</h3>
                        <p><i class="fas fa-envelope"></i> ${data.email}</p>
                    </div>
                `;
                userModalContent.innerHTML = userInformation;
                userModal.style.display = 'block';
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        });

        closeModalButton.onclick = function() {
            userModal.style.display = 'none';
        };
        
        window.onclick = function(event) {
            if (event.target == userModal) {
                userModal.style.display = 'none';
            }
            
            if (event.target == eventsModal) {
                eventsModal.style.display = 'none';
            }
            
            if (event.target == logoutConfirmModal) {
                logoutConfirmModal.style.display = 'none';
            }
        };
    }

    // Funcion de cierre de sesión
    function setupLogout() {
        const logoutButton = document.getElementById('logout');
        const logoutConfirmModal = document.getElementById('logoutConfirmModal');
        const cancelLogout = document.getElementById('cancelLogout');
        const confirmLogout = document.getElementById('confirmLogout');
        
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            logoutConfirmModal.style.display = 'block';
        });
        
        cancelLogout.addEventListener('click', function() {
            logoutConfirmModal.style.display = 'none';
        });
        
        confirmLogout.addEventListener('click', function() {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            
            showToast('Sesión cerrada con éxito');
            
            setTimeout(function() {
                window.location.href = '/AnimatedLoginPage/html/index.html';
            }, 1500);
        });
        
        // Cerrar al hacer clic fuera del modal
        window.addEventListener('click', function(event) {
            if (event.target == logoutConfirmModal) {
                logoutConfirmModal.style.display = 'none';
            }
        });
    }

    function showToast(message, type = 'success') {
        // Crear contenedor de toast si no existe
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.position = 'fixed';
            toastContainer.style.bottom = '20px';
            toastContainer.style.right = '20px';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toast.style.minWidth = '250px';
        toast.style.backgroundColor = type === 'success' ? '#4CAF50' : 
                                     type === 'error' ? '#F44336' : 
                                     type === 'warning' ? '#FF9800' : '#2196F3';
        toast.style.color = 'white';
        toast.style.padding = '15px';
        toast.style.marginBottom = '10px';
        toast.style.borderRadius = '4px';
        toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        
        toastContainer.appendChild(toast);
        
        // Mostrar el toast
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);
        
        // Ocultar y eliminar después de un tiempo
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Función para obtener y mostrar el nombre de usuario
    async function fetchUsername() {
        const userNameElement = document.getElementById('user-name');
        
        try {
            const response = await fetchWithAuth('http://127.0.0.1:8000/users/my-profile/', {
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error, status: ${response.status}`);
            }
            
            const data = await response.json();
            userNameElement.textContent = data.username;
        } catch (error) {
            console.error('Error fetching username data:', error);
            userNameElement.textContent = 'Usuario';
        }
    }

    await fetchUsername();
    setupUserModal();
    setupLogout();



    /*************************************IMPORTANTE**************************************************/


    /************************************************************************************************/

    const storedData = localStorage.getItem("idCalendar");
    console.log(storedData);

    if (!storedData){
        throw new Error("No calendars in localstorage");
    }

    let parsedData;
    console.log(parsedData);

    try{
        parsedData = JSON.parse(storedData);
        console.log(parsedData);
    } catch (error){
        console.error('Error:', error)
        throw new Error('Error parsing JSON from localstorage');
    }

    if (!parsedData || !parsedData.idCalendar) {
        throw new Error("The JSON almacened is not correctly formated");
    }
    console.log("📤 Sending data to backend:", parsedData);

    async function getEvents(){
        try{
            const response = await fetchWithAuth("http://127.0.0.1:8000/event/calendarEvents/",{
                method: "POST",
                body: JSON.stringify(parsedData)  
            })

            const datos = await response.json()
            console.log(datos)
            return datos
            
        }catch(error){
            console.error("Error: ",error)
        }
    }

    //traemos los eventos del calendario del usuario
    async function getactivitys(idtipoArroz) {
        //traemos todas las actividades del tipo de arroz
        try{
            const response = await fetchWithAuth(`http://127.0.0.1:8000/activitys/actividades/${idtipoArroz}`,{
                method: "POST",
            })

            const  datos = await response.json()
            console.log('Prueba datos',datos)
            return datos
        }catch(error){
            console.error("Error: ",error)
            console.error("api Error: ",await response.json());
        }
    }


    async function createEvents(idTipoArroz) {
        const eventos = await getEvents();
        const actividades = await getactivitys(idTipoArroz);
    
        for (const evento of eventos) {
            if (evento["idActividad"] === null) {
    
                if (evento["idPlaga"]) {
                    const plaga = await getPlaga(evento["idPlaga"]);
                    const object = {
                        "title": plaga.name_plague, 
                        "start": evento.Fecha,
                        "description": plaga.procedure_plague,
                        "materials" : plaga.materials_plague
                    };
                    events.push(object);
                    specialEvent.push(object);
                } else if (evento["idEnfermedad"]) {
                    const enfermedad = await getEnfermedad(evento["idEnfermedad"]);
                    const object = {
                        "title": enfermedad.name_disease, 
                        "start": evento.Fecha,
                        "description": enfermedad.procedure_disease,
                        "materials" : enfermedad.materials_disease

                    };
                    events.push(object);
                    specialEvent.push(object);
                }
            } else {
                const actividad = actividades[evento["idActividad"] - 1];
                const object = {
                    "title": actividad.activity_name, 
                    "start": evento.Fecha,
                    "description": actividad.activity_description,
                    "materials" : actividad.materials
                };
                events.push(object);
            }
        }
        console.log(events)
        return events; // Retorna el array de eventos creados
    }
    
    const idTipoArroz = 1;
    
    createEvents(idTipoArroz)

// codigo de obtener ubicacion 

    //::::::::




    let climas = []
    const apiKey = 'ac64c7c3e6bc817231dec6f1932dcee4';  // Reemplázala con tu clave de OpenWeatherMap


    const lat = 40.7127837
    const lon = -74.0059413

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}&lang=es`;
    //se llama a la api del clima y se obtienen los pronosticos
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('No se pudo obtener el pronóstico.');
        }
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        console.error(error)
    }

    //esta funcion sirve para que se puedan minimizar los datos que brinda la api del clima
    function displayWeather(data) {
        data.list.forEach((item, index) => {
            //aqui se guarda solo 5 registros de clima los
            if (index % 8 === 0) {  // Cada 8 registros es aproximadamente un día
                const date = new Date(item.dt_txt).toLocaleDateString();
                const temp = item.main.temp;
                const description = item.weather[0].description;
                const humidity = item.main.humidity;
                const wind = item.wind.speed;
                const iconCode = item.weather[0].icon; // Código del icono de OpenWeatherMap
                const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

                const clima = {
                    "date": date,
                    "icon":iconUrl,
                    "Temperatura": temp,
                    "Clima": description,
                    "Humedad": humidity,
                    "Viento": wind
                }

                climas.push(clima)

            }
        });

    }
    
    //aqui se guardan las urls de los iconos que nos devuelve la api para poder ponerlos en las casillas
    const fechasConImagen = {};

    //se hace un ciclo para poder recorrer cada una de los climas del array
    for (const clima of climas){
        //se cambia el formato de la fecha de los climas pasa de DD/MM/YYYY a YYYY-MM-DD para que puedan ser usados
        let partes = clima.date.split('/');
        let year = partes[2];
        let month = partes[1].padStart(2, '0');
        let day = partes[0].padStart(2, '0');  

        clima.date = `${year}-${month}-${day}`;
        //se guarda en el array que se habia creado
        fechasConImagen[clima.date] = clima.icon

    }

    //esta funcion sirve para que en caso de que el clima del dia no sea favorable, el evento se pase automaticamente al siguiente dia
    function adjustEventsForRain(events,climas) {
        for (const clima of climas){

            //ciclo para recorrrer cada unos de los eventos que se crearon anteriormente, no los de a api.
            events.forEach(element => {
                //condicion para decidir si ese dia llovera duro y si es asi se hacen los cambios
                if (clima.date === element.start && clima.Clima == "lluvia ligera"){
                    eventdate = new Date(element.start);
                    eventdate.setDate(eventdate.getDate() + 1);
                
                    let newdate = eventdate.toISOString().split('T')[0];
                    element.start = newdate
            }
            });
        }
    }
    //se llama la funcion anterior para que se active cuando el usuario acceda
    adjustEventsForRain(events,climas);
    
    //se crea el calendario con ayuda de FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth', // Vista inicial: mes
        locale: 'es', // Configura el calendario en español
        

        // Funcionalidades adicionales
        headerToolbar: {  // Configura las herramientas del encabezado (navegación)
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listWeek'
        },

        editable: false, // Permite arrastrar y modificar eventos
        droppable: false, // Permite arrastrar eventos desde fuera del calendario
        selectable: false, // Permite seleccionar días para agregar nuevos eventos

        //se le pasa a FullCallendar el listado de eventos con el formato que necesita para que los muestre en las casillas correspondientes a las fechas
        events:events,

        //una funcion de FullCalendar que nos ayuda a poner los logos de los climas en las casilla deacuerdo a la fecha
        dayCellDidMount: function(info) {

            //aqui se guarda la fecha actual que tiene el calendario de FullCalendar y se transforma a un formato legible
            let fecha = info.date.toISOString().split('T')[0];
            //una condicion para saber si la fecha del calendario coincide con alguna que esta en el array de logos
            if (fechasConImagen[fecha]) {
                //se crear un elemento img
                const img = document.createElement('img');
                //se le dan atributos para poder poner la url y los estilos
                img.src = fechasConImagen[fecha];
                img.classList.add('calendar-icon');
                //y se inserta en la selda de la fecha trayendo du identificador
                info.el.querySelector('.fc-daygrid-day-frame').prepend(img);
            }
        },

        // Funcionalidad para agregar eventos a través del click
        select: function(info) {
            document.getElementById("newsevent").style.display = "block";
            document.getElementById("eventbuttom").addEventListener("click",function(event){
                event.preventDefault()
                document.getElementById("newsevent").style.display = "none";
                const title = document.getElementById("dataevent").value;
                if (title) {
                    calendar.addEvent({
                        title: title,
                        start: info.startStr,
                        end: info.endStr
                    });
                }
            })
        },

        // Funcionalidad para arrastrar y soltar eventos (si se quiere hacer más interactivo)
        eventDrop: function(info) {
            alert('Evento movido: ' + info.event.title);
        },

        // Funcionalidad para cuando el usuario le de click a algun evento se muestre la informacion detalla del evento
        // Funcionalidad para cuando el usuario le de click a algun evento se muestre la informacion detalla del evento
        eventClick: function(info) {
            Swal.fire({
                title: info.event.title,  // Usa el título del evento
                html: '<p style="font-size: 18px; margin-bottom: 15px;">Descripción: ' + (info.event.extendedProps.description || "Sin descripción") + '</p> <br>'+'<p style="font-size: 18px; margin-bottom: 15px;">Materiales: ' + (info.event.extendedProps.materials || "Sin Materiales") + '</p>' ,
                icon: "info",  // Puedes usar "success", "error", "warning", "info", "question"
                confirmButtonText: "Entendido",
                confirmButtonColor: "#4CAF50",  // Cambia el color del botón
                background: "#f9f9f9",  // Cambia el fondo
                color: "#333",  // Cambia el color del texto
                customClass: {
                    confirmButton: "my-confirm-button"
                }
            });
        }

    });
    

    // Renderiza el calendario
    calendar.render();


async function getPlaga(id) {
    try{
        const response = await fetchWithAuth("http://127.0.0.1:8000/plaga/ViewPlaga/",{
            method: "POST",
            body: JSON.stringify({"Id": id})
            
        })
        const data = await response.json()
        return data
    }catch{
        console.error("Error: ",error)
        console.error("api Error: ",await response.json());
    }
}

async function deleteSpecialEvent(specialEvent, idCalendar) {
    try{
        const response = await fetchWithAuth("http://127.0.0.1:8000/event/deleteSpecialEvent/",{
            method: "POST",
            body: JSON.stringify({"idCalendar": idCalendar, "dateEvent": specialEvent.start})
        })
        if (response.ok) {
            location.reload();
        }
    }catch{
        console.error("Error: ",error)
        console.error("api Error: ",await response.json());
    }
}

async function getEnfermedad(id) {
    try{
        const response = await fetchWithAuth("http://127.0.0.1:8000/enfermedad/ViewEnfermedad/",{
            method: "POST",
            body: JSON.stringify({"Id": id}) 
            
        })
        const data = await response.json()
        return data
    }catch(error){
        console.error("Error: ",error)
        console.error("api Error: ",await response.json());
    }
}



    console.log("DOM cargado correctamente.");
    async function createEspecialEvent(idCalendar, typeProblem, selection) {
        try{
            const response = await fetchWithAuth("http://127.0.0.1:8000/event/createSpecialEvent/",{
                method: "POST",
                body: JSON.stringify({"idCalendar": idCalendar, "typeProblem": typeProblem, "selection" : selection})
                
            })
            if (response.ok) {
                location.reload();
            }
        }catch(error){
            console.error("Error: ",error)
            console.error("api Error: ",await response.json());
        }
    }


    // Obtener referencias a los elementos importantes del DOM
    const newEventButton = document.getElementById("new-event");
    const eventModalEl = document.getElementById("eventModal");
    const infoModalEl = document.getElementById("infoModal");

    // Instanciar los modales de Bootstrap para poder mostrarlos y ocultarlos
    const eventModal = new bootstrap.Modal(eventModalEl);
    const infoModal = new bootstrap.Modal(infoModalEl);

    // Variable para almacenar los elementos seleccionados (plagas o enfermedades)
    let seleccionados = [];
    let modo = "guardar"; // Para diferenciar si estamos guardando o eliminando eventos

    // Evento para abrir el modal de "Nuevo Evento"
    newEventButton.addEventListener("click", function () {
        console.log("Botón 'Nuevo Evento' clickeado");
        modo = "guardar"; // Configuramos el modo en "guardar"
        eventModal.show(); // Mostrar el modal de nuevo evento
    });

    
    // Eventos para abrir la información de Plagas y Enfermedades
    document.getElementById("plagas-container").addEventListener("click", function () {
        console.log("Plagas clickeadas");
        mostrarInformacion("plaga"); // Mostrar información de plagas
    });

    document.getElementById("enfermedades-container").addEventListener("click", function () {
        console.log("Enfermedades clickeadas");
        mostrarInformacion("enfermedad"); // Mostrar información de enfermedades
    });

    // Función para mostrar la información en el modal
    async function mostrarInformacion(tipo) {
        const infoList = document.getElementById("info-list");

        let plaga = await getPlaga("")
        let enfermedad = await getEnfermedad("")

        plaga = plaga.map(object => {
            return {
                name : object.name_plague,
                description : object.description_plague
            }
        })


        enfermedad = enfermedad.map(object => {
            return {
                name : object.name_disease,
                description : object.description_disease
            }
        })

        

        console.log(plaga)
        console.log(enfermedad)

        infoList.innerHTML = ""; // Limpiar el contenido previo

        const data = {
            plaga: plaga,
            enfermedad: enfermedad
        };

        data[tipo].forEach(item => {
            const categoria = tipo === "plaga" ? "Plaga" : "Enfermedad"; // Definir categoría correctamente

            // Contenedor principal
            const div = document.createElement("div");
            div.classList.add("info-container", "d-flex", "align-items-center", "mb-3");

            // Checkbox para seleccionar la plaga o enfermedad
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = item.name;
            checkbox.classList.add("form-check-input", "me-2");

            // Evento para manejar la selección (solo uno permitido)
            checkbox.addEventListener("change", function () {
                document.querySelectorAll('.form-check-input').forEach(cb => cb.checked = false);
                this.checked = true; // Solo permitir uno seleccionado

                seleccionados = [{ nombre: this.value, categoria }];
                console.log("Seleccionado:", seleccionados);
            });

            // Elementos visuales
            const titulo = document.createElement("p");
            titulo.textContent = item.name; // Asignar el nombre del item al título
            titulo.style.fontWeight = "bold";
            titulo.classList.add("mb-0");

            const description = document.createElement("p");
            description.textContent = item.description; // Asignar la descripción del item
            description.classList.add("small", "text-muted", "mb-2");

            const materials = document.createElement("p");
            materials.textContent = item.materials;
            materials.classList.add("small", "text-muted", "mb-2");

            // Imagen
            const img = document.createElement("img");
            img.classList.add("img-thumbnail");
            img.src = "https://img.freepik.com/vector-premium/simbolo-control-plagas-vectoriales_1012247-780.jpg";
            img.style.width = "150px";
            img.style.height = "150px";
            img.style.objectFit = "cover";
            img.style.borderRadius = "10px";

            // Contenedor de texto (para título y descripción)
            const textContainer = document.createElement("div");
            textContainer.classList.add("ms-2");
            textContainer.appendChild(titulo); // Agregar el título
            textContainer.appendChild(description); // Agregar la descripción
            textContainer.appendChild(materials);

            // Agregar los elementos al div principal
            div.appendChild(checkbox); // Checkbox
            div.appendChild(textContainer); // Contenedor de texto (título y descripción)
            div.appendChild(img); // Imagen

            // Agregar el div principal al contenedor de la lista
            infoList.appendChild(div);
        });

        // Modificamos el footer del modal según el modo (guardar o eliminar)
        const modalFooter = document.querySelector("#infoModal .modal-footer");
        modalFooter.innerHTML = ""; // Limpiar para evitar duplicados

        const cerrarBtn = document.createElement("button");
        cerrarBtn.classList.add("btn", "btn-secondary");
        cerrarBtn.textContent = "Cerrar";
        cerrarBtn.setAttribute("data-bs-dismiss", "modal");

        const actionBtn = document.createElement("button");
        actionBtn.id = "accion-seleccion";
        actionBtn.textContent = modo === "guardar" ? "Guardar" : "Eliminar";
        actionBtn.classList.add("btn", modo === "guardar" ? "btn-primary" : "btn-danger");

        // Evento para guardar o eliminar según el modo
        actionBtn.addEventListener("click", function () {
            if (modo === "guardar") {
                console.log("Elementos guardados:", seleccionados);
                createEspecialEvent(parsedData.idCalendar, seleccionados[0]["categoria"],seleccionados[0]["nombre"]) 
            } else {
                console.log("Elementos eliminados:", seleccionados);
            }
            infoModal.hide();
        });

        modalFooter.appendChild(cerrarBtn);
        modalFooter.appendChild(actionBtn);

        // Mostrar directamente el modal de selección
        infoModal.show();
        eventModal.hide();

    }

    // Obtener referencias a los elementos importantes del DOM
    const deleteEventButton = document.getElementById("delete-event");
    const deleteModalEl = document.getElementById("deleteModal");
    const deleteList = document.getElementById("delete-list");
    const confirmDeleteButton = document.getElementById("confirm-delete");

    // Instanciar el modal de Bootstrap para poder mostrarlo y ocultarlo
    const deleteModal = new bootstrap.Modal(deleteModalEl);

    // Variable para almacenar el evento seleccionado
    let eventoSeleccionado = null;

    // Evento para abrir el modal de "Eliminar Evento"
    deleteEventButton.addEventListener("click", function () {
        console.log("Botón 'Eliminar Evento' clickeado");
        cargarEventos(); // Cargar la lista de eventos
        deleteModal.show(); // Mostrar el modal de eliminar evento
    });

    // Función para cargar la lista de eventos
    async function cargarEventos() {
        
        deleteList.innerHTML = ""; // Limpiar el contenido previo

        specialEvent.forEach(evento => {
            // Contenedor principal para cada evento
            const div = document.createElement("div");
            div.classList.add("evento-container", "d-flex", "align-items-center", "mb-3");

            // Radio button para seleccionar el evento
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "evento";
            radio.value = evento.id;
            radio.classList.add("form-check-input", "me-2");

            // Evento para manejar la selección
            radio.addEventListener("change", function () {
                eventoSeleccionado = evento; // Almacenar el evento seleccionado
                console.log("Evento seleccionado:", eventoSeleccionado);
            });

            // Información del evento
            const info = document.createElement("div");
            info.innerHTML = `
                <p class="mb-0"><strong>${evento.title}</strong></p>
                <p class="small text-muted mb-0">Fecha: ${evento.start}</p>
            `;

            // Agregar elementos al contenedor
            div.appendChild(radio);
            div.appendChild(info);

            // Agregar el contenedor a la lista
            deleteList.appendChild(div);
        });
    }

    // Evento para confirmar la eliminación del evento
    confirmDeleteButton.addEventListener("click", function () {
        if (eventoSeleccionado) {
            console.log("Eliminando evento:", eventoSeleccionado);
            // Aquí puedes agregar la lógica para eliminar el evento (por ejemplo, una llamada a la API)
            deleteSpecialEvent(eventoSeleccionado, parsedData.idCalendar)
            alert(`Evento "${eventoSeleccionado.title}" eliminado correctamente.`);
            deleteModal.hide(); // Cerrar el modal después de eliminar
        } else {
            alert("Por favor, selecciona un evento para eliminar.");
        }
    });
});