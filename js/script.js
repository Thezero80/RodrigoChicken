document.addEventListener("DOMContentLoaded", () => {
    // 1. Efecto Sticky en el Header al hacer scroll
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });

    // 2. Animación suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 3. Toggle de menú móvil básico
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if(menuToggle) {
        menuToggle.addEventListener('click', () => {
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '70px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'rgba(10, 10, 10, 0.95)';
                navLinks.style.padding = '20px 0';
                navLinks.style.textAlign = 'center';
            }
        });
    }

    // ==========================================
    // LÓGICA DEL CARRITO DE COMPRAS
    // ==========================================
    
    // Cargar el carrito desde localStorage o crear uno vacío
    let cart = JSON.parse(localStorage.getItem('rodrigo_cart')) || {};
    
    // Elementos del DOM del carrito
    const cartFloatingBtn = document.getElementById('cart-floating-btn');
    const cartCount = document.getElementById('cart-count');
    const orderModal = document.getElementById('order-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    const orderItemsContainer = document.getElementById('order-items');
    const orderTotalDisplay = document.getElementById('order-total');
    // Nuevo: Elemento del contador en el header
    const headerCartCount = document.getElementById('header-cart-count');

    // Función global para actualizar el carrito (sumar o restar)
    window.updateCart = function(itemName, itemPrice, change) {
        if (!cart[itemName]) {
            cart[itemName] = { price: itemPrice, qty: 0 };
        }
        
        cart[itemName].qty += change;
        
        if (cart[itemName].qty <= 0) {
            delete cart[itemName];
        }
        
        saveCart();
        updateUI();
    };

    // Guardar en localStorage
    function saveCart() {
        localStorage.setItem('rodrigo_cart', JSON.stringify(cart));
    }

    // Actualizar la interfaz (contadores en los platos y botón flotante/header)
    function updateUI() {
        let totalItems = 0;
        let totalPrice = 0;
        
        // Reiniciar todos los contadores en pantalla a 0
        document.querySelectorAll('.qty-display').forEach(el => {
            el.innerText = '0';
        });

        // Actualizar contadores con los datos del carrito
        for (let item in cart) {
            totalItems += cart[item].qty;
            totalPrice += cart[item].price * cart[item].qty;
            
            // Buscar si el plato está en la página actual y actualizar su número
            const displayEl = document.querySelector(`.qty-display[data-id="${item}"]`);
            if (displayEl) {
                displayEl.innerText = cart[item].qty;
            }
        }

        // Mostrar u ocultar el botón flotante
        if (cartFloatingBtn && cartCount) {
            if (totalItems > 0) {
                cartFloatingBtn.style.display = 'flex';
                cartCount.innerText = totalItems;
                // Pequeña animación para llamar la atención
                cartFloatingBtn.style.transform = 'scale(1.1)';
                setTimeout(() => cartFloatingBtn.style.transform = 'scale(1)', 200);
            } else {
                cartFloatingBtn.style.display = 'none';
            }
        }

        // Mostrar u ocultar el contador del botón en el Header
        if (headerCartCount) {
            if (totalItems > 0) {
                headerCartCount.style.display = 'inline-block';
                headerCartCount.innerText = totalItems;
            } else {
                headerCartCount.style.display = 'none';
            }
        }
    }

    // Construir el contenido del Modal (Ahora es una función global accesible)
    window.openCartModal = function() {
        orderItemsContainer.innerHTML = '';
        let total = 0;

        for (let item in cart) {
            const qty = cart[item].qty;
            const price = cart[item].price;
            const subtotal = qty * price;
            total += subtotal;

            const itemDiv = document.createElement('div');
            itemDiv.classList.add('modal-item');
            itemDiv.innerHTML = `
                <span><strong>${qty}x</strong> ${item}</span>
                <span>S/. ${subtotal.toFixed(2)}</span>
            `;
            orderItemsContainer.appendChild(itemDiv);
        }

        orderTotalDisplay.innerText = `S/. ${total.toFixed(2)}`;
        orderModal.style.display = 'flex';
    }

    // Abrir Modal desde el botón flotante
    if (cartFloatingBtn) {
        cartFloatingBtn.addEventListener('click', openCartModal);
    }

    // Cerrar Modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            orderModal.style.display = 'none';
        });
    }
    
    // Cerrar clickeando afuera
    window.addEventListener('click', (e) => {
        if (e.target === orderModal) {
            orderModal.style.display = 'none';
        }
    });

    // Enviar a WhatsApp
    if (confirmOrderBtn) {
        confirmOrderBtn.addEventListener('click', () => {
            let message = "Hola *RODRIGO CHICKEN* 🍗, quiero realizar el siguiente pedido:\n\n";
            let total = 0;

            for (let item in cart) {
                const qty = cart[item].qty;
                const price = cart[item].price;
                const subtotal = qty * price;
                total += subtotal;

                message += `▪️ ${qty}x ${item} (S/. ${subtotal.toFixed(2)})\n`;
            }

            message += `\n*Total a pagar: S/. ${total.toFixed(2)}*\n\n`;
            message += "Por favor, confírmenme el pedido y el tiempo de entrega. ¡Gracias!";

            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/51935039115?text=${encodedMessage}`;

            // Vaciar carrito después de enviar y redirigir
            cart = {};
            saveCart();
            updateUI();
            orderModal.style.display = 'none';
            
            window.open(whatsappUrl, '_blank');
        });
    }

    // Inicializar UI al cargar la página
    updateUI();
});