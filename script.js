// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#fff';
        navbar.style.backdropFilter = 'none';
    }
});

// Favorite button functionality
document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const icon = btn.querySelector('i');
        
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            btn.style.background = '#ef4444';
            btn.style.color = 'white';
            
            // Add animation
            btn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 200);
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            btn.style.background = 'white';
            btn.style.color = '#333';
        }
    });
});

// Search form functionality
const searchForm = document.querySelector('.search-form');
const searchBtn = document.querySelector('.search-btn');

searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Get form values
    const location = document.querySelector('input[placeholder="Where are you going?"]').value;
    const checkIn = document.querySelector('input[type="date"]:nth-of-type(1)').value;
    const checkOut = document.querySelector('input[type="date"]:nth-of-type(2)').value;
    const guests = document.querySelector('select').value;
    
    // Basic validation
    if (!location) {
        showNotification('Please enter a destination', 'error');
        return;
    }
    
    if (!checkIn || !checkOut) {
        showNotification('Please select check-in and check-out dates', 'error');
        return;
    }
    
    if (new Date(checkIn) >= new Date(checkOut)) {
        showNotification('Check-out date must be after check-in date', 'error');
        return;
    }
    
    // Simulate search
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
    searchBtn.disabled = true;
    
    setTimeout(() => {
        showNotification('Search completed! Found 15 properties matching your criteria.', 'success');
        searchBtn.innerHTML = '<i class="fas fa-search"></i> Search';
        searchBtn.disabled = false;
    }, 2000);
});

// Newsletter subscription
const newsletterForm = document.querySelector('.newsletter-form');
const newsletterInput = newsletterForm.querySelector('input[type="email"]');
const newsletterBtn = newsletterForm.querySelector('button');

newsletterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    const email = newsletterInput.value;
    
    if (!email || !isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    newsletterBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
    newsletterBtn.disabled = true;
    
    setTimeout(() => {
        showNotification('Thank you for subscribing! You\'ll receive our latest updates.', 'success');
        newsletterInput.value = '';
        newsletterBtn.innerHTML = 'Subscribe';
        newsletterBtn.disabled = false;
    }, 1500);
});

// Property card hover effects
document.querySelectorAll('.property-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.property-card, .feature-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    notification.querySelector('.notification-close').style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        margin-left: auto;
        padding: 5px;
        border-radius: 4px;
        transition: background 0.2s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// Date input restrictions
const checkInInput = document.querySelector('input[type="date"]:nth-of-type(1)');
const checkOutInput = document.querySelector('input[type="date"]:nth-of-type(2)');

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
checkInInput.min = today;
checkOutInput.min = today;

// Update check-out minimum when check-in changes
checkInInput.addEventListener('change', () => {
    if (checkInInput.value) {
        const checkInDate = new Date(checkInInput.value);
        checkInDate.setDate(checkInDate.getDate() + 1);
        checkOutInput.min = checkInDate.toISOString().split('T')[0];
        
        // Clear check-out if it's before new minimum
        if (checkOutInput.value && new Date(checkOutInput.value) <= new Date(checkInInput.value)) {
            checkOutInput.value = '';
        }
    }
});

// Loading states for buttons
function setButtonLoading(button, loading = true) {
    if (loading) {
        button.disabled = true;
        button.style.opacity = '0.7';
        button.style.cursor = 'not-allowed';
    } else {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    }
}

// Form validation
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            input.style.borderColor = '#e5e7eb';
        }
    });
    
    return isValid;
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('Keyhost Homes website loaded successfully!');
    
    // Add loading animation to property cards
    const propertyCards = document.querySelectorAll('.property-card');
    propertyCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});

// Performance optimization: Lazy loading for images
if ('IntersectionObserver' in window) {
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
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}








