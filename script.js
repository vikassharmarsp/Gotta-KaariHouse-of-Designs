// Dummy data initial state
const initialData = [
    {
        id: 1,
        name: "Emerald Evening Gown",
        price: 350.00,
        category: "Dresses",
        description: "Elegant floor-length gown featuring fine silk and exquisite detailing for sophisticated events.",
        image: "assets/emerald_gown.png",
        images: ["assets/emerald_gown.png", "assets/emerald_gown_2.png", "assets/emerald_gown_3.png"]
    },
    {
        id: 2,
        name: "Midnight Tailored Suit",
        price: 499.50,
        category: "Suits",
        description: "Precision-cut slim fit suit in deep navy. Made for the modern professional.",
        image: "assets/navy_suit.png",
        images: ["assets/navy_suit.png", "assets/navy_suit_2.png"]
    },
    {
        id: 3,
        name: "Classic Leather Tote",
        price: 185.00,
        category: "Accessories",
        description: "Minimalist full-grain leather tote bag with ample space and premium hardware.",
        image: "assets/leather_tote.png",
        images: ["assets/leather_tote.png"]
    },
    {
        id: 4,
        name: "Linen Summer Shirt",
        price: 85.00,
        category: "Casual",
        description: "Breathable pure linen shirt, perfect for warm weather and effortless styling.",
        image: "assets/linen_shirt.png",
        images: ["assets/linen_shirt.png"]
    }
];

// App State
let clothingItems = [...initialData];
let currentFilter = "All";
let currentSort = "default";

// DOM Elements
const gridContainer = document.getElementById('clothing-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('price-sort');
const navHome = document.getElementById('btn-home');
const navUpload = document.getElementById('btn-upload');
const viewHome = document.getElementById('view-home');
const viewUpload = document.getElementById('view-upload');
const uploadForm = document.getElementById('upload-form');
const imageInput = document.getElementById('item-image');
const imagePreview = document.getElementById('image-preview');

// Modal Elements
const itemModal = document.getElementById('item-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalMainImage = document.getElementById('modal-main-image');
const modalThumbnails = document.getElementById('modal-thumbnails');

// Theme Selector dropdown
const themeSelector = document.getElementById('theme-selector');

// Initialization
function init() {
    setupThemeToggle();
    setupColorTheme();
    renderGrid(clothingItems);
    setupEventListeners();
    setupImageUploadPreview();
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    // Check saved preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        updateThemeIcon(themeToggle, true);
    }
    
    themeToggle.addEventListener('click', () => {
        const currentlyDark = document.body.classList.contains('dark-mode');
        if (currentlyDark) {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'false');
            updateThemeIcon(themeToggle, false);
        } else {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'true');
            updateThemeIcon(themeToggle, true);
        }
    });
}

