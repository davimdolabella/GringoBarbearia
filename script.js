// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBEtzO4WMfMEQwmBKRKT4DXRizDgF65bd4",
    authDomain: "contadorfila.firebaseapp.com",
    databaseURL: "https://contadorfila-default-rtdb.firebaseio.com",
    projectId: "contadorfila",
    storageBucket: "contadorfila.firebasestorage.app",
    messagingSenderId: "354851756208",
    appId: "1:354851756208:web:b2d084084db88b8170c375",
    measurementId: "G-J2WLBESTLQ"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const filaRef = ref(database, "fila");

// Variáveis globais
let isQueueSectionVisible = false;
let animationFrameId = null;
let currentQueueCount = 0;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApplication();
    setupFirebaseCounters();
});

// ========== FIREBASE E CONTADOR ==========
function setupFirebaseCounters() {
    // Escutar mudanças no Firebase em tempo real
    onValue(filaRef, (snapshot) => {
        const valor = snapshot.val() ?? 0;
        currentQueueCount = valor;
        
        // Atualizar todos os contadores na página
        updateAllCounters(valor);
        
        // Atualizar visualização das pessoas na fila
        updateQueueDisplay(valor);
    });

    // Se estiver no painel de controle, ativar os botões
    const maisBtn = document.getElementById("mais");
    const menosBtn = document.getElementById("menos");

    if (maisBtn && menosBtn) {
        maisBtn.onclick = () => {
            set(filaRef, currentQueueCount + 1);
        };
        
        menosBtn.onclick = () => {
            const novo = Math.max(0, currentQueueCount - 1);
            set(filaRef, novo);
        };
    }
}

// Atualizar todos os contadores na página
function updateAllCounters(count) {
    const contadora = document.querySelectorAll('#contadora');
    const contador = document.querySelectorAll('#contador');
    const contadores = [...contadora, ...contador];
    
    contadores.forEach(contador => {
        animateCounter(contador, parseInt(contador.textContent) || 0, count);
    });
}

// Inicializar aplicação
function initializeApplication() {
    setupNavigation();
    setupScrollEffects();
    setupQueueSystem();
    setupAnimations();
    setupMobileMenu();
    setupSmoothScrolling();
}

// ========== NAVEGAÇÃO ==========
function setupNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Scroll do navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Atualizar link ativo
        updateActiveNavLink();
    });
    
    // Click nos links de navegação
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
            
            // Fechar menu mobile se estiver aberto
            const navMenu = document.getElementById('nav-menu');
            const mobileMenu = document.getElementById('mobile-menu');
            if (navMenu) navMenu.classList.remove('active');
            if (mobileMenu) mobileMenu.classList.remove('active');
        });
    });
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// ========== MENU MOBILE ==========
function setupMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !navMenu.contains(e.target)) {
                mobileMenu.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// ========== SISTEMA DE FILA ==========
function setupQueueSystem() {
    const queueSection = document.getElementById('fila');
    const floatingCounter = document.getElementById('floating-counter');
    
    if (queueSection && floatingCounter) {
        // Intersection Observer para mostrar/esconder contador flutuante
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isQueueSectionVisible = entry.isIntersecting;
                
                if (entry.isIntersecting) {
                    // Seção da fila está visível - esconder contador flutuante
                    floatingCounter.classList.remove('visible');
                } else {
                    // Seção da fila não está visível - mostrar contador flutuante
                    floatingCounter.classList.add('visible');
                }
            });
        }, {
            threshold: 0.3
        });
        
        observer.observe(queueSection);
    }
}

// Atualizar display da fila (função integrada com Firebase)
function updateQueueDisplay(queueCount) {
    const queuePeople = document.getElementById('queue-people');
    
    // Atualizar visualização das pessoas na fila
    if (queuePeople) {
        updateQueuePeople(queuePeople, queueCount);
    }
}

// Animar contador
function animateCounter(element, start, end) {
    const duration = 1000;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * easeOut);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Atualizar pessoas na fila visualmente
