const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');
const ctaButton = document.querySelector('#ctaButton');
const registerButton = document.querySelector('#registerButton');
const loginButton = document.querySelector('#loginButton');
const authSection = document.querySelector('#auth-section');
const registerSection = document.querySelector('#register-section');
const loginSection = document.querySelector('#login-section');
const form = document.querySelector('#consultaForm');
const loginForm = document.querySelector('#loginForm');
const formSuccess = document.querySelector('#formSuccess');
const loginSuccess = document.querySelector('#loginSuccess');

const closeMenu = () => {
    hamburger?.classList.remove('active');
    navMenu?.classList.remove('active');
    hamburger?.setAttribute('aria-expanded', 'false');
};

const toggleMenu = () => {
    const isExpanded = hamburger?.classList.toggle('active');
    navMenu?.classList.toggle('active');
    hamburger?.setAttribute('aria-expanded', String(Boolean(isExpanded)));
};

hamburger?.addEventListener('click', toggleMenu);

navLinks.forEach(link => {
    link.addEventListener('click', event => {
        event.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = targetId ? document.querySelector(targetId) : null;

        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        closeMenu();
    });
});

document.addEventListener('click', event => {
    if (!event.target.closest('.navbar')) {
        closeMenu();
    }
});

ctaButton?.addEventListener('click', () => {
    const contactSection = document.querySelector('#contact');
    contactSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

const showAuthSection = type => {
    if (!authSection || !registerSection || !loginSection) return;

    authSection.classList.remove('hidden');
    authSection.classList.add('visible');
    authSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (type === 'login') {
        registerSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
        formSuccess.textContent = '';
    } else {
        registerSection.classList.remove('hidden');
        loginSection.classList.add('hidden');
        loginSuccess.textContent = '';
    }
};

registerButton?.addEventListener('click', () => showAuthSection('register'));
loginButton?.addEventListener('click', () => showAuthSection('login'));

const validators = {
    nombre: value => /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value.trim()),
    email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    telefono: value => /^\+?[0-9\s\-()]{7,20}$/.test(value.trim()),
    empresa: value => /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\.&-]{2,}$/.test(value.trim()),
    sitio: value => /^(https?:\/\/)[^\s$.?#].[^\s]*$/.test(value.trim()),
    registerPassword: value => value.trim().length >= 6
};

const errorMessages = {
    nombre: 'Ingrese un nombre válido (solo letras y espacios).',
    email: 'Ingrese un correo con formato válido.',
    telefono: 'Ingrese un teléfono válido (números, espacios, +, -).',
    empresa: 'Ingrese un nombre de empresa válido.',
    sitio: 'Ingrese una URL válida que comience con https:// o http://.',
    registerPassword: 'La contraseña debe tener al menos 6 caracteres.'
};

const showErrors = (container, errors) => {
    container.querySelectorAll('.form-error').forEach(span => {
        const field = span.dataset.errorFor;
        span.textContent = errors[field] || '';
    });
};

const saveRegistration = data => {
    let allRegistrations = JSON.parse(localStorage.getItem('allRegistrations') || '[]');
    const registrationRecord = {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        empresa: data.empresa,
        sitio: data.sitio,
        fecha: new Date().toLocaleString('es-ES')
    };
    allRegistrations.push(registrationRecord);
    localStorage.setItem('allRegistrations', JSON.stringify(allRegistrations));
};

const buildCsv = data => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Empresa', 'Sitio Web'];
    const row = [data.nombre, data.email, data.telefono, data.empresa, data.sitio];
    const escapeCsv = value => `"${String(value).replace(/"/g, '""')}"`;
    return `${headers.map(escapeCsv).join(',')}\n${row.map(escapeCsv).join(',')}`;
};

const downloadCsv = csvText => {
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'registro-formulario.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

form?.addEventListener('submit', event => {
    event.preventDefault();

    const formData = {
        nombre: form.nombre.value,
        email: form.email.value,
        telefono: form.telefono.value,
        empresa: form.empresa.value,
        sitio: form.sitio.value,
        registerPassword: form.registerPassword.value
    };

    const errors = {};
    Object.keys(formData).forEach(key => {
        if (!validators[key](formData[key])) {
            errors[key] = errorMessages[key];
        }
    });

    if (Object.keys(errors).length > 0) {
        formSuccess.textContent = '';
        showErrors(form, errors);
        return;
    }

    showErrors(form, {});
    saveRegistration(formData);
    localStorage.setItem('registeredEmail', formData.email);
    localStorage.setItem('registeredPassword', formData.registerPassword);
    form.reset();
    formSuccess.textContent = 'Registro guardado correctamente. Ahora puedes iniciar sesión con tu correo y contraseña.';
    alert('Formulario enviado y guardado en el sistema.');
});

loginForm?.addEventListener('submit', event => {
    event.preventDefault();

    const loginData = {
        loginEmail: loginForm.loginEmail.value,
        loginPassword: loginForm.loginPassword.value
    };

    const loginErrors = {};
    if (!validators.email(loginData.loginEmail)) {
        loginErrors.loginEmail = errorMessages.email;
    }

    if (loginData.loginPassword.trim().length < 6) {
        loginErrors.loginPassword = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (Object.keys(loginErrors).length > 0) {
        loginSuccess.textContent = '';
        showErrors(loginForm, loginErrors);
        return;
    }

    const savedEmail = localStorage.getItem('registeredEmail');
    const savedPassword = localStorage.getItem('registeredPassword');

    if (savedEmail !== loginData.loginEmail || savedPassword !== loginData.loginPassword) {
        loginSuccess.textContent = '';
        showErrors(loginForm, {
            loginPassword: 'Correo o contraseña incorrectos.',
            loginEmail: savedEmail ? '' : 'No hay un usuario registrado con este correo.'
        });
        return;
    }

    showErrors(loginForm, {});
    loginForm.reset();
    loginSuccess.textContent = 'Inicio de sesión exitoso.';
    alert('Inicio de sesión exitoso.');
});
