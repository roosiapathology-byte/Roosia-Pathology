/* ================================================================
   ROOSIA PATHOLOGY — script.js
   Complete, production-ready. Single DOMContentLoaded. No duplicates.
   ================================================================

   ARCHITECTURE:
   1.  Navbar scroll + mobile menu
   2.  Smooth scroll
   3.  Cart system (add / remove / totals / sidebar)
   4.  View-all toggle on test cards
   5.  UPI payment section toggle
   6.  Booking-type radio (self / other) — shows correct location UI
   7.  Mode A: GPS live location capture
   8.  Mode B: Leaflet map picker
   9.  Haversine distance checker (5 km radius)
   10. Appointment form submit + EmailJS owner notification
   11. Toast notifications
   12. Contact map (Leaflet, lab pin)
================================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ──────────────────────────────────────────────────────────────
     CONSTANTS
  ────────────────────────────────────────────────────────────── */
  var LAB_LAT           = 25.460547;
  var LAB_LNG           = 78.5776043;
  var SERVICE_RADIUS_KM = 5;

  /* EmailJS — already initialised in index.html inline script */
  var EMAILJS_SERVICE_ID  = 'roosiapathology';
  var EMAILJS_TEMPLATE_ID = 'template_dc4vb8x';   /* owner notification */

  /* ──────────────────────────────────────────────────────────────
     1. NAVBAR — scroll effect + mobile toggle
  ────────────────────────────────────────────────────────────── */
  var navbar        = document.getElementById('navbar');
  var mobileMenuBtn = document.getElementById('mobile-menu-btn');

  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function () {
      navbar.classList.toggle('nav-open');
      var icon = mobileMenuBtn.querySelector('i');
      if (navbar.classList.contains('nav-open')) {
        icon.classList.replace('fa-bars', 'fa-times');
      } else {
        icon.classList.replace('fa-times', 'fa-bars');
      }
    });
  }

  /* ──────────────────────────────────────────────────────────────
     2. SMOOTH SCROLL
  ────────────────────────────────────────────────────────────── */
  document.querySelectorAll('.nav-links a, .hero-buttons a, .footer-links a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        var target = document.querySelector(href);
        if (target) {
          navbar.classList.remove('nav-open');
          if (mobileMenuBtn) {
            mobileMenuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
          }
          window.scrollTo({
            top: target.getBoundingClientRect().top + window.pageYOffset - 80,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  /* ──────────────────────────────────────────────────────────────
     3. CART SYSTEM
  ────────────────────────────────────────────────────────────── */
  var cart = [];

  var cartSidebar  = document.getElementById('cart-sidebar');
  var cartOverlay  = document.getElementById('cart-overlay');
  var cartCountEl  = document.getElementById('cart-count');
  var cartItemsEl  = document.getElementById('cart-items');
  var cartTotalEl  = document.getElementById('cart-total');
  var cartBtn      = document.getElementById('cart-btn');
  var closeCartBtn = document.getElementById('close-cart');
  var clearCartBtn = document.getElementById('clear-cart');
  var proceedBtn   = document.getElementById('proceed-book');

  function openCart()  { cartSidebar.classList.add('open');    cartOverlay.classList.add('show'); }
  function closeCart() { cartSidebar.classList.remove('open'); cartOverlay.classList.remove('show'); }

  function getHomeCharge() {
    var r = document.querySelector('input[name="collection"]:checked');
    return (r && r.value === 'home') ? 50 : 0;
  }

  function updateCartUI() {
    cartCountEl.textContent = cart.length;

    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<div class="empty-cart-msg">Your cart is empty</div>';
    } else {
      cartItemsEl.innerHTML = cart.map(function (item, i) {
        return '<div class="cart-item">'
          + '<div class="cart-item-info">'
          + '<span class="cart-item-name">' + item.name + '</span>'
          + '<span class="cart-item-price">₹' + item.price + '</span>'
          + '</div>'
          + '<button class="remove-item" data-index="' + i + '"><i class="fas fa-trash"></i></button>'
          + '</div>';
      }).join('');
    }

    var testsTotal = cart.reduce(function (s, i) { return s + i.price; }, 0);
    var homeCharge = getHomeCharge();
    var grandTotal = testsTotal + homeCharge;

    cartTotalEl.innerHTML = '<strong>'
      + 'Tests Total: ₹' + testsTotal + '<br>'
      + 'Home Collection Charge: ₹' + homeCharge + '<br>'
      + 'Grand Total: ₹' + grandTotal
      + '</strong>';
  }

  /* Remove via delegation */
  cartItemsEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.remove-item');
    if (btn) {
      cart.splice(parseInt(btn.getAttribute('data-index'), 10), 1);
      updateCartUI();
    }
  });

  /* Add to cart — exposed globally for any inline usage */
  window.addToCart = function (name, price) {
    price = parseInt(price, 10);
    if (cart.find(function (i) { return i.name === name; })) {
      showToast(name + ' is already in your cart!', 'warning');
      return;
    }
    cart.push({ name: name, price: price });
    updateCartUI();
    openCart();
    showToast(name + ' added to cart!', 'success');
  };

  /* Event delegation for ALL .book-btn on the page */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.book-btn');
    if (btn) {
      var n = btn.getAttribute('data-test');
      var p = btn.getAttribute('data-price');
      if (n && p) window.addToCart(n, p);
    }
  });

  if (cartBtn)      cartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay)  cartOverlay.addEventListener('click', closeCart);

  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', function () {
      cart = [];
      updateCartUI();
      closeCart();
      showToast('Cart cleared', 'success');
    });
  }

  if (proceedBtn) {
    proceedBtn.addEventListener('click', function () {
      if (cart.length === 0) {
        showToast('Cart is empty. Please add tests first.', 'warning');
        return;
      }
      closeCart();
      var sec = document.getElementById('appointment');
      if (sec) window.scrollTo({ top: sec.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
      var notesEl = document.getElementById('pt-notes');
      if (notesEl) {
        notesEl.value = 'Tests from cart:\n'
          + cart.map(function (i) { return '- ' + i.name + ' (₹' + i.price + ')'; }).join('\n');
      }
    });
  }

  /* Re-compute total when collection type changes */
  document.querySelectorAll('input[name="collection"]').forEach(function (r) {
    r.addEventListener('change', updateCartUI);
  });

  updateCartUI(); /* initial render */

  /* ──────────────────────────────────────────────────────────────
     4. VIEW-ALL TOGGLE
  ────────────────────────────────────────────────────────────── */
  document.querySelectorAll('.view-all-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card   = this.closest('.test-category-card');
      var hidden = card && card.querySelector('.hidden-tests');
      if (!hidden) return;
      if (!this.hasAttribute('data-orig')) this.setAttribute('data-orig', this.innerHTML);
      var isOpen = hidden.style.display === 'block';
      hidden.style.display = isOpen ? 'none' : 'block';
      this.innerHTML = isOpen ? this.getAttribute('data-orig') : 'Show Less <i class="fas fa-chevron-up"></i>';
    });
  });

  /* ──────────────────────────────────────────────────────────────
     5. UPI SECTION TOGGLE
  ────────────────────────────────────────────────────────────── */
  var upiSection = document.getElementById('upi-section');
  document.querySelectorAll('input[name="payment"]').forEach(function (r) {
    r.addEventListener('change', function () {
      if (upiSection) upiSection.style.display = this.value === 'upi' ? 'block' : 'none';
    });
  });

  /* ──────────────────────────────────────────────────────────────
     6. BOOKING-TYPE RADIO — show correct location UI
  ────────────────────────────────────────────────────────────── */
  var selfSection  = document.getElementById('self-location-section');
  var otherSection = document.getElementById('other-location-section');
  var bookingSelf  = document.getElementById('booking-self');
  var bookingOther = document.getElementById('booking-other');

  var bookingMode = null; /* 'self' | 'other' — null until chosen */

  function onBookingTypeChange() {
    bookingMode = document.querySelector('input[name="bookingFor"]:checked') &&
                  document.querySelector('input[name="bookingFor"]:checked').value;

    /* Reset coords whenever mode switches */
    resetLocationState();

    if (bookingMode === 'self') {
      selfSection.style.display  = 'block';
      otherSection.style.display = 'none';
    } else if (bookingMode === 'other') {
      selfSection.style.display  = 'none';
      otherSection.style.display = 'block';
      initBookingMap(); /* lazy-init the Leaflet map */
    }
  }

  if (bookingSelf)  bookingSelf.addEventListener('change',  onBookingTypeChange);
  if (bookingOther) bookingOther.addEventListener('change', onBookingTypeChange);

  /* ──────────────────────────────────────────────────────────────
     7. MODE A — GPS LIVE LOCATION
  ────────────────────────────────────────────────────────────── */
  var liveBtn    = document.getElementById('get-live-location');
  var latInput   = document.getElementById('latitude');
  var lngInput   = document.getElementById('longitude');
  var liveStatus = document.getElementById('live-location-status');

  if (liveBtn) {
    liveBtn.addEventListener('click', function () {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser. Please use a modern browser.');
        return;
      }
      liveBtn.disabled   = true;
      liveBtn.innerHTML  = '<i class="fas fa-spinner fa-spin"></i> Fetching location…';

      navigator.geolocation.getCurrentPosition(
        function (pos) {
          latInput.value = pos.coords.latitude;
          lngInput.value = pos.coords.longitude;

          liveStatus.innerHTML = statusBox('success',
            '<i class="fas fa-check-circle"></i> Location captured successfully!<br>'
            + '<small>Lat: ' + pos.coords.latitude.toFixed(6)
            + ' | Lng: ' + pos.coords.longitude.toFixed(6) + '</small>');

          liveBtn.innerHTML         = '<i class="fas fa-check-circle"></i> Location Shared';
          liveBtn.style.background  = '#22c55e';
          liveBtn.style.color       = '#fff';
          liveBtn.style.borderColor = '#22c55e';
          liveBtn.disabled          = false;
        },
        function () {
          liveStatus.innerHTML = statusBox('error',
            '<i class="fas fa-exclamation-circle"></i> Could not get location. '
            + 'Please allow location permission in your browser and try again.');
          liveBtn.innerHTML  = '<i class="fas fa-location-crosshairs"></i> Share Current Location';
          liveBtn.disabled   = false;
        },
        { timeout: 10000 }
      );
    });
  }

  /* ──────────────────────────────────────────────────────────────
     8. MODE B — LEAFLET MAP PICKER (Booking For Someone Else)
  ────────────────────────────────────────────────────────────── */
  var bookingMap     = null; /* Leaflet map instance */
  var bookingMarker  = null; /* draggable pin */
  var mapInitialised = false;
  var mapStatus      = document.getElementById('map-location-status');

  function initBookingMap() {
    if (mapInitialised || typeof L === 'undefined') return;
    mapInitialised = true;

    bookingMap = L.map('booking-map').setView([LAB_LAT, LAB_LNG], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(bookingMap);

    /* Lab marker */
    L.marker([LAB_LAT, LAB_LNG], {
      icon: L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconSize: [25, 41], iconAnchor: [12, 41]
      })
    }).addTo(bookingMap).bindPopup('<strong>Roosia Pathology Lab</strong>').openPopup();

    /* Service area circle */
    L.circle([LAB_LAT, LAB_LNG], {
      radius: SERVICE_RADIUS_KM * 1000,
      color: '#C8102E', fillColor: '#C8102E', fillOpacity: 0.08, weight: 2, dashArray: '6,4'
    }).addTo(bookingMap).bindTooltip('5 km service area');

    /* Click to pin */
    bookingMap.on('click', function (e) {
      var lat = e.latlng.lat;
      var lng = e.latlng.lng;

      latInput.value = lat;
      lngInput.value = lng;

      if (bookingMarker) {
        bookingMarker.setLatLng(e.latlng);
      } else {
        bookingMarker = L.marker(e.latlng, { draggable: true }).addTo(bookingMap);
        bookingMarker.on('dragend', function () {
          var pos = bookingMarker.getLatLng();
          latInput.value = pos.lat;
          lngInput.value = pos.lng;
          updateMapStatus(pos.lat, pos.lng);
        });
      }
      updateMapStatus(lat, lng);
    });

    /* Force Leaflet to render correctly (container was hidden) */
    setTimeout(function () { bookingMap.invalidateSize(); }, 100);
  }

  function updateMapStatus(lat, lng) {
    var dist = getDistanceKm(LAB_LAT, LAB_LNG, lat, lng);
    var inArea = dist <= SERVICE_RADIUS_KM;
    mapStatus.innerHTML = statusBox(
      inArea ? 'success' : 'error',
      '<i class="fas fa-' + (inArea ? 'check-circle' : 'exclamation-circle') + '"></i> '
      + (inArea
        ? 'Location is within service area (' + dist.toFixed(2) + ' km from lab). ✓'
        : 'Location is outside service area (' + dist.toFixed(2) + ' km from lab). We do not serve this area yet.')
    );
  }

  /* ──────────────────────────────────────────────────────────────
     HELPER — reset location state when mode switches
  ────────────────────────────────────────────────────────────── */
  function resetLocationState() {
    if (latInput)  latInput.value  = '';
    if (lngInput)  lngInput.value  = '';
    if (liveStatus) liveStatus.innerHTML = '';
    if (mapStatus)  mapStatus.innerHTML  = '';

    /* Reset live button */
    if (liveBtn) {
      liveBtn.innerHTML         = '<i class="fas fa-location-crosshairs"></i> Share Current Location';
      liveBtn.style.background  = '';
      liveBtn.style.color       = '';
      liveBtn.style.borderColor = '';
      liveBtn.disabled          = false;
    }

    /* Reset map marker */
    if (bookingMarker && bookingMap) {
      bookingMap.removeLayer(bookingMarker);
      bookingMarker = null;
    }
  }

  /* ──────────────────────────────────────────────────────────────
     9. HAVERSINE DISTANCE
  ────────────────────────────────────────────────────────────── */
  function getDistanceKm(lat1, lon1, lat2, lon2) {
    var R    = 6371;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a    = Math.sin(dLat / 2) * Math.sin(dLat / 2)
              + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
              * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /* ──────────────────────────────────────────────────────────────
     10. APPOINTMENT FORM SUBMIT
  ────────────────────────────────────────────────────────────── */
  var appointmentForm = document.getElementById('appointment-form');

  if (appointmentForm) {
    appointmentForm.addEventListener('submit', function (e) {
      e.preventDefault();

      /* — Read all fields — */
      var name     = document.getElementById('pt-name').value.trim();
      var phone    = document.getElementById('pt-phone').value.trim();
      var email    = (document.getElementById('pt-email') || {}).value || '';
      var address  = document.getElementById('pt-address').value.trim();
      var notes    = document.getElementById('pt-notes').value.trim();
      var lat      = latInput.value.trim();
      var lng      = lngInput.value.trim();

      var collection = (document.querySelector('input[name="collection"]:checked') || {}).value || 'home';
      var date       = (document.querySelector('input[name="date"]')               || {}).value || '';
      var time       = (document.querySelector('select[name="time"]')              || {}).value || '';
      var category   = (document.querySelector('select[name="category"]')          || {}).value || '';
      var payment    = (document.querySelector('input[name="payment"]:checked')    || {}).value || 'cod';

      /* — Validate basic fields — */
      if (!name)    { showToast('Please enter patient name.',    'warning'); document.getElementById('pt-name').focus(); return; }
      if (!phone)   { showToast('Please enter phone number.',    'warning'); document.getElementById('pt-phone').focus(); return; }
      if (!address) { showToast('Please enter patient address.', 'warning'); document.getElementById('pt-address').focus(); return; }
      if (!date)    { showToast('Please select preferred date.', 'warning'); return; }
      if (!time)    { showToast('Please select preferred time.', 'warning'); return; }

      /* — Booking type must be selected — */
      if (!bookingMode) {
        showToast('Please select who this booking is for.', 'warning');
        document.getElementById('booking-self').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      /* — Location must be captured — */
      if (!lat || !lng) {
        if (bookingMode === 'self') {
          showToast('Please share your GPS location first.', 'warning');
          liveBtn && liveBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          showToast('Please tap on the map to pin the patient\'s location first.', 'warning');
          document.getElementById('booking-map').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      /* — 5 km radius check — */
      var dist = getDistanceKm(LAB_LAT, LAB_LNG, parseFloat(lat), parseFloat(lng));
      if (dist > SERVICE_RADIUS_KM) {
        alert(
          '❌ Sorry, we are currently not serving in this area.\n\n'
          + 'Distance from our lab: ' + dist.toFixed(2) + ' km\n'
          + 'Service area: ' + SERVICE_RADIUS_KM + ' km\n\n'
          + 'Please contact us directly at +91 8467812558.'
        );
        return;
      }

      /* — Cart summary — */
      var homeCharge  = collection === 'home' ? 50 : 0;
      var testsTotal  = cart.reduce(function (s, i) { return s + i.price; }, 0);
      var grandTotal  = testsTotal + homeCharge;
      var selectedTests = cart.length > 0
        ? cart.map(function (i) { return i.name + ' (₹' + i.price + ')'; }).join(', ')
        : 'No tests selected from cart — see notes.';

      var mapsLink = 'https://www.google.com/maps?q=' + lat + ',' + lng;

      /* — Disable submit — */
      var submitBtn = appointmentForm.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      /* — Send owner notification via EmailJS — */
      emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          /* Patient info */
          patient_name     : name,
          patient_phone    : phone,
          patient_email    : email.trim(),
          patient_address  : address,
          patient_notes    : notes || 'None',
          /* Booking details */
          booking_for      : bookingMode === 'self' ? 'Booking For Themselves' : 'Booking For Someone Else',
          selected_tests   : selectedTests,
          test_category    : category,
          preferred_date   : date,
          preferred_time   : time,
          collection_type  : collection === 'home' ? 'Home Collection' : 'Walk-In',
          payment_method   : payment === 'upi' ? 'UPI' : 'Cash on Delivery',
          /* Financials */
          tests_total      : '₹' + testsTotal,
          home_charge      : '₹' + homeCharge,
          total_amount     : '₹' + grandTotal,
          /* Location */
          latitude         : lat,
          longitude        : lng,
          distance_from_lab: dist.toFixed(2) + ' km',
          google_maps_link : mapsLink
        }
      ).then(function () {

        /* SUCCESS */
        alert(
          '✅ Booking request sent successfully!\n\n'
          + 'The lab team will review your request and call you at ' + phone + ' to confirm your appointment.\n\n'
          + 'Thank you for choosing Roosia Pathology!'
        );

        /* Full reset */
        appointmentForm.reset();
        cart = [];
        updateCartUI();
        bookingMode = null;
        resetLocationState();
        if (selfSection)  selfSection.style.display  = 'none';
        if (otherSection) otherSection.style.display = 'none';
        if (upiSection)   upiSection.style.display   = 'none';
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Book Appointment'; }

      }).catch(function (err) {

        console.error('EmailJS error:', err);
        alert(
          '❌ Failed to send booking request.\n\n'
          + 'Please call us directly:\n+91 8467812558\n\nWe apologise for the inconvenience.'
        );
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Book Appointment'; }

      });
    });
  }

  /* ──────────────────────────────────────────────────────────────
     11. TOAST NOTIFICATIONS
  ────────────────────────────────────────────────────────────── */
  function showToast(msg, type) {
    var t = document.createElement('div');
    t.className   = 'toast toast-' + (type || 'success');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('show'); }, 10);
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 300); }, 3000);
  }
  window.showToast = showToast;

  /* ──────────────────────────────────────────────────────────────
     12. CONTACT MAP — lab location display
  ────────────────────────────────────────────────────────────── */
  if (document.getElementById('shop-map') && typeof L !== 'undefined') {
    var shopMap = L.map('shop-map').setView([LAB_LAT, LAB_LNG], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(shopMap);
    L.marker([LAB_LAT, LAB_LNG])
      .addTo(shopMap)
      .bindPopup('<strong>Roosia Pathology</strong><br>45, Taksal, Kotwali Ke Samne wali Dhal, Jhansi')
      .openPopup();
  }

  /* ──────────────────────────────────────────────────────────────
     HELPER — coloured status box
  ────────────────────────────────────────────────────────────── */
  function statusBox(type, html) {
    var colors = {
      success: { bg: '#f0fdf4', border: '#22c55e', text: '#15803d' },
      error:   { bg: '#fff1f2', border: '#f43f5e', text: '#be123c' },
      info:    { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' }
    };
    var c = colors[type] || colors.info;
    return '<div style="padding:12px 16px;background:' + c.bg + ';border:1px solid ' + c.border
      + ';border-radius:8px;color:' + c.text + ';font-size:14px;line-height:1.5;">'
      + html + '</div>';
  }

}); /* END DOMContentLoaded */
