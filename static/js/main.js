// Main JavaScript file for GotoFast Logistics Web App

// Global variables
let currentOrder = null;
let priceCalculated = false;

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize form validation
    initializeFormValidation();
    
    // Initialize price calculation
    initializePriceCalculation();
    
    // Initialize tracking functionality
    initializeTracking();
    
    // Initialize dashboard functionality
    initializeDashboard();
    
    // Initialize navigation
    initializeNavigation();
}

// Initialize Bootstrap tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Initialize form validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                showAlert('Please fill in all required fields correctly', 'warning');
            }
            form.classList.add('was-validated');
        }, false);
    });
    
    // Real-time validation for all inputs
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(function(input) {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
    
    // Phone number validation
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(function(input) {
        input.addEventListener('input', function() {
            validatePhoneNumber(this);
        });
    });
    
    // Email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(function(input) {
        input.addEventListener('input', function() {
            validateEmail(this);
        });
    });
    
    // Weight validation with real-time feedback
    const weightInput = document.getElementById('weight');
    if (weightInput) {
        weightInput.addEventListener('input', function() {
            validateWeight(this);
        });
    }
    
    // Dimension validation
    const dimensionInputs = ['length', 'width', 'height'];
    dimensionInputs.forEach(function(fieldId) {
        const input = document.getElementById(fieldId);
        if (input) {
            input.addEventListener('input', function() {
                validateDimension(this);
            });
        }
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const isRequired = field.hasAttribute('required');
    
    if (isRequired && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Specific validations based on field type
    switch (field.type) {
        case 'email':
            return validateEmail(field);
        case 'tel':
            return validatePhoneNumber(field);
        case 'number':
            if (field.id === 'weight') {
                return validateWeight(field);
            } else if (['length', 'width', 'height'].includes(field.id)) {
                return validateDimension(field);
            }
            break;
    }
    
    return true;
}

// Validate weight
function validateWeight(input) {
    const value = parseFloat(input.value);
    
    if (value < 0.1) {
        showFieldError(input, 'Weight must be at least 0.1 kg');
        return false;
    } else if (value > 1000) {
        showFieldError(input, 'Weight cannot exceed 1000 kg');
        return false;
    } else {
        clearFieldError(input);
        return true;
    }
}

// Validate dimension
function validateDimension(input) {
    const value = parseFloat(input.value);
    
    if (value < 1) {
        showFieldError(input, 'Dimension must be at least 1 cm');
        return false;
    } else if (value > 500) {
        showFieldError(input, 'Dimension cannot exceed 500 cm');
        return false;
    } else {
        clearFieldError(input);
        return true;
    }
}

// Show field error
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('is-invalid');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    errorDiv.id = field.id + '-error';
    
    field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(field) {
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
    
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Validate phone number
function validatePhoneNumber(input) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const value = input.value.replace(/\s+/g, '');
    
    if (value && !phoneRegex.test(value)) {
        showFieldError(input, 'Please enter a valid phone number');
        return false;
    } else {
        clearFieldError(input);
        return true;
    }
}

// Validate email
function validateEmail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (input.value && !emailRegex.test(input.value)) {
        showFieldError(input, 'Please enter a valid email address');
        return false;
    } else {
        clearFieldError(input);
        return true;
    }
}

// Initialize price calculation
function initializePriceCalculation() {
    const orderForm = document.getElementById('orderForm');
    if (!orderForm) return;
    
    const priceFields = ['zone_id', 'weight', 'size', 'payment_mode'];
    
    priceFields.forEach(function(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', function() {
                if (priceCalculated) {
                    calculatePrice();
                }
            });
        }
    });
    
    // Weight input real-time validation
    const weightInput = document.getElementById('weight');
    if (weightInput) {
        weightInput.addEventListener('input', function() {
            if (this.value < 0.1) {
                this.setCustomValidity('Weight must be at least 0.1 kg');
            } else if (this.value > 1000) {
                this.setCustomValidity('Weight cannot exceed 1000 kg');
            } else {
                this.setCustomValidity('');
            }
        });
    }
}

