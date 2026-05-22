/* ================================================================
   ROOSIA PATHOLOGY — script.js  (Professional Booking Experience)
   Single DOMContentLoaded. Zero duplicates. Full validation.
================================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── CONSTANTS ──────────────────────────────────────────────── */
  var LAB_LAT           = 25.460547;
  var LAB_LNG           = 78.5776043;
  var SERVICE_RADIUS_KM = 5;
  var EMAILJS_SERVICE_ID  = 'roosiapathology';
  var EMAILJS_TEMPLATE_ID = 'template_dc4vb8x';

  /* ── 1. NAVBAR ──────────────────────────────────────────────── */
  var navbar        = document.getElementById('navbar');
  var mobileMenuBtn = document.getElementById('mobile-menu-btn');

  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function () {
      navbar.classList.toggle('nav-open');
      var icon = mobileMenuBtn.querySelector('i');
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    });
  }

  /* ── 2. SMOOTH SCROLL ───────────────────────────────────────── */
  document.querySelectorAll('.nav-links a, .hero-buttons a, .footer-links a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        var target = document.querySelector(href);
        if (target) {
          navbar.classList.remove('nav-open');
          if (mobileMenuBtn) {
            var icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
          }
          window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
        }
      }
    });
  });

  /* ── 3. CART SYSTEM ─────────────────────────────────────────── */
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
      + 'Home Collection: ₹' + homeCharge + '<br>'
      + 'Grand Total: ₹' + (testsTotal + homeCharge)
      + '</strong>';
  }

  cartItemsEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.remove-item');
    if (btn) { cart.splice(parseInt(btn.getAttribute('data-index'), 10), 1); updateCartUI(); }
  });

  window.addToCart = function (name, price) {
    price = parseInt(price, 10);
    if (cart.find(function (i) { return i.name === name; })) {
      showToast(name + ' is already in your cart!', 'warning'); return;
    }
    cart.push({ name: name, price: price });
    updateCartUI(); openCart();
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
      cart = []; updateCartUI(); closeCart(); showToast('Cart cleared', 'success');
    });
  }

  if (proceedBtn) {
    proceedBtn.addEventListener('click', function () {
      if (cart.length === 0) { showToast('Cart is empty. Please add tests first.', 'warning'); return; }
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

  /* ── 4. VIEW-ALL TOGGLE ─────────────────────────────────────── */
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

  /* ── 5. UPI TOGGLE ──────────────────────────────────────────── */
  var upiSection = document.getElementById('upi-section');
  document.querySelectorAll('input[name="payment"]').forEach(function (r) {
    r.addEventListener('change', function () {
      if (upiSection) upiSection.style.display = this.value === 'upi' ? 'block' : 'none';
    });
  });

  /* ── 6. LOCATION VARS — declared first ─────────────────────── */
  var liveBtn    = document.getElementById('get-live-location');
  var latInput   = document.getElementById('latitude');
  var lngInput   = document.getElementById('longitude');
  var liveStatus = document.getElementById('live-location-status');
  var mapStatus  = document.getElementById('map-location-status');
  var selfSection  = document.getElementById('self-location-section');
  var otherSection = document.getElementById('other-location-section');
  var bookingSelf  = document.getElementById('booking-self');
  var bookingOther = document.getElementById('booking-other');

  var bookingMap    = null;
  var bookingMarker = null;
  var mapInited     = false;
  var bookingMode   = null;

  /* ── HELPER: reset location ─────────────────────────────────── */
  function resetLocationState() {
    if (latInput)   latInput.value   = '';
    if (lngInput)   lngInput.value   = '';
    if (liveStatus) liveStatus.innerHTML = '';
    if (mapStatus)  mapStatus.innerHTML  = '';
    if (liveBtn) {
      liveBtn.innerHTML = '<i class="fas fa-location-crosshairs" id="loc-icon"></i><span id="loc-btn-text">Share Current Location</span>';
      liveBtn.className = 'loc-btn';
      liveBtn.disabled  = false;
    }
    if (bookingMarker && bookingMap) {
      bookingMap.removeLayer(bookingMarker);
      bookingMarker = null;
    }
  }

  /* ── 7. BOOKING TYPE RADIO ──────────────────────────────────── */
  function onBookingTypeChange() {
    var checked = document.querySelector('input[name="bookingFor"]:checked');
    bookingMode = checked ? checked.value : null;
    resetLocationState();
    clearErr('err-booking-for');
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

  /* ── 8. GPS LOCATION ────────────────────────────────────────── */
  if (liveBtn) {
    liveBtn.addEventListener('click', function () {
      if (!navigator.geolocation) {
        showStatus(liveStatus, 'error', '<i class="fas fa-exclamation-circle"></i> Geolocation is not supported by your browser.');
        return;
      }
      liveBtn.disabled  = true;
      liveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Detecting location…</span>';

      navigator.geolocation.getCurrentPosition(
        function (pos) {
          latInput.value = pos.coords.latitude;
          lngInput.value = pos.coords.longitude;

          showStatus(liveStatus, 'success',
            '<i class="fas fa-check-circle"></i> <strong>Location captured successfully!</strong><br>'
            + '<small style="opacity:0.8;">Lat: ' + pos.coords.latitude.toFixed(5)
            + ' &nbsp;|&nbsp; Lng: ' + pos.coords.longitude.toFixed(5) + '</small>');

          liveBtn.innerHTML = '<i class="fas fa-check-circle"></i> <span>Location Shared ✓</span>';
          liveBtn.classList.add('loc-btn-success');
          liveBtn.disabled = false;
        },
        function (err) {
          var msg = 'Could not get location. Please allow location permission and try again.';
          if (err.code === 1) msg = 'Location permission denied. Please allow it in your browser settings and try again.';
          if (err.code === 3) msg = 'Location request timed out. Please try again.';
          showStatus(liveStatus, 'error', '<i class="fas fa-exclamation-circle"></i> ' + msg);
          liveBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i> <span>Share Current Location</span>';
          liveBtn.disabled  = false;
        },
        { timeout: 12000, enableHighAccuracy: true }
      );
    });
  }

  /* ── 9. MAP PICKER ──────────────────────────────────────────── */
  function initBookingMap() {
    if (mapInited || typeof L === 'undefined') return;
    mapInited = true;

    bookingMap = L.map('booking-map').setView([LAB_LAT, LAB_LNG], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19
    }).addTo(bookingMap);

    L.marker([LAB_LAT, LAB_LNG], {
      icon: L.divIcon({ className: 'lab-marker', html: '<div style="background:#C8102E;color:#fff;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);">🏥 Roosia Lab</div>', iconAnchor: [50, 10] })
    }).addTo(bookingMap);

    L.circle([LAB_LAT, LAB_LNG], {
      radius: SERVICE_RADIUS_KM * 1000,
      color: '#C8102E', fillColor: '#C8102E',
      fillOpacity: 0.07, weight: 2, dashArray: '8,5'
    }).addTo(bookingMap).bindTooltip('5 km service area', { permanent: false });

    bookingMap.on('click', function (e) {
      latInput.value = e.latlng.lat;
      lngInput.value = e.latlng.lng;
      if (bookingMarker) {
        bookingMarker.setLatLng(e.latlng);
      } else {
        bookingMarker = L.marker(e.latlng, { draggable: true }).addTo(bookingMap);
        bookingMarker.on('dragend', function () {
          var pos = bookingMarker.getLatLng();
          latInput.value = pos.lat; lngInput.value = pos.lng;
          updateMapStatus(pos.lat, pos.lng);
        });
      }
      updateMapStatus(e.latlng.lat, e.latlng.lng);
    });

    setTimeout(function () { bookingMap.invalidateSize(); }, 150);
  }

  function updateMapStatus(lat, lng) {
    var dist   = getDistanceKm(LAB_LAT, LAB_LNG, lat, lng);
    var inArea = dist <= SERVICE_RADIUS_KM;
    showStatus(mapStatus,
      inArea ? 'success' : 'error',
      '<i class="fas fa-' + (inArea ? 'check-circle' : 'times-circle') + '"></i> '
      + (inArea
        ? '<strong>Within service area</strong> — ' + dist.toFixed(2) + ' km from lab ✓'
        : '<strong>Outside service area</strong> — ' + dist.toFixed(2) + ' km from lab. We do not serve this area yet.')
    );
  }

  /* ── 10. HAVERSINE ──────────────────────────────────────────── */
  function getDistanceKm(lat1, lon1, lat2, lon2) {
    var R    = 6371;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a    = Math.sin(dLat/2)*Math.sin(dLat/2)
              + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)
              * Math.sin(dLon/2)*Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  /* ═══════════════════════════════════════════════════════════════
     MULTI-STEP BOOKING FORM
  ═══════════════════════════════════════════════════════════════ */
  var currentStep = 1;

  /* Set min date to today */
  var dateInput = document.getElementById('pt-date');
  if (dateInput) {
    var today = new Date();
    dateInput.min = today.toISOString().split('T')[0];
  }

  /* Time chip selection */
  document.querySelectorAll('.time-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.time-chip').forEach(function (c) { c.classList.remove('selected'); });
      this.classList.add('selected');
      var timeInput = document.getElementById('pt-time');
      if (timeInput) timeInput.value = this.getAttribute('data-time');
      clearErr('err-time');
    });
  });

  /* Phone — only allow digits */
  var phoneInput = document.getElementById('pt-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      var cleaned = this.value.replace(/\D/g, '');
      this.value  = cleaned;
      if (cleaned.length > 0 && cleaned.length < 10) {
        showErr('err-phone', 'Please enter a valid 10-digit mobile number.');
      } else if (cleaned.length === 10) {
        clearErr('err-phone');
        showFieldSuccess(this);
      } else {
        clearErr('err-phone');
      }
    });

    phoneInput.addEventListener('keypress', function (e) {
      if (!/[0-9]/.test(e.key) && !['Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
        showErr('err-phone', '⚠️ Only numbers are allowed in this field.');
      }
    });

    phoneInput.addEventListener('paste', function (e) {
      e.preventDefault();
      var pasted = (e.clipboardData || window.clipboardData).getData('text');
      var digits = pasted.replace(/\D/g, '').slice(0, 10);
      this.value  = digits;
    });
  }

  /* Name — only letters and spaces */
  var nameInput = document.getElementById('pt-name');
  if (nameInput) {
    nameInput.addEventListener('input', function () {
      if (this.value.trim().length > 0) clearErr('err-name');
    });
    nameInput.addEventListener('blur', function () {
      if (!this.value.trim()) {
        showErr('err-name', 'Full name is required.');
      } else if (this.value.trim().length < 2) {
        showErr('err-name', 'Please enter your full name.');
      } else {
        clearErr('err-name'); showFieldSuccess(this);
      }
    });
  }

  /* Address */
  var addrInput = document.getElementById('pt-address');
  if (addrInput) {
    addrInput.addEventListener('input', function () {
      if (this.value.trim().length > 0) clearErr('err-address');
    });
    addrInput.addEventListener('blur', function () {
      if (!this.value.trim()) {
        showErr('err-address', 'Address is required.');
      } else { clearErr('err-address'); showFieldSuccess(this); }
    });
  }

  /* ── STEP NAVIGATION ────────────────────────────────────────── */
  document.querySelectorAll('.bk-next').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = parseInt(this.getAttribute('data-next'), 10);
      if (validateStep(currentStep)) goToStep(next);
    });
  });

  document.querySelectorAll('.bk-back').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var back = parseInt(this.getAttribute('data-back'), 10);
      goToStep(back);
    });
  });

  function goToStep(n) {
    document.getElementById('bk-step-' + currentStep).style.display = 'none';
    document.getElementById('bk-step-' + n).style.display = 'block';

    /* Scroll to top of form */
    var form = document.getElementById('appointment-form');
    if (form) window.scrollTo({ top: form.getBoundingClientRect().top + window.pageYOffset - 100, behavior: 'smooth' });

    /* Update progress bar */
    for (var i = 1; i <= 4; i++) {
      var bpStep = document.getElementById('bp-' + i);
      var bpLine = document.getElementById('bp-line-' + i);
      if (bpStep) {
        bpStep.classList.remove('active', 'done');
        if (i < n)  bpStep.classList.add('done');
        if (i === n) bpStep.classList.add('active');
      }
      if (bpLine) {
        bpLine.classList.toggle('done', i < n);
      }
    }

    /* Build summary on step 4 */
    if (n === 4) buildSummary();

    currentStep = n;
  }

  /* ── STEP VALIDATION ────────────────────────────────────────── */
  function validateStep(step) {
    var ok = true;

    if (step === 1) {
      var name  = document.getElementById('pt-name').value.trim();
      var phone = document.getElementById('pt-phone').value.trim();
      var addr  = document.getElementById('pt-address').value.trim();

      if (!name) { showErr('err-name', 'Full name is required.'); ok = false; }
      else if (name.length < 2) { showErr('err-name', 'Please enter your full name.'); ok = false; }
      else clearErr('err-name');

      if (!phone) {
        showErr('err-phone', 'Phone number is required.'); ok = false;
      } else if (!/^[0-9]{10}$/.test(phone)) {
        showErr('err-phone', 'Please enter a valid 10-digit mobile number (numbers only).'); ok = false;
      } else clearErr('err-phone');

      if (!addr) { showErr('err-address', 'Address is required.'); ok = false; }
      else clearErr('err-address');
    }

    if (step === 2) {
      var cat  = document.getElementById('pt-category').value;
      var date = document.getElementById('pt-date').value;
      var time = document.getElementById('pt-time') ? document.getElementById('pt-time').value : '';

      if (!cat)  { showErr('err-category', 'Please select a test category.'); ok = false; }
      else clearErr('err-category');

      if (!date) { showErr('err-date', 'Please select a preferred date.'); ok = false; }
      else clearErr('err-date');

      if (!time) { showErr('err-time', 'Please select a time slot.'); ok = false; }
      else clearErr('err-time');
    }

    if (step === 3) {
      if (!bookingMode) {
        showErr('err-booking-for', 'Please select who this booking is for.');
        ok = false;
      } else {
        clearErr('err-booking-for');
        var lat = latInput ? latInput.value.trim() : '';
        var lng = lngInput ? lngInput.value.trim() : '';
        if (!lat || !lng) {
          if (bookingMode === 'self') {
            showStatus(liveStatus, 'error', '<i class="fas fa-exclamation-circle"></i> Please share your GPS location first.');
          } else {
            showStatus(mapStatus, 'error', '<i class="fas fa-exclamation-circle"></i> Please tap on the map to pin the patient\'s location.');
          }
          ok = false;
        }
      }
    }

    return ok;
  }

  /* ── BUILD SUMMARY ──────────────────────────────────────────── */
  function buildSummary() {
    var name       = document.getElementById('pt-name').value.trim();
    var phone      = document.getElementById('pt-phone').value.trim();
    var email      = (document.getElementById('pt-email') || {}).value || '';
    var address    = document.getElementById('pt-address').value.trim();
    var category   = document.getElementById('pt-category');
    var catLabel   = category ? category.options[category.selectedIndex].text : '';
    var date       = document.getElementById('pt-date').value;
    var time       = document.getElementById('pt-time') ? document.getElementById('pt-time').value : '';
    var collection = document.querySelector('input[name="collection"]:checked');
    var collLabel  = collection && collection.value === 'home' ? 'Home Collection (+₹50)' : 'Walk-In';
    var homeCharge = collection && collection.value === 'home' ? 50 : 0;
    var testsTotal = cart.reduce(function (s, i) { return s + i.price; }, 0);
    var grandTotal = testsTotal + homeCharge;
    var testsList  = cart.length > 0
      ? cart.map(function (i) { return i.name + ' (₹' + i.price + ')'; }).join(', ')
      : 'No tests added from cart';

    var el = document.getElementById('bk-summary');
    if (!el) return;

    el.innerHTML = ''
      + summaryRow('fas fa-user',           'Patient Name',  name)
      + summaryRow('fas fa-phone',           'Phone',         '+91 ' + phone)
      + (email ? summaryRow('fas fa-envelope', 'Email',       email) : '')
      + summaryRow('fas fa-home',            'Address',       address)
      + summaryRow('fas fa-flask',           'Category',      catLabel)
      + summaryRow('fas fa-calendar',        'Date',          date)
      + summaryRow('fas fa-clock',           'Time',          time)
      + summaryRow('fas fa-truck',           'Collection',    collLabel)
      + summaryRow('fas fa-vials',           'Selected Tests',testsList)
      + summaryRow('fas fa-map-marker-alt',  'Booking For',   bookingMode === 'self' ? 'Myself' : 'Someone Else')
      + '<div class="summary-total">'
      + '<span>Tests Total</span><span>₹' + testsTotal + '</span></div>'
      + '<div class="summary-total">'
      + '<span>Home Collection</span><span>₹' + homeCharge + '</span></div>'
      + '<div class="summary-total summary-grand">'
      + '<span>Grand Total</span><span>₹' + grandTotal + '</span></div>';
  }

  function summaryRow(icon, label, value) {
    return '<div class="summary-row">'
      + '<span class="sr-label"><i class="' + icon + '"></i> ' + label + '</span>'
      + '<span class="sr-value">' + (value || '—') + '</span>'
      + '</div>';
  }

  /* ── 11. FORM SUBMIT ────────────────────────────────────────── */
  var appointmentForm = document.getElementById('appointment-form');

  if (appointmentForm) {
    appointmentForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateStep(3)) { goToStep(3); return; }

      var name      = document.getElementById('pt-name').value.trim();
      var phone     = document.getElementById('pt-phone').value.trim();
      var emailVal  = (document.getElementById('pt-email') || {}).value || '';
      var address   = document.getElementById('pt-address').value.trim();
      var notes     = document.getElementById('pt-notes').value.trim();
      var lat       = latInput.value.trim();
      var lng       = lngInput.value.trim();
      var collection= (document.querySelector('input[name="collection"]:checked') || {}).value || 'home';
      var date      = document.getElementById('pt-date').value;
      var time      = document.getElementById('pt-time') ? document.getElementById('pt-time').value : '';
      var category  = document.getElementById('pt-category').value;
      var payment   = (document.querySelector('input[name="payment"]:checked') || {}).value || 'cod';

      /* Distance check */
      var customerLat = parseFloat(lat);
      var customerLng = parseFloat(lng);
      var dist = getDistanceKm(LAB_LAT, LAB_LNG, customerLat, customerLng);

      if (dist > SERVICE_RADIUS_KM) {
        goToStep(3);
        setTimeout(function () {
          var statusEl = bookingMode === 'self' ? liveStatus : mapStatus;
          showStatus(statusEl, 'error',
            '<i class="fas fa-times-circle"></i> <strong>Outside service area</strong> — '
            + dist.toFixed(2) + ' km from lab. We currently serve within 5 km of Jhansi. '
            + 'Please call <a href="tel:+918467812558" style="color:inherit;font-weight:700;">+91 8467812558</a> for further help.');
        }, 300);
        return;
      }

      /* Cart summary */
      var homeCharge    = (collection === 'home') ? 50 : 0;
      var testsTotal    = cart.reduce(function (s, i) { return s + i.price; }, 0);
      var grandTotal    = testsTotal + homeCharge;
      var selectedTests = cart.length > 0
        ? cart.map(function (i) { return i.name + ' (₹' + i.price + ')'; }).join(', ')
        : 'No tests from cart — see notes.';
      var mapsLink      = 'https://www.google.com/maps?q=' + lat + ',' + lng;

      /* Disable submit */
      var submitBtn = document.getElementById('submit-btn');
      if (submitBtn) {
        submitBtn.disabled   = true;
        submitBtn.innerHTML  = '<i class="fas fa-spinner fa-spin"></i> &nbsp;Sending…';
      }

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
        collectionType : collection === 'home' ? 'Home Collection' : 'Walk-In',
        paymentMethod  : payment === 'upi' ? 'UPI' : 'Cash on Delivery',
        testsTotal     : '₹' + testsTotal,
        homeCharge     : '₹' + homeCharge,
        totalAmount    : '₹' + grandTotal,
        latitude       : customerLat,
        longitude      : customerLng,
        distanceFromLab: dist.toFixed(2) + ' km',
        googleMapsLink : mapsLink,
        bookingStatus  : 'pending'
      };

      /* Send EmailJS */
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
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
      }).then(function () {

        /* Save to Firebase */
        if (typeof window.saveBookingToFirebase === 'function') {
          window.saveBookingToFirebase(bookingData)
            .then(function (id) { if (id) console.log('[Firebase] Saved:', id); })
            .catch(function (e) { console.error('[Firebase]', e); });
        }

        /* Show success screen */
        showSuccessScreen(name, phone);

        /* Reset */
        appointmentForm.reset();
        cart = []; updateCartUI();
        bookingMode = null;
        resetLocationState();
        document.querySelectorAll('.time-chip').forEach(function (c) { c.classList.remove('selected'); });
        if (selfSection)  selfSection.style.display  = 'none';
        if (otherSection) otherSection.style.display = 'none';
        if (upiSection)   upiSection.style.display   = 'none';
        currentStep = 1;
        if (submitBtn) {
          submitBtn.disabled  = false;
          submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> &nbsp;Confirm Booking';
        }

      }).catch(function (err) {
        console.error('EmailJS:', err);
        if (submitBtn) {
          submitBtn.disabled  = false;
          submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> &nbsp;Confirm Booking';
        }
        showToast('Failed to send. Please call +91 8467812558', 'error');
      });
    });
  }

  /* ── SUCCESS SCREEN ─────────────────────────────────────────── */
  function showSuccessScreen(name, phone) {
    var container = document.querySelector('.form-container');
    if (!container) return;

    container.innerHTML = ''
      + '<div class="success-screen">'
      + '<div class="success-icon"><i class="fas fa-check-circle"></i></div>'
      + '<h2>Booking Confirmed!</h2>'
      + '<p>Thank you, <strong>' + name + '</strong>! Your booking request has been sent successfully.</p>'
      + '<div class="success-detail">'
      + '<i class="fas fa-phone"></i> We will call you at <strong>+91 ' + phone + '</strong> to confirm your appointment.'
      + '</div>'
      + '<div class="success-detail">'
      + '<i class="fas fa-clock"></i> Expected confirmation within <strong>30 minutes</strong>.'
      + '</div>'
      + '<a href="#home" class="btn btn-primary" style="margin-top:28px;display:inline-block;">Back to Home</a>'
      + '</div>';

    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ── 12. CONTACT MAP ────────────────────────────────────────── */
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

  /* ── 13. TOAST ──────────────────────────────────────────────── */
  function showToast(msg, type) {
    var t = document.createElement('div');
    t.className   = 'toast toast-' + (type || 'success');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('show'); }, 10);
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 300); }, 3500);
  }
  window.showToast = showToast;

  /* ── HELPERS ────────────────────────────────────────────────── */
  function showErr(id, msg) {
    var el = document.getElementById(id);
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }

  function clearErr(id) {
    var el = document.getElementById(id);
    if (el) { el.textContent = ''; el.style.display = 'none'; }
  }

  function showFieldSuccess(input) {
    input.style.borderColor = '#22c55e';
    input.style.background  = '#f0fdf4';
    setTimeout(function () {
      input.style.borderColor = '';
      input.style.background  = '';
    }, 2000);
  }

  function showStatus(el, type, html) {
    if (!el) return;
    var c = {
      success: { bg: '#f0fdf4', border: '#22c55e', color: '#15803d' },
      error:   { bg: '#fff1f2', border: '#f43f5e', color: '#be123c' },
      info:    { bg: '#eff6ff', border: '#3b82f6', color: '#1d4ed8' }
    }[type] || { bg: '#eff6ff', border: '#3b82f6', color: '#1d4ed8' };

    el.innerHTML = '<div style="padding:14px 16px;background:' + c.bg
      + ';border:1px solid ' + c.border
      + ';border-radius:10px;color:' + c.color
      + ';font-size:14px;line-height:1.6;animation:fadeInUp 0.3s ease both;">'
      + html + '</div>';
  }

  /* ── SCROLL REVEAL ──────────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll(
      '.stat-card, .service-card, .test-category-card, .package-card, ' +
      '.doctor-card, .gallery-item, .contact-item, .about-grid, .section-header'
    ).forEach(function (el) {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  }

  /* Cart badge bounce */
  var lastCount = 0;
  new MutationObserver(function () {
    var n = parseInt(cartCountEl.textContent, 10) || 0;
    if (n > lastCount) {
      cartCountEl.classList.remove('bounce');
      void cartCountEl.offsetWidth;
      cartCountEl.classList.add('bounce');
      setTimeout(function () { cartCountEl.classList.remove('bounce'); }, 400);
    }
    lastCount = n;
  }).observe(cartCountEl, { childList: true, characterData: true, subtree: true });

}); /* END DOMContentLoaded */