function updateThemeIcon(btn, isDark) {
    if (isDark) {
        btn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        btn.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

function setupColorTheme() {
    // Check saved color theme
    const savedColor = localStorage.getItem('colorTheme') || 'gold';
    applyColorTheme(savedColor);

    if (themeSelector) {
        themeSelector.addEventListener('change', (e) => {
            const selectedColor = e.target.value;
            applyColorTheme(selectedColor);
            localStorage.setItem('colorTheme', selectedColor);
        });
    }
}

function applyColorTheme(colorName) {
    // Set the data attribute for CSS mapping
    document.documentElement.setAttribute('data-theme', colorName);
    
    // Update the dropdown value to match
    if (themeSelector) {
        themeSelector.value = colorName;
    }
}

// Render the grid based on data
function renderGrid(items) {
    gridContainer.innerHTML = '';
    
    if (items.length === 0) {
        gridContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No items found matching your criteria.</p>';
        return;
    }

    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'clothing-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="card-img-wrapper">
                <span class="category-badge">${item.category}</span>
                <img src="${item.image}" alt="${item.name}" loading="lazy">
            </div>
            <div class="card-content">
                <h3 class="card-title">${item.name}</h3>
                <div class="card-price">$${Number(item.price).toFixed(2)}</div>
                <p class="card-desc">${item.description}</p>
            </div>
        `;
        
        // Add click listener to open modal
        card.addEventListener('click', () => openModal(item));
        
        gridContainer.appendChild(card);
    });
}

// Apply filters and sorting
function applyFilters() {
    let filtered = [...clothingItems];

    // Filter by category
    if (currentFilter !== 'All') {
        filtered = filtered.filter(item => item.category === currentFilter);
    }

    // Sort by price
    if (currentSort === 'low') {
        filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'high') {
        filtered = filtered.sort((a, b) => b.price - a.price);
    } else {
        // Default sort (by ID descending to show newest first)
        filtered = filtered.sort((a, b) => b.id - a.id);
    }

    renderGrid(filtered);
}

// Set up all event listeners
function setupEventListeners() {
    // Nav Navigation
    navHome.addEventListener('click', () => switchView('home'));
    navUpload.addEventListener('click', () => switchView('upload'));

    // Filtering
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Apply filter
            currentFilter = e.target.dataset.category;
            applyFilters();
        });
    });

    // Sorting
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        applyFilters();
    });

    // Form submission
    uploadForm.addEventListener('submit', handleFormSubmit);

    // Modal Close logic
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === itemModal) {
            closeModal();
        }
    });
}

// Switch between views (SPA logic)
function switchView(viewName) {
    if (viewName === 'home') {
        navUpload.classList.remove('active');
        navHome.classList.add('active');
        
        viewUpload.classList.remove('section-active');
        setTimeout(() => {
            viewUpload.classList.add('section-hidden');
            viewHome.classList.remove('section-hidden');
            // Slight delay to allow display block to apply before opacity transition
            setTimeout(() => viewHome.classList.add('section-active'), 50);
        }, 400); // match CSS transition duration
        
    } else if (viewName === 'upload') {
        navHome.classList.remove('active');
        navUpload.classList.add('active');
        
        viewHome.classList.remove('section-active');
        setTimeout(() => {
            viewHome.classList.add('section-hidden');
            viewUpload.classList.remove('section-hidden');
            setTimeout(() => viewUpload.classList.add('section-active'), 50);
        }, 400);
    }
}

// Modal Logic
function openModal(item) {
    // Determine images array
    const itemImages = item.images && item.images.length > 0 ? item.images : [item.image];
    
    // Set Main Image
    modalMainImage.src = itemImages[0];
    
    // Clear and build thumbnails
    modalThumbnails.innerHTML = '';
    
    if (itemImages.length > 1) {
        itemImages.forEach((imgSrc, idx) => {
            const thumb = document.createElement('img');
            thumb.src = imgSrc;
            thumb.classList.add('thumb-img');
            if (idx === 0) thumb.classList.add('active');
            
            thumb.addEventListener('click', () => {
                // Remove active from all
                document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                modalMainImage.src = imgSrc;
            });
            
            modalThumbnails.appendChild(thumb);
        });
    }

    // Show Modal
    itemModal.style.display = 'flex';
    // Small delay to allow CSS opacity transition
    setTimeout(() => {
        itemModal.classList.add('show');
    }, 10);
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    itemModal.classList.remove('show');
    setTimeout(() => {
        itemModal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

// Image preview logic for the file input
let currentImageBase64 = null;

function setupImageUploadPreview() {
    const label = document.querySelector('.image-upload-label');
    
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                currentImageBase64 = e.target.result;
                imagePreview.style.backgroundImage = `url(${currentImageBase64})`;
                imagePreview.style.display = 'block';
                label.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });
}

// Handle adding a new item
function handleFormSubmit(e) {
    e.preventDefault();

    if (!currentImageBase64) {
        showToast("Please upload an image for the design.");
        return;
    }

    const name = document.getElementById('item-name').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const category = document.getElementById('item-category').value;
    const description = document.getElementById('item-desc').value;

    const newItem = {
        id: Date.now(), // Generate a unique ID based on timestamp
        name,
        price,
        category,
        description,
        image: currentImageBase64,
        images: [currentImageBase64] // Default support for multiple going forward
    };

    // Add to state
    clothingItems.push(newItem);

    // Show success
    showToast(`${name} added to collection!`);

    // Reset form
    uploadForm.reset();
    currentImageBase64 = null;
    imagePreview.style.display = 'none';
    document.querySelector('.image-upload-label').style.display = 'flex';

    // Switch view back to home
    switchView('home');
    
    // Reset filters to default state to ensure the new item is visible
    currentFilter = 'All';
    currentSort = 'default';
    
    // Update UI for filters
    filterBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-category="All"]').classList.add('active');
    sortSelect.value = 'default';
    
    // Apply filters and re-render grid
    applyFilters();
}

// Create and show toast notification
function showToast(message) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400); // Wait for transition
    }, 3000);
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
