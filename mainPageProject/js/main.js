document.addEventListener('DOMContentLoaded', async function() {

    if (sessionStorage.getItem("show_login_success") === "true") {
        // Eliminar el flag
        sessionStorage.removeItem("show_login_success");
        
        // Mostrar mensaje de éxito
        const messageElement = document.createElement('div');
        messageElement.className = 'login-success-message';
        messageElement.innerHTML = `
            <div class="alert alert-success" role="alert">
                <strong>Success! </strong> Login successful.
                <button type="button" class="close-btn" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `;
        
        // Insertar al principio del body o en un contenedor específico
        document.body.insertBefore(messageElement, document.body.firstChild);
        
        // Agregar CSS para el mensaje
        const style = document.createElement('style');
        style.textContent = `
            .login-success-message {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                animation: fadeOut 3s forwards;
                animation-delay: 2s;
            }
            .login-success-message .alert {
                padding: 15px;
                border-radius: 4px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .login-success-message .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                font-weight: bold;
                color: #155724;
                cursor: pointer;
                padding: 0 5px;
                margin-left: 10px;
                line-height: 1;
                opacity: 0.7;
                transition: opacity 0.2s;
                border-radius: 50%;
                height: 30px;
                width: 30px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .login-success-message .close-btn:hover {
                opacity: 1;
                background-color: rgba(0, 0, 0, 0.1);
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; visibility: hidden; }
            }
        `;
        document.head.appendChild(style);
    }
    

    // const token = localStorage.getItem('access_token');
    const calendarListContainer = document.getElementById('calendar-list');
    const notificationsContainer = document.getElementsByClassName('notification-list')[0];
    const deleteCalendarBtn = document.getElementById('delete-calendar');


    // Mostrar un spinner o loader mientras se cargan los datos
    const showLoader = () => {
        const loader = document.createElement('div');
        loader.id = 'content-loader';
        loader.className = 'loader';
        loader.innerHTML = `
            <div class="lds-ripple">
                <div></div>
                <div></div>
            </div>
        `;
        return loader;
    };


    if (deleteCalendarBtn) {
        deleteCalendarBtn.classList.add('disabled');
        deleteCalendarBtn.style.pointerEvents = 'none';
        deleteCalendarBtn.style.opacity = '0.5';
    }


    // Cargar los calendarios
    async function loadCalendars() {
        calendarListContainer.innerHTML = '';
        calendarListContainer.appendChild(showLoader());
        
        try {
            const response = await fetchWithAuth('http://127.0.0.1:8000/calendar/calendarList/', {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const calendars = await response.json();
    

            calendarListContainer.innerHTML = ''; 
            
            if (calendars.length === 0) {
                // Mostrar mensaje cuando no hay calendarios
                showEmptyCalendarState();

            } else {
                // Mostrar calendarios existentes
                renderCalendars(calendars);
                // Habilitar el botón de eliminar calendario
                setupDeleteButton(calendars);
            }
        } catch (error) {
            console.error('Error fetching calendars:', error);
            showErrorState();
        }
    }

    //Function when there are no calendars
    function showEmptyCalendarState() {
        const noCalendarsMessage = document.createElement('div');
        noCalendarsMessage.className = 'empty-message';
        noCalendarsMessage.innerHTML = `
            <img src="/mainPageProject/img/calendario_vacio.png" alt="No calendars" width="80">
            <p>No tienes calendarios. Crea uno nuevo haciendo clic en el botón +</p>
        `;
        calendarListContainer.appendChild(noCalendarsMessage);
        disableDeleteButton();
    }

    //Function to show error message
    function showErrorState() {
        calendarListContainer.innerHTML = '';
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Error al cargar los calendarios. Intenta nuevamente.';
        calendarListContainer.appendChild(errorMessage);
    }

    //Funtion to show calendars
    function renderCalendars(calendars) {
        calendars.forEach(calendar => {
            const calendarItem = document.createElement('div');
            calendarItem.className = 'calendar-item';
            calendarItem.setAttribute('data-date',calendar.id, calendar.date);
            calendarItem.innerHTML = `
                <a href="/creacion_calendario/index.html" data-date="${calendar.id}" class="calendar-link">
                    <img src="/mainPageProject/img/calendario.png" alt="calendar" width="43" height="43" class="img-create img-fluid">
                </a>
                <p class="create">ID: ${calendar.id}</p>
                <p class="create">Fecha: ${calendar.date}</p>
            `;
            calendarListContainer.appendChild(calendarItem);
        });
    
        document.querySelectorAll(".calendar-link").forEach(link => {
            link.addEventListener("click", function (event) {
                event.preventDefault();
                const selectedDate = this.getAttribute("data-date");
                saveCalendarDate(selectedDate);
                window.location.href = "/creacion_calendario/index.html";
            });
        });
    }

    // Funtion to show delete button
    function setupDeleteButton(calendars) {
        if (!deleteCalendarBtn) return;
        
        deleteCalendarBtn.classList.remove('disabled');
        deleteCalendarBtn.style.pointerEvents = 'auto';
        deleteCalendarBtn.style.opacity = '1';
        
        deleteCalendarBtn.onclick = function(event) {
            event.preventDefault();
            showCalendarDeleteModal(calendars);
        };
    }

    // Disable delete button when there are no calendars
    function disableDeleteButton() {
        if (!deleteCalendarBtn) return;
        
        deleteCalendarBtn.classList.add('disabled');
        deleteCalendarBtn.style.pointerEvents = 'none';
        deleteCalendarBtn.style.opacity = '0.5';
        deleteCalendarBtn.onclick = null;
    }

    // Mostrar modal cuando se va a eliminar un calendario
    function showCalendarDeleteModal(calendars) {
        const modal = document.getElementById('calendarModal');
        const modalSelect = document.getElementById('form-select');
        const modalText = modal.querySelector('p');
        const closeBtn = modal.querySelector('.close');

        modalText.textContent = 'Selecciona un calendario para eliminar:';
        modalSelect.innerHTML = '<option value="0">Seleccione un calendario a eliminar</option>';
        
        // Add calendars to select
        calendars.forEach(calendar => {
            const option = document.createElement('option');
            option.value = calendar.id;
            option.textContent = `${calendar.id} : ${calendar.date}`;
            modalSelect.appendChild(option);
        });
        
        modal.style.display = 'block';
        
        // Add event listener to confirm deletion
        const handleSelectChange = function() {
            if (this.value !== "0") {
                const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar el calendario con ID: ${this.value}?`);
                if (confirmDelete) {
                    deleteCalendar(this.value);
                    modal.style.display = 'none';
                }
            }
        };

        modalSelect.onchange = handleSelectChange;
        
        // Close modal when close button is clicked
        closeBtn.onclick = function() {
            modal.style.display = 'none';
            modalSelect.onchange = null;
        };

        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
                modalSelect.onchange = null;
            }
        };
    }

    // function to delete calendar
    async function deleteCalendar(idCalendar){
        try {
            const response = await fetchWithAuth('http://127.0.0.1:8000/calendar/deleteCalendar/',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 'idCalendar' : idCalendar }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            } else {
                location.reload();
            }


            showToast('Calendar deleted Successfully', 'success');
            await loadCalendars();
        } catch (error) {
            console.error('Error deleting calendar:', error);
            showToast('It was not possible to delete the calendar', 'error');
        }
        
    }

    //Save the date of the calendar in localStorage 
    function saveCalendarDate(date) {
        if (!date) {
            console.error("❌ Error: la fecha del calendario es inválida.");
            return;
        }
        const calendarData = { idCalendar: date };
        localStorage.setItem("idCalendar", JSON.stringify(calendarData));
        console.log("✅ Calendar date saved in localStorage:", calendarData);
    }

    // Cargar las notificaciones
    async function loadNotifications() {
        notificationsContainer.appendChild(showLoader());
        
        try {
            const response = await fetchWithAuth('http://127.0.0.1:8000/Noti/Notificaciones/', {
                method: 'GET',
            });
                
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const notifications = await response.json();
            notificationsContainer.innerHTML = ''; 

            const closedNotifications = JSON.parse(localStorage.getItem('closedNotifications')) || [];
            
            const filteredNotificactions = notifications.filter((_, index) => !closedNotifications.includes(`notification-${index}`));


            if (filteredNotificactions.length === 0) {
                // Mostrar mensaje cuando no hay notificaciones
                const noNotificationsMessage = document.createElement('div');
                noNotificationsMessage.className = 'empty-message';
                noNotificationsMessage.innerHTML = `
                    <img src="/mainPageProject/img/empty-notification.png" alt="No notifications" width="80">
                    <p>No tienes notificaciones pendientes</p>
                `;
                notificationsContainer.appendChild(noNotificationsMessage);
            } else {
                // Mostrar notificaciones existentes
                filteredNotificactions.forEach((notification, index) => {
                    const notificationElement = document.createElement('div');
                    notificationElement.className = 'notification';
                    notificationElement.id = `notification-${index}`;
                    notificationElement.innerHTML = `
                        <h3>${notification.Titulo}</h3>
                        <p>${notification.Mensaje}</p>
                        <span class="close" data-notification-id="notification-${index}">&times;</span>
                    `;
                    notificationsContainer.appendChild(notificationElement);
                });

                // Configurar los botones de cierre para las notificaciones
                setupNotificationCloseButtons();
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            notificationsContainer.innerHTML = '';
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'Aqui se mostraran las notificaciones';
            notificationsContainer.appendChild(errorMessage);
        }
    }

    // Configurar los botones de cierre para notificaciones
    function setupNotificationCloseButtons() {
        const closeButtons = document.querySelectorAll('.notification .close');
        
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const notificationId = this.getAttribute('data-notification-id');
                const notification = document.getElementById(notificationId);

                let closedNotifications = JSON.parse(localStorage.getItem('closedNotifications')) || [];
                closedNotifications.push(notificationId);
                localStorage.setItem('closedNotifications', JSON.stringify(closedNotifications));

                notification.classList.add('notification-closing');
                
                // Animar la salida y luego eliminar
                setTimeout(() => {
                    notification.remove();
                    
                    // Verificar si no hay más notificaciones y mostrar mensaje
                    if (document.querySelectorAll('.notification').length === 0) {
                        const noNotificationsMessage = document.createElement('div');
                        noNotificationsMessage.className = 'empty-message';
                        noNotificationsMessage.innerHTML = `
                            <img src="/mainPageProject/img/empty-notification.png" alt="No notifications" width="80">
                            <p>No tienes notificaciones pendientes</p>
                        `;
                        notificationsContainer.appendChild(noNotificationsMessage);
                    }
                }, 300);
                
            });
        });
    }

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
            
            if (event.target == calendarModal) {
                calendarModal.style.display = 'none';
            }
            
            if (event.target == logoutConfirmModal) {
                logoutConfirmModal.style.display = 'none';
            }
        };
    }

    document.getElementById('location-btn').addEventListener('click', async () => {
        const locationContainer = document.getElementById('location-container');
        locationContainer.classList.remove('d-none');

        document.getElementById('location-details').innerHTML = `
            <p class="text-center"><i class="fas fa-spinner fa-spin"></i> Detectando ubicación...</p>
        `;

        await fetchAndDisplayLocation();
    });
    
    async function getGoogleGeolocation() {
        const response = await fetch('https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCEbHDjXLECLKHcR-fZMyqb0Yv_Z2Q0scc', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.location || !data.location.lat || !data.location.lng) {
            throw new Error('Coordenadas inválidas recibidas de la API');
        }

        return {
            lat: data.location.lat,
            lng: data.location.lng
        };
    }

    // Función para obtener la ubicación del usuario
    async function fetchAndDisplayLocation() {
        try {
            const coords = await getGoogleGeolocation();
            const locationData = await getReverseGeocoding(coords.lat, coords.lng);

            if (!locationData || !locationData.address_components) {
                throw new Error('No se encontraron datos detallados de ubicación.');
            }
            
            displayLocationDetails(locationData);

        } catch (error) {
            console.error('Error fetching location:', error);
            showLocationError(error);
        }
    }

    
    function showLocationError(error) {
        document.getElementById('location-details').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i> ${error.message || 'Error al obtener ubicación'}
            </div>
            <div class="mt-3">
                <p class="text-muted">Sugerencias:</p>
                <ul>
                    <li>Verifica tu conexión a internet</li>
                    <li>Intenta en una zona con mejor cobertura</li>
                    <li>Asegúrate de haber concedido permisos de ubicación</li>
                </ul>
            </div>
        `;
    }

    async function getReverseGeocoding(lat, lng) {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyCEbHDjXLECLKHcR-fZMyqb0Yv_Z2Q0scc&language=es`
        );
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error('No se encontraron datos de ubicación.');
        }

        return data.results[0];
    }

    function displayLocationDetails(locationData) {

        const country = locationData.address_components.find(component => component.types.includes('country'))?.long_name || 'No disponible';
        const department = locationData.address_components.find(component => component.types.includes('administrative_area_level_1'))?.long_name || 'No disponible';
        const municipality = locationData.address_components.find(component => component.types.includes('administrative_area_level_2'))?.long_name || 'No disponible';
        const city = locationData.address_components.find(component => component.types.includes('locality'))?.long_name;

        let html = `
            <div class="location-header">
                <i class="fas fa-map-marker-alt text-danger"></i>
                <span class="ms-2">${locationData.formatted_address || 'Ubicacion detectada'}</span>
            </div>
            <div class="location-body mt-3">
                <p><i class="fas fa-globe-americas me-2"></i><strong>País:</strong> ${country}</p>
                <p><i class="fas fa-map me-2"></i><strong>Departamento:</strong> ${department}</p>
                <p><i class="fas fa-city me-2"></i><strong>Municipio:</strong> ${municipality}</p>
        `;

        if (city) {
            html += `<p><i class="fas fa-building me-2"></i><strong>Ciudad:</strong> ${city}</p>`;
        }

        html += '</div>';
        document.getElementById('location-details').innerHTML = html;

        return { country, department, municipality, city };
    }   

    document.getElementById('close-location').addEventListener('click', () => {
        document.getElementById('location-container').classList.add('d-none');
    });

    document.addEventListener('click', (event) => {
        const locationContainer = document.getElementById('location-container');
        const locationBtn = document.getElementById('location-btn');

        if (!locationContainer.contains(event.target) &&
            event.target !== locationBtn && 
            !locationBtn.contains(event.target)) {
            locationContainer.classList.add('d-none');
        }
    });

    document.getElementById('location-container').addEventListener('click', (event) => {
        event.stopPropagation();
    });

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

    // Modal para crear calendario
    function setupCalendarModal() {
        const calendarModal = document.getElementById('calendarModal');
        const createCalendarBtn = document.getElementById('create-calendar');
        const closeCalendarModalButton = calendarModal.querySelector('.close');
        const formRaice = document.getElementById('form-select');
        
        createCalendarBtn.onclick = function(e) {
            e.preventDefault();
            calendarModal.style.display = 'block';
        };
        
        closeCalendarModalButton.onclick = function() {
            calendarModal.style.display = 'none';
        };
        
        formRaice.addEventListener('change', async function(event) {
            event.preventDefault();
            
            const typeRice = parseInt(formRaice.value, 10);
            
            if (typeRice === 0) {
                alert("Por favor selecciona un tipo de arroz.");
                return;
            }

            const currentDate = new Date();
            const formattedDate = currentDate.toISOString().split('T')[0];

            const latitude = sessionStorage.getItem('userLatitude');
            const longitude = sessionStorage.getItem('userLongitude');

            const calendarData = {
                typeRice: typeRice,
                creationDate: formattedDate,
                location: {
                    latitude: latitude ? parseFloat(latitude): null,
                    longitude: longitude ? parseFloat(longitude): null
                }
            };
            console.log(calendarData);
            localStorage.setItem('calendarData', JSON.stringify(calendarData));
            
            // Mostrar un loader mientras se procesa
            const loader = document.createElement('div');
            loader.className = 'modal-loader';
            loader.innerHTML = '<div class="spinner"></div>';
            calendarModal.querySelector('.modal-content').appendChild(loader);

            try {
                const response = await fetchWithAuth(`http://127.0.0.1:8000/event/events/${typeRice}/`, {
                    method: 'GET',
                });

                if (response.ok) {
                    const data = await response.json();

                    console.log('Calendar created:', data);
                    
                    showToast('Calendario creado exitosamente');
                    
                    window.location.href = '/creacion_calendario/index.html';
                     
                } else {
                    throw new Error('Error creating calendar: ' + response.statusText);
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Error al crear el calendario', 'error');
            } finally {
                if (loader) {
                    loader.remove();
                }
                calendarModal.style.display = 'none';
            }
        });
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

    // Iniciar la aplicación
    await fetchUsername();
    saveCalendarDate();
    setupUserModal();
    setupCalendarModal();
    setupLogout();
    loadCalendars();
    loadNotifications();
});