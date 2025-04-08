if (sessionStorage.getItem("show_signup_success") === "true") {
    // Eliminar el flag
    sessionStorage.removeItem("show_signup_success");
    
    // Mostrar mensaje de éxito
    const messageElement = document.createElement('div');
    messageElement.className = 'signup-success-message';
    messageElement.innerHTML = `
        <div class="alert alert-success" role="alert">
            <strong>Registro completado exitosamente!</strong>
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
        .signup-success-message {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            animation: fadeOut 3s forwards;
            animation-delay: 2s;
        }
        .signup-success-message .alert {
            padding: 15px;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .signup-success-message .close-btn {
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
        .signup-success-message .close-btn:hover {
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

function validatePassword(password) {
    const minLength = /.{8,}/;
    const easyPattern = /^(?:\d+|[a-z]+)$/i;
    const tooManyNumbers = /^(?=(.*\d){5,})/;

    if (!minLength.test(password)) {
        return { isValid: false, message: "La contraseña debe tener al menos 8 caracteres." };
    }
    
    if (easyPattern.test(password)) {
        return { isValid: false, message: "La contraseña es demasiado sencilla. Usa una combinación de letras, números y símbolos." };
    }

    if (tooManyNumbers.test(password)) {
        return { isValid: false, message: "La contraseña tiene demasiados números. Agrega letras y símbolos." };
    }

    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: "La contraseña debe contener al menos una letra mayúscula." };
    }

    if (!/\d/.test(password)) {
        return { isValid: false, message: "La contraseña debe contener al menos un número." };
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { isValid: false, message: "La contraseña debe contener al menos un carácter especial." };
    }

    return { isValid: true };
}

const signupForm = document.getElementById('signup-form');

signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
        if (formSubmitting) return;
        formSubmitting = true;

        const submitButton = signupForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
            submitButton.textContent = 'Registrando...';

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        
        
        try {
            let errors = [];
            
            if (!username) errors.push("El nombre de usuario es obligatorio.");
            if (!email) errors.push("El correo electrónico es obligatorio.");

            const passwordValidation = validatePassword(password);
            if (!passwordValidation.isValid) {
                errors.push(passwordValidation.message);
            }

            if (errors.length > 0) {
                showMessage("Error", errors.join("<br>"), "error", 8000);
                formSubmitting = false;
                return;
            }

            const response = await fetch('https://notepadsbackend-production.up.railway.app/users/signup/', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                let backendErrors = [];
                if (data.username) backendErrors.push(data.username);
                if (data.email) backendErrors.push(data.email);
                if (data.password) backendErrors.push(data.password);
                debugger;
                if (backendErrors.length === 0 && data.error) {
                    backendErrors.push(data.error);
                }
                throw backendErrors.length > 0 ? backendErrors.join("<br>") : "Error en el registro";
                
            }

            if (response.ok){

                if (data.accessToken) localStorage.setItem("access_token", data.accessToken);
                if (data.refreshToken) localStorage.setItem("refresh_token", data.refreshToken);
    
                
                
                sessionStorage.setItem("show_signup_success", "true");
                window.location.href = '/AnimatedLoginPage/html/index.html';
                

                const currentIsMobile = window.innerWidth <= 768;
    
                handleSuccessfulSignup();
    
                localStorage.setItem('isMobileView', currentIsMobile);
                localStorage.setItem('returnFromRegistration', 'true');
                
                signupForm.reset();

            }
        } catch (error) {
            removeAllMessages();
            console.error('Registration error:', error);
            showMessage("Error", typeof error === 'string' ? error : "Error en el registro. Por favor intente nuevamente.", "error", 5000);
            
        } finally {
            resetButton(submitButton, 'Registrarme');
            formSubmitting = false;
        }
});

// State management
let formSubmitting = false;
let allTimeouts = [];


function initializeResponsive() {
    const isMobile = window.innerWidth <= 768;
    const mobileNav = document.getElementById('mobile-nav');
    
    localStorage.setItem('isMobileView', isMobile);
    
    if (isMobile) {
        document.body.classList.add('mobile-view');
        if (mobileNav) {
            mobileNav.style.display = 'flex';
        }
        
        updateMobileButtons();
    } else {
        document.body.classList.remove('mobile-view');
        if (mobileNav) {
            mobileNav.style.display = 'none';
        }
    }
}

function checkStoredViewState() {
    const isMobileView = localStorage.getItem('isMobileView') === 'true';
    const mobileNav = document.getElementById('mobile-nav');
    
    if (isMobileView) {
        document.body.classList.add('mobile-view');
        if (mobileNav) {
            mobileNav.style.display = 'flex';
        }
        updateMobileButtons();
    } else {
        document.body.classList.remove('mobile-view');
    }
}

function handleSuccessfulSignup() {
    // showMessage("Registro completado", "Puedes dirigirte al Inicio de sesión", "success", 5000);

    const signupForm = document.getElementById('signup-form');


    setTimeout(() => {
        signupForm.reset();
        const container = document.getElementById('container');
        container.classList.remove("active"); 
        updateMobileButtons(); 
    }, 4000);
}

function updateMobileButtons() {
    const container = document.getElementById('container');
    const mobileLogin = document.getElementById('mobile-login');
    const mobileSignup = document.getElementById('mobile-signup');
    
    if (container && mobileLogin && mobileSignup) {
        if (container.classList.contains('active')) {
            mobileSignup.classList.add('active');
            mobileLogin.classList.remove('active');
        } else {
            mobileLogin.classList.add('active');
            mobileSignup.classList.remove('active');
        }
    }
}

function togglePassword(inputId, eyeIcon) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");
    }
}


// Google authentication handler
async function handleCredentialResponse(response) {
    try {
        console.log('User authenticated with Google');
        const access_token = response.credential;


        const backendResponse = await fetch('https://notepadsbackend-production.up.railway.app/users/google-login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ credential: access_token })
        });
        console.log('Backend response status:', backendResponse.status);
        
        let data;
        const contentType = backendResponse.headers.get('content-type');
        
        try {
            if (contentType && contentType.includes("application/json")) {
                data = await backendResponse.json();
                console.log('Received JSON data');
            } else {
                data = await backendResponse.text();
                console.log('Received text data');
            }
        } catch (parseError) {
            console.error('Error processing response:', parseError);
            showMessage('Error', 'Error procesando la respuesta del servidor', 'error');
            return;
        }
        
        if (backendResponse.ok) {
            console.log('Successfully logged in');

            //Verifying the data was an object
            if (typeof data === 'object' && data !== null) {
                //save tokens
                if (data.access_token) {
                    localStorage.setItem("access_token", data.access_token);
                    console.log('Access token saved');
                } else {
                    console.warn('No access_token received');
                }
                
                if (data.refresh_token) {
                    localStorage.setItem("refresh_token", data.refresh_token);
                    console.log('Refresh token saved');
                } else {
                    console.warn('No refresh_token received');
                }
            } else {
                console.error('Invalid data format received:', data);
                showMessage('Error', 'El formato de la respuesta es incorrecto', 'error');
                return;
            }

            sessionStorage.setItem("show_login_success", "true");
            
            window.location.href = '/mainPageProject/html/index.html';
            
        } else {
            console.error('Error authenticating user:', data);
            const errorMessage = (data && data.error) ? data.error : 'Autenticacion fallida. Por favor, intenta de nuevo.';
            showMessage('Error', errorMessage, 'error'); 
        }
    } catch (error) {
        console.error("Error sending data:", error);
        showMessage('Error', 'Error de conexion. Por favor, intenta de nuevo.', 'error');
    } 
}

// Form event listeners
document.addEventListener('DOMContentLoaded', () => {

    if (localStorage.getItem('returnFromRegistration') === 'true') {
        localStorage.removeItem('returnFromRegistration');
        localStorage.setItem('returnToLogin', 'true');
        localStorage.removeItem('returnToSignup');
    }

    checkStoredViewState();
    initializeResponsive();

    
    window.addEventListener('resize', initializeResponsive);
    

    const loginForm = document.getElementById('login-form');
    
    // Login form handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const submitButton = loginForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Iniciando sesión...';
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            
            try {
                const response = await fetch('https://notepadsbackend-production.up.railway.app/users/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });
                
                
                let data;
                const contentType = response.headers.get("content-type");
                
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    data = await response.text();
                }
                
                if (response.ok) {
                    console.log('Login successful');
                    
                    // Save tokens
                    if (typeof data === 'object') {
                        if (data.accessToken) {
                            localStorage.setItem("access_token", data.accessToken);
                        }
                        if (data.refreshToken) {
                            localStorage.setItem("refresh_token", data.refreshToken);
                        }
                        showMessage('Inicio de sesión exitoso.', 'Serás redirigido pronto', 'success');
                    } else {
                        showMessage('Inicio de sesión exitoso.', data || 'Serás redirigido pronto', 'success');
                    }
                    
                    setTimeout(() => {
                        window.location.href = '/mainPageProject/html/index.html';
                    }, 3000);
                    
                } else {
                    const errorMsg = typeof data === 'object' ? (data.error || JSON.stringify(data)) : data;
                    console.error('Login error:', errorMsg);
                    showMessage('Error', errorMsg || 'Error iniciando sesión', 'error');
                    resetButton(submitButton, 'Iniciar Sesion');
                }
                
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error', 'Error de conexión. Por favor intente de nuevo.', 'error');
                resetButton(submitButton, 'Iniciar Sesion');
            }
        });
    }
    
    // UI toggle handlers
    const container = document.getElementById('container');
    const loginBtn = document.getElementById('Login');
    const registerBtn = document.getElementById('register');
    const mobileLogin = document.getElementById('mobile-login');
    const mobileSignup = document.getElementById('mobile-signup');
    
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            container.classList.add("active");
            localStorage.removeItem('returnToLogin');
            localStorage.setItem('returnToSignup', 'true');
            updateMobileButtons();

        });
    }
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            container.classList.remove("active"); 
            localStorage.setItem('returnToLogin', 'true');
            localStorage.removeItem('returnToSignup');  
            updateMobileButtons();
        });
    }

    if (mobileLogin) {
        mobileLogin.addEventListener('click', () => {
            container.classList.remove("active");
            localStorage.setItem('returnToLogin', 'true');
            localStorage.removeItem('returnToSignup');
            updateMobileButtons();
        });
    }
    
    if (mobileSignup) {
        mobileSignup.addEventListener('click', () => {
            container.classList.add("active");
            localStorage.removeItem('returnToLogin');
            localStorage.setItem('returnToSignup', 'true');
            updateMobileButtons();
        });
    }

    if (localStorage.getItem('returnToLogin') === 'true' || 
        localStorage.getItem('returnToSignup') === 'true') {
        setTimeout(() => {
            localStorage.removeItem('returnToLogin');
            localStorage.removeItem('returnToSignup');
        }, 60000);
    }
});



function resetButton(button, text) {
    button.disabled = false;
    button.textContent = text;
}


function showMessage(title, message, type, duration = 5000) {
    removeAllMessages();

    const messageId = 'msg-' + Date.now();
    

    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container ' + type + '-message';
    messageContainer.id = messageId;
    messageContainer.style.position = 'fixed';
    messageContainer.style.top = '20px';
    messageContainer.style.left = '50%';
    messageContainer.style.transform = 'translateX(-50%)';
    messageContainer.style.zIndex = '1000';
    messageContainer.style.padding = '15px 25px';
    messageContainer.style.borderRadius = '5px';
    messageContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    messageContainer.style.display = 'flex';
    messageContainer.style.flexDirection = 'column';
    messageContainer.style.alignItems = 'center';
    messageContainer.style.minWidth = '300px';
    messageContainer.style.maxWidth = '80%';
    messageContainer.style.textAlign = 'center';
    messageContainer.style.transition = 'opacity 0.5s ease';
    

    if (type === 'success') {
        messageContainer.style.backgroundColor = '#4CAF50';
        messageContainer.style.color = 'white';
    } else if (type === 'error') {
        messageContainer.style.backgroundColor = '#f44336';
        messageContainer.style.color = 'white';
    } else {
        messageContainer.style.backgroundColor = '#2196F3';
        messageContainer.style.color = 'white';
    }
    

    const titleElement = document.createElement('h4');
    titleElement.innerHTML = title;
    titleElement.style.margin = '0 0 8px 0';
    

    const messageElement = document.createElement('p');
    messageElement.innerHTML = message;
    messageElement.style.margin = '0';
    

    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '5px';
    closeButton.style.background = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => messageContainer.remove();

    messageContainer.appendChild(titleElement);
    messageContainer.appendChild(messageElement);
    messageContainer.appendChild(closeButton);
    

    if (type === 'error') {
        const acknowledgeButton = document.createElement('button');
        acknowledgeButton.textContent = 'Entiendo';
        acknowledgeButton.style.marginTop = '15px';
        acknowledgeButton.style.padding = '5px 15px';
        acknowledgeButton.style.backgroundColor = 'white';
        acknowledgeButton.style.color = '#f44336';
        acknowledgeButton.style.border = 'none';
        acknowledgeButton.style.borderRadius = '3px';
        acknowledgeButton.style.cursor = 'pointer';
        acknowledgeButton.onclick = () => messageContainer.remove();
        messageContainer.appendChild(acknowledgeButton);
    }
    

    document.body.appendChild(messageContainer);
    

    if (type !== 'error' || duration > 0) {
        setTimeout(() => {
          if (messageContainer.parentNode) {
            fadeOutMessage(messageContainer);
          }  
        }, duration);    
    }
}


function fadeOutMessage(element) {
    element.style.opacity = '0';
    
    const fadeTimeoutId = setTimeout(() => {
        if (document.body.contains(element)) {
            element.remove();
        }
    }, 500);
    
    allTimeouts.push(fadeTimeoutId);
}


function removeAllMessages() {

    allTimeouts.forEach(timeoutId => {
        clearTimeout(timeoutId);
    });
    allTimeouts = [];

    const existingMessages = document.querySelectorAll('.message-container');
    existingMessages.forEach(msg => {
        if (document.body.contains(msg)) {
            msg.remove();
        }
    });
}