function updateQueuePeople(container, count) {
    // Limpar container
    container.innerHTML = '';
    
    // Adicionar ícones de pessoas
    for (let i = 0; i < Math.min(count, 10); i++) {
        const personIcon = document.createElement('div');
        personIcon.className = 'person-icon';
        personIcon.innerHTML = '<i class="fas fa-user"></i>';
        personIcon.style.animationDelay = `${i * 0.1}s`;
        container.appendChild(personIcon);
    }
    
    // Se houver mais de 10 pessoas, mostrar "+X"
    if (count > 10) {
        const moreIcon = document.createElement('div');
        moreIcon.className = 'person-icon';
        moreIcon.innerHTML = `<span>+${count - 10}</span>`;
        moreIcon.style.animationDelay = '1s';
        container.appendChild(moreIcon);
    }
}

// ========== EFEITOS DE SCROLL ==========
function setupScrollEffects() {
    // Intersection Observer para animações de entrada
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Adicionar classe de animação baseada no tipo de elemento
                if (element.classList.contains('portfolio-item')) {
                    element.classList.add('fade-in');
                } else if (element.classList.contains('review-card')) {
                    element.classList.add('slide-left');
                } else if (element.classList.contains('info-card')) {
                    element.classList.add('fade-in');
                }
                
                // Parar de observar o elemento após a animação
                observer.unobserve(element);
            }
        });
    }, observerOptions);
    
    // Observar elementos para animação
    const elementsToAnimate = document.querySelectorAll('.portfolio-item, .review-card, .info-card');
    elementsToAnimate.forEach(el => observer.observe(el));
}

// ========== ANIMAÇÕES ==========
function setupAnimations() {
    // Animação de digitação para o título do hero
    animateHeroTitle();
}

function animateHeroTitle() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;
    
    const originalText = heroTitle.textContent;
    heroTitle.textContent = '';
    
    let index = 0;
    const typeSpeed = 100;
    
    function typeWriter() {
        if (index < originalText.length) {
            heroTitle.textContent += originalText.charAt(index);
            index++;
            setTimeout(typeWriter, typeSpeed);
        }
    }
    
    // Iniciar animação após um pequeno delay
    setTimeout(typeWriter, 500);
}

// ========== SMOOTH SCROLLING ==========
function setupSmoothScrolling() {
    // Melhorar o smooth scroll nativo
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Botões CTA do hero
    const ctaButtons = document.querySelectorAll('.hero-buttons .btn');
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 70;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ========== UTILITÁRIOS ==========
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// ========== INTERAÇÕES AVANÇADAS ==========

// Hover effects para cards
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.portfolio-item, .review-card, .info-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Lazy loading para imagens
function setupLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
}

// ========== PERFORMANCE ==========

// Otimizar scroll events
const optimizedScroll = throttle(() => {
    // Código de scroll otimizado já está nos event listeners acima
}, 16); // ~60fps

window.addEventListener('scroll', optimizedScroll);

// Otimizar resize events
const optimizedResize = debounce(() => {
    // Recalcular dimensões se necessário
    updateResponsiveElements();
}, 250);

window.addEventListener('resize', optimizedResize);

function updateResponsiveElements() {
    // Atualizar elementos que dependem do tamanho da tela
    const isMobile = window.innerWidth <= 768;
    
    // Ajustar comportamentos para mobile/desktop
    if (isMobile) {
        // Comportamentos específicos para mobile
        document.body.classList.add('mobile');
    } else {
        document.body.classList.remove('mobile');
    }
}

// ========== FUNÇÕES UTILITÁRIAS DO FIREBASE ==========

// Função para definir valor específico da fila (útil para reset)
function setQueueCount(count) {
    set(filaRef, Math.max(0, count));
}

// Função para incrementar fila
function incrementQueue() {
    set(filaRef, currentQueueCount + 1);
}

// Função para decrementar fila
function decrementQueue() {
    const novo = Math.max(0, currentQueueCount - 1);
    set(filaRef, novo);
}

// Função para resetar fila
function resetQueue() {
    set(filaRef, 0);
}

// Exportar funções para uso global se necessário
window.queueControls = {
    setCount: setQueueCount,
    increment: incrementQueue,
    decrement: decrementQueue,
    reset: resetQueue,
    getCurrentCount: () => currentQueueCount
};