// Calculate price function
function calculatePrice() {
    const zoneId = document.getElementById('zone_id')?.value;
    const weight = parseFloat(document.getElementById('weight')?.value);
    const length = parseFloat(document.getElementById('length')?.value);
    const width = parseFloat(document.getElementById('width')?.value);
    const height = parseFloat(document.getElementById('height')?.value);
    const quantity = parseInt(document.getElementById('quantity')?.value) || 1;
    const paymentMode = document.getElementById('payment_mode')?.value;
    const insuranceRequired = document.getElementById('insurance_required')?.checked;
    const insuranceValue = parseFloat(document.getElementById('insurance_value')?.value) || 0;
    
    if (!zoneId || !weight || !length || !width || !height || !paymentMode) {
        showAlert('Please fill in all required fields', 'warning');
        return;
    }
    
    if (weight < 0.1 || weight > 1000) {
        showAlert('Weight must be between 0.1 and 1000 kg', 'warning');
        return;
    }
    
    if (length < 1 || width < 1 || height < 1) {
        showAlert('All dimensions must be at least 1 cm', 'warning');
        return;
    }
    
    // Show loading
    const priceBreakdown = document.getElementById('priceBreakdown');
    priceBreakdown.style.display = 'block';
    priceBreakdown.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> Calculating...</div>';
    
    fetch('/api/calculate-price', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            zone_id: zoneId,
            weight: weight,
            length: length,
            width: width,
            height: height,
            quantity: quantity,
            payment_mode: paymentMode,
            insurance_required: insuranceRequired,
            insurance_value: insuranceValue
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showAlert(data.error, 'danger');
            priceBreakdown.style.display = 'none';
            return;
        }
        
        updatePriceDisplay(data);
    })
    .catch(error => {
        console.error('Error calculating price:', error);
        showAlert('Error calculating price. Please try again.', 'danger');
        priceBreakdown.style.display = 'none';
    });
}

