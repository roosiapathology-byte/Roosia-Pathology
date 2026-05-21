// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', () => {
  
  // 1. NAVBAR SCROLL EFFECT
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  // 2. MOBILE MENU TOGGLE
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navbar = document.getElementById('navbar');
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      navbar.classList.toggle('nav-open');
      const icon = mobileMenuBtn.querySelector('i');
      if (navbar.classList.contains('nav-open')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  }

  // 3. SMOOTH SCROLL FOR NAV LINKS
  document.querySelectorAll('.nav-links a, .hero-buttons a, .footer-links a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          // Close mobile menu if open
          navbar.classList.remove('nav-open');
          if (mobileMenuBtn) {
            mobileMenuBtn.querySelector('i').classList.remove('fa-times');
            mobileMenuBtn.querySelector('i').classList.add('fa-bars');
          }
          
          // Scroll with offset for navbar
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // 4. CART SYSTEM
  let cart = [];

  // Expose global functions for HTML onclick if needed, though we use event delegation
  window.addToCart = function(name, price) {
    if (cart.find(item => item.name === name)) {
      showToast(name + ' is already in your cart!', 'warning');
      return;
    }
    cart.push({ name, price: parseInt(price) });
    updateCartUI();
    openCart();
    showToast(name + ' added to cart!', 'success');
  };

  window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCartUI();
  };

  function updateCartUI() {
    // Update badge
    document.getElementById('cart-count').textContent = cart.length;
    
    const cartItems = document.getElementById('cart-items');
    
    if (cart.length === 0) {
      cartItems.innerHTML = '<div class="empty-cart-msg">Your cart is empty</div>';
    } else {
      let html = '';
      cart.forEach((item, index) => {
        html += `
          <div class="cart-item">
            <div class="cart-item-info">
              <span class="cart-item-name">${item.name}</span>
              <span class="cart-item-price">₹${item.price}</span>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button>
          </div>
        `;
      });
      cartItems.innerHTML = html;
    }
    
    // Update total
    let total = cart.reduce((sum, item) => sum + item.price, 0);

// HOME COLLECTION CHARGE
const collectionType = document.querySelector('input[name="collection"]:checked')?.value;

let homeCharge = 0;

if (collectionType === "home") {
  homeCharge = 50;
  total += homeCharge;
}
    document.getElementById('cart-total').innerHTML = `
<strong>
Tests Total: ₹${total - homeCharge}<br>
Home Collection Charge: ₹${homeCharge}<br>
Grand Total: ₹${total}
</strong>
`;
  }
  function openCart() { 
    document.getElementById('cart-sidebar').classList.add('open'); 
    document.getElementById('cart-overlay').classList.add('show'); 
  }
  
  function closeCart() { 
    document.getElementById('cart-sidebar').classList.remove('open'); 
    document.getElementById('cart-overlay').classList.remove('show'); 
  }

  // Event Delegation for book buttons
  document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('book-btn')) {
      const name = e.target.getAttribute('data-test');
      const price = e.target.getAttribute('data-price');
      if (name && price) {
        addToCart(name, price);
      }
    }
  });

  // Cart open/close bindings
  document.getElementById('cart-btn').addEventListener('click', openCart);
  document.getElementById('close-cart').addEventListener('click', closeCart);
  document.getElementById('cart-overlay').addEventListener('click', closeCart);
  
  document.getElementById('clear-cart').addEventListener('click', () => {
    cart = [];
    updateCartUI();
    closeCart();
    showToast('Cart cleared', 'success');
  });
  
  document.getElementById('proceed-book').addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Cart is empty. Please add tests first.', 'warning');
      return;
    }
    closeCart();
    document.querySelector('#appointment').scrollIntoView({ behavior: 'smooth' });
    
    // Pre-fill notes with cart items
    const tests = cart.map(i => i.name).join(', ');
    const notesInput = document.querySelector('textarea[name="notes"]');
    notesInput.value = `I want to book the following tests:\n${tests}`;
  });

  // Initialize empty cart
  updateCartUI();

  // 5. VIEW ALL TESTS TOGGLE
  document.querySelectorAll('.view-all-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const card = this.closest('.test-category-card');
      const hidden = card.querySelector('.hidden-tests');
      
      // Get number from button text originally
      const originalText = this.getAttribute('data-original-text') || this.innerHTML;
      if (!this.hasAttribute('data-original-text')) {
        this.setAttribute('data-original-text', originalText);
      }
      
      const isOpen = hidden.style.display === 'block';
      hidden.style.display = isOpen ? 'none' : 'block';
      
      this.innerHTML = isOpen 
        ? originalText
        : 'Show Less <i class="fas fa-chevron-up"></i>';
    });
  });

  // 6. PAYMENT UPI TOGGLE
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const upiSection = document.getElementById('upi-section');
      upiSection.style.display = this.value === 'upi' ? 'block' : 'none';
    });
  });
  // 9. TOAST NOTIFICATION
  window.showToast = function(message, type) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3s
    setTimeout(() => { 
      toast.classList.remove('show'); 
      setTimeout(() => toast.remove(), 300); 
    }, 3000);
  };
});
// STRICT LOCATION BOOKING SYSTEM

