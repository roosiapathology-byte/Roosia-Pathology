/* ================================================================
   ROOSIA PATHOLOGY — script.js  (Production Ready)
   Single DOMContentLoaded. No duplicates. No broken scopes.
   
   FIX LOG:
   - resetLocationState() moved BELOW all variable declarations
   - Firebase integration uses correct variable names from submit scope
   - All location sections show/hide correctly on radio change
   - Firebase save happens inside .then() with correct scoped variables
================================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ──────────────────────────────────────────────────────────────
     CONSTANTS
  ────────────────────────────────────────────────────────────── */
  var LAB_LAT           = 25.460547;
  var LAB_LNG           = 78.5776043;
  var SERVICE_RADIUS_KM = 5;
  var EMAILJS_SERVICE_ID  = 'roosiapathology';
  var EMAILJS_TEMPLATE_ID = 'template_dc4vb8x';

  /* ──────────────────────────────────────────────────────────────
     1. NAVBAR
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
    cartTotalEl.innerHTML = '<strong>'
      + 'Tests Total: ₹' + testsTotal + '<br>'
      + 'Home Collection Charge: ₹' + homeCharge + '<br>'
      + 'Grand Total: ₹' + (testsTotal + homeCharge)
      + '</strong>';
  }

  cartItemsEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.remove-item');
    if (btn) {
      cart.splice(parseInt(btn.getAttribute('data-index'), 10), 1);
      updateCartUI();
    }
  });

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

  document.querySelectorAll('input[name="collection"]').forEach(function (r) {
    r.addEventListener('change', updateCartUI);
  });

  updateCartUI();

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
     6. LOCATION VARIABLES  ← declared FIRST before any function uses them
  ────────────────────────────────────────────────────────────── */
  var liveBtn    = document.getElementById('get-live-location');
  var latInput   = document.getElementById('latitude');
  var lngInput   = document.getElementById('longitude');
  var liveStatus = document.getElementById('live-location-status');
  var mapStatus  = document.getElementById('map-location-status');

  var selfSection  = document.getElementById('self-location-section');
  var otherSection = document.getElementById('other-location-section');
  var bookingSelf  = document.getElementById('booking-self');
  var bookingOther = document.getElementById('booking-other');

  var bookingMap     = null;
  var bookingMarker  = null;
  var mapInitialised = false;
  var bookingMode    = null;

  /* ──────────────────────────────────────────────────────────────
     HELPER — reset location state (declared after all vars above)
  ────────────────────────────────────────────────────────────── */
  function resetLocationState() {
    if (latInput)   latInput.value   = '';
    if (lngInput)   lngInput.value   = '';
    if (liveStatus) liveStatus.innerHTML = '';
    if (mapStatus)  mapStatus.innerHTML  = '';
    if (liveBtn) {
      liveBtn.innerHTML         = '<i class="fas fa-location-crosshairs"></i> Share Current Location';
      liveBtn.style.background  = '';
      liveBtn.style.color       = '';
      liveBtn.style.borderColor = '';
      liveBtn.disabled          = false;
    }
    if (bookingMarker && bookingMap) {
      bookingMap.removeLayer(bookingMarker);
      bookingMarker = null;
    }
  }

  /* ──────────────────────────────────────────────────────────────
     7. BOOKING-TYPE RADIO — show correct location UI
  ────────────────────────────────────────────────────────────── */
  function onBookingTypeChange() {
    var checked = document.querySelector('input[name="bookingFor"]:checked');
    bookingMode = checked ? checked.value : null;

    resetLocationState();

    if (bookingMode === 'self') {
      selfSection.style.display  = 'block';
      otherSection.style.display = 'none';
    } else if (bookingMode === 'other') {
      selfSection.style.display  = 'none';
      otherSection.style.display = 'block';
      initBookingMap();
    }
  }

  if (bookingSelf)  bookingSelf.addEventListener('change',  onBookingTypeChange);
  if (bookingOther) bookingOther.addEventListener('change', onBookingTypeChange);

  /* ──────────────────────────────────────────────────────────────
     8. MODE A — GPS LIVE LOCATION
  ────────────────────────────────────────────────────────────── */
  if (liveBtn) {
    liveBtn.addEventListener('click', function () {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
      }
      liveBtn.disabled  = true;
      liveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching location…';

      navigator.geolocation.getCurrentPosition(
        function (pos) {
          latInput.value = pos.coords.latitude;
          lngInput.value = pos.coords.longitude;
          liveStatus.innerHTML = statusBox('success',
            '<i class="fas fa-check-circle"></i> Location captured!<br>'
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
            + 'Please allow location permission and try again.');
          liveBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Share Current Location';
          liveBtn.disabled  = false;
        },
        { timeout: 10000 }
      );
    });
  }

  /* ──────────────────────────────────────────────────────────────
     9. MODE B — LEAFLET MAP PICKER
  ────────────────────────────────────────────────────────────── */
  function initBookingMap() {
    if (mapInitialised || typeof L === 'undefined') return;
    mapInitialised = true;

    bookingMap = L.map('booking-map').setView([LAB_LAT, LAB_LNG], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19
    }).addTo(bookingMap);

    L.marker([LAB_LAT, LAB_LNG])
      .addTo(bookingMap)
      .bindPopup('<strong>Roosia Pathology Lab</strong>')
      .openPopup();

    L.circle([LAB_LAT, LAB_LNG], {
      radius: SERVICE_RADIUS_KM * 1000,
      color: '#C8102E', fillColor: '#C8102E',
      fillOpacity: 0.08, weight: 2, dashArray: '6,4'
    }).addTo(bookingMap).bindTooltip('5 km service area');

    bookingMap.on('click', function (e) {
      latInput.value = e.latlng.lat;
      lngInput.value = e.latlng.lng;
      if (bookingMarker) {
        bookingMarker.setLatLng(e.latlng);
      } else {
        bookingMarker = L.marker(e.latlng, { draggable: true }).addTo(bookingMap);
        bookingMarker.on('dragend', function () {
          var pos = bookingMarker.getLatLng();
          latInput.value = pos.lat;
          lngInput.value = pos.lng;
          showMapStatus(pos.lat, pos.lng);
        });
      }
      showMapStatus(e.latlng.lat, e.latlng.lng);
    });

    setTimeout(function () { bookingMap.invalidateSize(); }, 100);
  }

  function showMapStatus(lat, lng) {
    var dist   = getDistanceKm(LAB_LAT, LAB_LNG, lat, lng);
    var inArea = dist <= SERVICE_RADIUS_KM;
    mapStatus.innerHTML = statusBox(
      inArea ? 'success' : 'error',
      '<i class="fas fa-' + (inArea ? 'check-circle' : 'exclamation-circle') + '"></i> '
      + (inArea
        ? 'Within service area — ' + dist.toFixed(2) + ' km from lab ✓'
        : 'Outside service area — ' + dist.toFixed(2) + ' km from lab. We do not serve this area.')
    );
  }

  /* ──────────────────────────────────────────────────────────────
     10. HAVERSINE DISTANCE
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
     11. APPOINTMENT FORM SUBMIT
  ────────────────────────────────────────────────────────────── */
  var appointmentForm = document.getElementById('appointment-form');

  if (appointmentForm) {
    appointmentForm.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Read fields */
      var name      = document.getElementById('pt-name').value.trim();
      var phone     = document.getElementById('pt-phone').value.trim();
      var emailVal  = (document.getElementById('pt-email') || {}).value || '';
      var address   = document.getElementById('pt-address').value.trim();
      var notes     = document.getElementById('pt-notes').value.trim();
      var lat       = latInput.value.trim();
      var lng       = lngInput.value.trim();

      var collection  = (document.querySelector('input[name="collection"]:checked') || {}).value || 'home';
      var date        = (document.querySelector('input[name="date"]')               || {}).value || '';
      var time        = (document.querySelector('select[name="time"]')              || {}).value || '';
      var category    = (document.querySelector('select[name="category"]')          || {}).value || '';
      var payment     = (document.querySelector('input[name="payment"]:checked')    || {}).value || 'cod';

      /* Validate */
      if (!name)    { showToast('Please enter patient name.',    'warning'); document.getElementById('pt-name').focus(); return; }
      if (!phone)   { showToast('Please enter phone number.',    'warning'); document.getElementById('pt-phone').focus(); return; }
      if (!address) { showToast('Please enter patient address.', 'warning'); document.getElementById('pt-address').focus(); return; }
      if (!date)    { showToast('Please select preferred date.', 'warning'); return; }
      if (!time)    { showToast('Please select preferred time.', 'warning'); return; }

      if (!bookingMode) {
        showToast('Please select who this booking is for.', 'warning');
        if (bookingSelf) bookingSelf.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      if (!lat || !lng) {
        if (bookingMode === 'self') {
          showToast('Please share your GPS location first.', 'warning');
          if (liveBtn) liveBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          showToast('Please tap the map to pin the patient\'s location.', 'warning');
          var bmap = document.getElementById('booking-map');
          if (bmap) bmap.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      /* Distance check */
      var customerLat = parseFloat(lat);
      var customerLng = parseFloat(lng);
      var dist = getDistanceKm(LAB_LAT, LAB_LNG, customerLat, customerLng);

      if (dist > SERVICE_RADIUS_KM) {
        alert(
          '❌ Sorry, we are currently not serving in this area.\n\n'
          + 'Distance from lab: ' + dist.toFixed(2) + ' km\n'
          + 'Service radius: ' + SERVICE_RADIUS_KM + ' km\n\n'
          + 'Please call us at +91 8467812558.'
        );
        return;
      }

      /* Build cart summary */
      var homeCharge    = (collection === 'home') ? 50 : 0;
      var testsTotal    = cart.reduce(function (s, i) { return s + i.price; }, 0);
      var grandTotal    = testsTotal + homeCharge;
      var selectedTests = cart.length > 0
        ? cart.map(function (i) { return i.name + ' (₹' + i.price + ')'; }).join(', ')
        : 'No tests from cart — see notes.';
      var mapsLink = 'https://www.google.com/maps?q=' + lat + ',' + lng;
      var paymentLabel  = payment === 'upi' ? 'UPI' : 'Cash on Delivery';
      var collectionLabel = collection === 'home' ? 'Home Collection' : 'Walk-In';

      /* Disable submit button */
      var submitBtn = appointmentForm.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      /* Build booking data object — used by BOTH EmailJS and Firebase */
      var bookingData = {
        patientName    : name,
        phone          : phone,
        email          : emailVal.trim(),
        address        : address,
        bookingFor     : bookingMode === 'self' ? 'For Themselves' : 'For Someone Else',
        selectedTests  : selectedTests,
        testCategory   : category,
        notes          : notes || 'None',
        preferredDate  : date,
        preferredTime  : time,
        collectionType : collectionLabel,
        paymentMethod  : paymentLabel,
        testsTotal     : '₹' + testsTotal,
        homeCharge     : '₹' + homeCharge,
        totalAmount    : '₹' + grandTotal,
        latitude       : customerLat,
        longitude      : customerLng,
        distanceFromLab: dist.toFixed(2) + ' km',
        googleMapsLink : mapsLink,
        bookingStatus  : 'pending'
      };

      /* Step 1 — Send EmailJS owner notification */
      emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          patient_name     : bookingData.patientName,
          patient_phone    : bookingData.phone,
          patient_email    : bookingData.email,
          patient_address  : bookingData.address,
          booking_for      : bookingData.bookingFor,
          selected_tests   : bookingData.selectedTests,
          test_category    : bookingData.testCategory,
          patient_notes    : bookingData.notes,
          preferred_date   : bookingData.preferredDate,
          preferred_time   : bookingData.preferredTime,
          collection_type  : bookingData.collectionType,
          payment_method   : bookingData.paymentMethod,
          tests_total      : bookingData.testsTotal,
          home_charge      : bookingData.homeCharge,
          total_amount     : bookingData.totalAmount,
          latitude         : bookingData.latitude,
          longitude        : bookingData.longitude,
          distance_from_lab: bookingData.distanceFromLab,
          google_maps_link : bookingData.googleMapsLink
        }
      ).then(function () {

        /* Step 2 — Save to Firebase Firestore */
        if (typeof window.saveBookingToFirebase === 'function') {
          window.saveBookingToFirebase(bookingData).then(function (docId) {
            if (docId) {
              console.log('Booking saved to Firebase. ID:', docId);
            } else {
              console.warn('Firebase save returned no ID.');
            }
          }).catch(function (fbErr) {
            console.error('Firebase save error:', fbErr);
          });
        }

        /* Step 3 — Success message */
        alert(
          '✅ Booking request sent successfully!\n\n'
          + 'The lab will call you at ' + phone + ' to confirm.\n\n'
          + 'Thank you for choosing Roosia Pathology!'
        );

        /* Step 4 — Full reset */
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
        alert('❌ Failed to send booking.\n\nPlease call us: +91 8467812558');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Book Appointment'; }
      });
    });
  }

  /* ──────────────────────────────────────────────────────────────
     12. CONTACT MAP
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
     13. TOAST NOTIFICATIONS
  ────────────────────────────────────────────────────────────── */
  function showToast(msg, type) {
    var t = document.createElement('div');
    t.className   = 'toast toast-' + (type || 'success');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('show'); }, 10);
    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { t.remove(); }, 300);
    }, 3000);
  }
  window.showToast = showToast;

  /* ──────────────────────────────────────────────────────────────
     HELPER — coloured status box HTML
  ────────────────────────────────────────────────────────────── */
  function statusBox(type, html) {
    var c = {
      success: { bg: '#f0fdf4', border: '#22c55e', text: '#15803d' },
      error:   { bg: '#fff1f2', border: '#f43f5e', text: '#be123c' },
      info:    { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' }
    }[type] || { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' };
    return '<div style="padding:12px 16px;background:' + c.bg
      + ';border:1px solid ' + c.border
      + ';border-radius:8px;color:' + c.text
      + ';font-size:14px;line-height:1.6;">' + html + '</div>';
  }

}); /* END DOMContentLoaded */