// Update price display
function updatePriceDisplay(data) {
    const priceBreakdown = document.getElementById('priceBreakdown');
    
    if (!data || !data.total_amount) {
        priceBreakdown.style.display = 'none';
        return;
    }
    
    const volume = data.volume || 0;
    const breakdown = data.breakdown || {};
    const deliveryDate = new Date(data.estimated_delivery).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    priceBreakdown.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <p><strong>Weight Cost:</strong> <span>₹${(breakdown.base_cost || 0).toFixed(2)}</span></p>
                <p><strong>Volume (${volume.toFixed(3)} m³):</strong> <span>₹${(breakdown.volume_cost || 0).toFixed(2)}</span></p>
                <p><strong>Payment Fee:</strong> <span>₹${(breakdown.payment_fee || 0).toFixed(2)}</span></p>
                <p><strong>Insurance Fee:</strong> <span>₹${(breakdown.insurance_cost || 0).toFixed(2)}</span></p>
            </div>
            <div class="col-md-6">
                <p><strong>Estimated Delivery:</strong> <span>${deliveryDate}</span></p>
                <p><strong>Delivery Days:</strong> <span>${data.delivery_days || 0} days</span></p>
                <h4 class="text-primary"><strong>Total Amount: ₹${data.total_amount.toFixed(2)}</strong></h4>
            </div>
        </div>
    `;
    
    priceBreakdown.style.display = 'block';
    priceBreakdown.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Enable submit button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = false;
    }
}

// Initialize tracking functionality
function initializeTracking() {
    const trackingForm = document.querySelector('form[method="POST"]');
    if (!trackingForm) return;
    
    const referenceInput = document.getElementById('reference_number');
    if (referenceInput) {
        referenceInput.addEventListener('input', function() {
            // Format reference number as user types
            this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
    }
    
    // Initialize progress animations
    initializeProgressAnimations();
}

// Initialize progress animations
function initializeProgressAnimations() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    progressBars.forEach(function(bar) {
        const targetWidth = bar.style.width;
        bar.style.width = '0%';
        
        setTimeout(function() {
            bar.style.transition = 'width 1s ease-in-out';
            bar.style.width = targetWidth;
        }, 500);
    });
}

// Initialize dashboard functionality
function initializeDashboard() {
    // Auto-refresh dashboard every 30 seconds
    if (window.location.pathname.includes('dashboard')) {
        setInterval(function() {
            refreshDashboardStats();
        }, 30000);
    }
    
    // Initialize order status updates
    initializeOrderStatusUpdates();
    
    // Initialize search functionality
    initializeSearchFunctionality();
}

// Refresh dashboard statistics
function refreshDashboardStats() {
    // This would typically make an AJAX call to get updated stats
    // For now, we'll just update the timestamp
    const timestamp = document.querySelector('.last-updated');
    if (timestamp) {
        timestamp.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    }
}

// Initialize order status updates
function initializeOrderStatusUpdates() {
    const statusSelects = document.querySelectorAll('select[name="delivery_status"]');
    
    statusSelects.forEach(function(select) {
        select.addEventListener('change', function() {
            const orderId = this.closest('form').querySelector('input[name="order_id"]').value;
            const status = this.value;
            
            // Add visual feedback
            this.classList.add('updating');
            
            // Remove updating class after animation
            setTimeout(() => {
                this.classList.remove('updating');
            }, 1000);
        });
    });
}

// Initialize search functionality
function initializeSearchFunctionality() {
    const searchInputs = document.querySelectorAll('input[type="search"]');
    
    searchInputs.forEach(function(input) {
        let searchTimeout;
        
        input.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            
            searchTimeout = setTimeout(() => {
                performSearch(this.value);
            }, 300);
        });
    });
}

// Perform search
function performSearch(query) {
    // This would typically make an AJAX call
    console.log('Searching for:', query);
}

// Initialize navigation
function initializeNavigation() {
    // Highlight active navigation item
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(function(link) {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
    
    // Mobile navigation toggle
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            this.classList.toggle('collapsed');
        });
    }
}

// Utility function to show alerts
function showAlert(message, type = 'info') {
    const alertContainer = document.querySelector('.container');
    if (!alertContainer) return;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert alert at the top of the container
    alertContainer.insertBefore(alertDiv, alertContainer.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Format date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showAlert('Copied to clipboard!', 'success');
    }).catch(() => {
        showAlert('Failed to copy to clipboard', 'danger');
    });
}

// Print functionality
function printPage() {
    window.print();
}

// Export functionality
function exportData(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Debounce function
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

// Throttle function
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
    };
}

// Loading state management
function showLoading(element) {
    if (element) {
        element.classList.add('loading');
        element.disabled = true;
    }
}

function hideLoading(element) {
    if (element) {
        element.classList.remove('loading');
        element.disabled = false;
    }
}

// Form submission with loading state
function submitFormWithLoading(form, callback) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    showLoading(submitBtn);
    submitBtn.textContent = 'Processing...';
    
    Promise.resolve(callback()).finally(() => {
        hideLoading(submitBtn);
        submitBtn.textContent = originalText;
    });
}

// Smooth scroll to element
function smoothScrollTo(element, offset = 0) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
    });
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Animate on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
        if (isInViewport(element)) {
            element.classList.add('animated');
        }
    });
}

// Initialize scroll animations
window.addEventListener('scroll', throttle(animateOnScroll, 100));

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showAlert('An unexpected error occurred. Please try again.', 'danger');
});

// Handle online/offline status
window.addEventListener('online', function() {
    showAlert('Connection restored', 'success');
});

window.addEventListener('offline', function() {
    showAlert('Connection lost. Some features may not work.', 'warning');
});

// Dynamic Timeline Functions
function loadTimeline(referenceNumber) {
    fetch(`/order/${referenceNumber}/timeline`)
        .then(response => response.json())
        .then(data => {
            const timelineContainer = document.getElementById('timelineEvents');
            if (!timelineContainer) return;
            
            timelineContainer.innerHTML = '';
            
            if (data.timeline && data.timeline.length > 0) {
                data.timeline.forEach((event, index) => {
                    const eventElement = createTimelineEvent(event, index);
                    timelineContainer.appendChild(eventElement);
                });
            } else {
                // Show default timeline if no events
                showDefaultTimeline(timelineContainer);
            }
        })
        .catch(error => {
            console.error('Error loading timeline:', error);
        });
}

function createTimelineEvent(event, index) {
    const eventDiv = document.createElement('div');
    eventDiv.className = 'timeline-event completed';
    
    const iconMap = {
        'order_placed': 'fas fa-shopping-cart',
        'picked_up': 'fas fa-box',
        'in_transit': 'fas fa-truck',
        'out_for_delivery': 'fas fa-motorcycle',
        'delivered': 'fas fa-check-circle',
        'failed_delivery': 'fas fa-exclamation-triangle'
    };
    
    const icon = iconMap[event.type] || 'fas fa-circle';
    
    eventDiv.innerHTML = `
        <div class="timeline-marker">
            <i class="${icon}"></i>
        </div>
        <div class="timeline-content">
            <div class="fw-bold">${event.description}</div>
            ${event.location ? `<small class="text-muted">${event.location}</small>` : ''}
            <div class="text-muted small">${event.timestamp}</div>
        </div>
    `;
    
    return eventDiv;
}

function showDefaultTimeline(container) {
    const defaultEvents = [
        { type: 'order_placed', description: 'Order Placed', status: 'completed' },
        { type: 'picked_up', description: 'Package Picked Up', status: 'pending' },
        { type: 'in_transit', description: 'In Transit', status: 'pending' },
        { type: 'out_for_delivery', description: 'Out for Delivery', status: 'pending' },
        { type: 'delivered', description: 'Delivered', status: 'pending' }
    ];
    
    defaultEvents.forEach((event, index) => {
        const eventDiv = document.createElement('div');
        eventDiv.className = `timeline-event ${event.status}`;
        
        eventDiv.innerHTML = `
            <div class="timeline-marker">
                <i class="fas fa-${event.status === 'completed' ? 'check' : 'clock'}"></i>
            </div>
            <div class="timeline-content">
                <div class="fw-bold">${event.description}</div>
            </div>
        `;
        
        container.appendChild(eventDiv);
    });
}

function refreshTimeline() {
    const referenceNumber = document.getElementById('reference_number')?.value;
    if (referenceNumber) {
        loadTimeline(referenceNumber);
    }
}

// Partner Dashboard Functions
function updateOrderStatus(orderId, status) {
    const formData = new FormData();
    formData.append('order_id', orderId);
    formData.append('event_type', status);
    formData.append('description', getStatusDescription(status));
    formData.append('location', 'Current Location');
    
    fetch('/partner/update-delivery-event', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Status updated successfully!', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showNotification('Error updating status: ' + data.error, 'error');
        }
    })
    .catch(error => {
        showNotification('Error updating status: ' + error, 'error');
    });
}

function getStatusDescription(status) {
    const descriptions = {
        'picked_up': 'Package has been picked up from pickup location',
        'in_transit': 'Package is in transit to delivery location',
        'out_for_delivery': 'Package is out for delivery',
        'delivered': 'Package has been delivered successfully',
        'failed_delivery': 'Delivery attempt failed - will retry'
    };
    return descriptions[status] || status.replace('_', ' ').toUpperCase();
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Auto-refresh timeline every 30 seconds
setInterval(() => {
    if (document.getElementById('timelineEvents')) {
        refreshTimeline();
    }
}, 30000);

// Initialize timeline if on tracking page
document.addEventListener('DOMContentLoaded', function() {
    const referenceNumber = document.getElementById('reference_number')?.value;
    if (referenceNumber && document.getElementById('timelineEvents')) {
        loadTimeline(referenceNumber);
    }
});