document.addEventListener('DOMContentLoaded', () => {

  const bookingOptions = document.querySelectorAll('input[name="bookingFor"]');

  const selfSection = document.getElementById('self-location-section');
  const otherSection = document.getElementById('other-location-section');

  const liveBtn = document.getElementById('get-live-location');

  const latitudeInput = document.getElementById('latitude');
  const longitudeInput = document.getElementById('longitude');
  const locationTypeInput = document.getElementById('locationType');

  const liveStatus = document.getElementById('live-location-status');
  const manualStatus = document.getElementById('manual-location-status');

  let bookingMap = null;
  let bookingMarker = null;

  // BOOKING TYPE
  bookingOptions.forEach(option => {

    option.addEventListener('change', function() {

      latitudeInput.value = '';
      longitudeInput.value = '';
      locationTypeInput.value = '';

      liveStatus.innerHTML = '';
      manualStatus.innerHTML = '';

      if (this.value === 'self') {

        selfSection.style.display = 'block';
        otherSection.style.display = 'none';

      } else {

        selfSection.style.display = 'none';
        otherSection.style.display = 'block';

        initializeBookingMap();

      }

    });

  });

  // LIVE LOCATION
  if (liveBtn) {

    liveBtn.addEventListener('click', () => {

      if (!navigator.geolocation) {

        alert('Geolocation not supported');

        return;
      }

      liveBtn.innerHTML = 'Fetching Live Location...';

      navigator.geolocation.getCurrentPosition(

        (position) => {

          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          latitudeInput.value = lat;
          longitudeInput.value = lng;

          locationTypeInput.value = 'live-location';

          liveStatus.innerHTML = `
            <div class="location-success">
              <i class="fas fa-check-circle"></i>
              Live location shared successfully
            </div>

            <div class="location-coords">
              Latitude: ${lat.toFixed(6)} <br>
              Longitude: ${lng.toFixed(6)}
            </div>
          `;

          liveBtn.innerHTML = `
            <i class="fas fa-check"></i>
            Location Shared
          `;

        },

        () => {

          alert('Please allow location permission.');

          liveBtn.innerHTML = `
            <i class="fas fa-location-crosshairs"></i>
            Share Current Location
          `;

        }

      );

    });

  }

  // MAP
  function initializeBookingMap() {

    if (bookingMap) {

      setTimeout(() => {
        bookingMap.invalidateSize();
      }, 300);

      return;
    }

    bookingMap = L.map('booking-map').setView([25.460547, 78.5776043], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {

      attribution: '© OpenStreetMap contributors'

    }).addTo(bookingMap);

    bookingMap.on('click', function(e) {

      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      latitudeInput.value = lat;
      longitudeInput.value = lng;

      locationTypeInput.value = 'manual-map';

      if (bookingMarker) {

        bookingMap.removeLayer(bookingMarker);

      }

      bookingMarker = L.marker([lat, lng], {

        draggable: true

      }).addTo(bookingMap);

      bookingMarker.on('dragend', function(event) {

        const pos = event.target.getLatLng();

        latitudeInput.value = pos.lat;
        longitudeInput.value = pos.lng;

      });

      manualStatus.innerHTML = `
        <div class="location-success">
          <i class="fas fa-check-circle"></i>
          Patient location pinned successfully
        </div>

        <div class="location-coords">
          Latitude: ${lat.toFixed(6)} <br>
          Longitude: ${lng.toFixed(6)}
        </div>
      `;

    });

  }

  // STRICT VALIDATION
  const appointmentForm = document.getElementById('appointment-form');

  if (appointmentForm) {

    appointmentForm.addEventListener('submit', function(e) {

      e.preventDefault();

      const bookingType = document.querySelector('input[name="bookingFor"]:checked');

      if (!bookingType) {

        alert('Please select booking type.');

        return;
      }

      if (!latitudeInput.value || !longitudeInput.value) {

        if (bookingType.value === 'self') {

          alert('Please share your current live location.');

        } else {

          alert('Please mark patient location on map.');

        }

        return;
      }
// LAB LOCATION
const LAB_LAT = 25.460547;
const LAB_LNG = 78.5776043;
const RADIUS_KM = 5;

// DISTANCE FUNCTION
function getDistanceKm(lat1, lon1, lat2, lon2) {

  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// CHECK DISTANCE
const customerLat = parseFloat(latitudeInput.value);
const customerLng = parseFloat(longitudeInput.value);

const distance = getDistanceKm(
  LAB_LAT,
  LAB_LNG,
  customerLat,
  customerLng
);
if (distance > RADIUS_KM) {

  showToast(
    'Currently we are not serving in this area.',
    'error'
  );

  console.log('Booking Rejected');

  return false;
}
console.log('Distance:', distance);
      

      this.reset();
alert(
`Appointment booked successfully!

Tests Amount: ₹${total - homeCharge}
Home Collection Charge: ₹${homeCharge}
Final Amount: ₹${total}`
);
    });

  }

});
// SHOP CONTACT MAP

document.addEventListener('DOMContentLoaded', function () {

  const shopMap = L.map('shop-map').setView([25.4607882,78.5749081], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(shopMap);

  L.marker([25.4607882,78.5749081])
    .addTo(shopMap)
    .bindPopup('Roosia Pathology')
    .openPopup();

});