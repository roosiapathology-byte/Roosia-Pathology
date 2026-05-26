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
      if (cart.length < 1) {
  showToast('Choosing at least 1 test is necessary to book a home visit.', 'warning');
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

    /* ── 5b. COLLECTION TYPE — walkin/home toggle ─────────────── */
  function applyCollectionType() {
    var val = (document.querySelector('input[name="collection"]:checked') || {}).value || 'home';
    var timeGroup = document.getElementById('time-slot-group');
    if (val === 'walkin') {
      if (timeGroup) timeGroup.style.display = 'none';
      var ptTime = document.getElementById('pt-time');
      if (ptTime) ptTime.value = '';
      document.querySelectorAll('.time-chip').forEach(function (c) { c.classList.remove('selected'); });
      clearErr('err-time');
    } else {
      if (timeGroup) timeGroup.style.display = 'block';
    }
    updateCartUI();
  }
  document.querySelectorAll('input[name="collection"]').forEach(function (r) {
    r.addEventListener('change', applyCollectionType);
  });

  /* ── 5. UPI TOGGLE ──────────────────────────────────────────── */
  var upiSection = document.getElementById('upi-section');
  document.querySelectorAll('input[name="payment"]').forEach(function (r) {
    r.addEventListener('change', function () {
      if (upiSection) upiSection.style.display = this.value === 'upi' ? 'block' : 'none';
    });
  });

  /* ── 6. LOCATION SYSTEM ─────────────────────────────────────── */
  var latInput      = document.getElementById('latitude');
  var lngInput      = document.getElementById('longitude');
  var bookingSelf   = document.getElementById('booking-self');
  var bookingOther  = document.getElementById('booking-other');
  var locationSec   = document.getElementById('location-section');
  var bookingMap    = null;
  var bookingMarker = null;
  var mapInited     = false;
  var bookingMode   = null;
  var locNextBtn    = document.getElementById('loc-next-btn');
  var addrInput     = document.getElementById('pt-address');
  var findAddrBtn   = document.getElementById('find-address-btn');
  var addrStatus    = document.getElementById('address-search-status');
  var mapStatus     = document.getElementById('map-location-status');
  var bookingMapDiv = document.getElementById('booking-map');

  /* Lock/unlock Next button */
  function setLocNext(on) {
    if (!locNextBtn) return;
    locNextBtn.disabled      = !on;
    locNextBtn.style.opacity = on ? '1' : '0.5';
    locNextBtn.style.cursor  = on ? 'pointer' : 'not-allowed';
  }
  setLocNext(false);

  /* Haversine */
  function getDistanceKm(lat1, lon1, lat2, lon2) {
    var R    = 6371;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a    = Math.sin(dLat/2)*Math.sin(dLat/2)
              + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)
              * Math.sin(dLon/2)*Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  /* Update map status + coords */
  function onLocationSet(lat, lng) {
    var dist   = getDistanceKm(LAB_LAT, LAB_LNG, lat, lng);
    var inArea = dist <= SERVICE_RADIUS_KM;
    if (inArea) { latInput.value = lat; lngInput.value = lng; }
    else         { latInput.value = ''; lngInput.value = ''; }
    showStatus(mapStatus, inArea ? 'success' : 'error',
      '<i class="fas fa-' + (inArea ? 'check-circle' : 'times-circle') + '"></i> '
      + (inArea
        ? '<strong>✅ Service available in your area</strong> — ' + dist.toFixed(2) + ' km from lab. You can drag the pin for exact location.'
        : '<strong>❌ Outside service area</strong> — ' + dist.toFixed(2) + ' km from lab. We serve within 5 km of Jhansi only.')
    );
    setLocNext(inArea);
  }

  /* Init map */
  function initMap() {
    if (mapInited || typeof L === 'undefined') return;
    mapInited = true;
    bookingMap = L.map('booking-map').setView([LAB_LAT, LAB_LNG], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19
    }).addTo(bookingMap);
    /* Lab marker */
    L.marker([LAB_LAT, LAB_LNG], {
      icon: L.divIcon({
        className: '',
        html: '<div style="background:#C8102E;color:#fff;padding:5px 10px;border-radius:8px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.3);">🏥 Roosia Lab</div>',
        iconAnchor: [45, 10]
      })
    }).addTo(bookingMap);
    /* 5 km service circle */
    L.circle([LAB_LAT, LAB_LNG], {
      radius: SERVICE_RADIUS_KM * 1000,
      color: '#C8102E', fillColor: '#C8102E',
      fillOpacity: 0.07, weight: 2, dashArray: '8,5'
    }).addTo(bookingMap).bindTooltip('5 km service area');
    setTimeout(function () { bookingMap.invalidateSize(); }, 200);
  }

  /* Place / move draggable pin */
  function placePin(lat, lng) {
    if (!bookingMap) return;
    if (bookingMarker) {
      bookingMarker.setLatLng([lat, lng]);
    } else {
      bookingMarker = L.marker([lat, lng], { draggable: true }).addTo(bookingMap);
      bookingMarker.on('dragend', function () {
        var p = bookingMarker.getLatLng();
        onLocationSet(p.lat, p.lng);
      });
    }
    bookingMap.setView([lat, lng], 16);
    onLocationSet(lat, lng);
  }

  /* Nominatim geocode */
  function geocodeAndPin(query) {
    if (!query || query.length < 3) {
      showStatus(addrStatus, 'error', 'Please enter a more detailed address.');
      return;
    }
    findAddrBtn.disabled  = true;
    findAddrBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Searching…</span>';
    addrStatus.innerHTML  = '';

    var url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q='
      + encodeURIComponent(query + ', Jhansi, Uttar Pradesh, India');

    fetch(url, { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        findAddrBtn.disabled  = false;
        findAddrBtn.innerHTML = '<i class="fas fa-search"></i> <span>Find on Map</span>';

        if (!data || data.length === 0) {
          showStatus(addrStatus, 'error',
            '<i class="fas fa-exclamation-circle"></i> Address not found. Try adding nearby landmark or area name.');
          return;
        }

        var lat = parseFloat(data[0].lat);
        var lng = parseFloat(data[0].lon);

        /* Show map */
        bookingMapDiv.style.display = 'block';
        if (!mapInited) initMap();
        setTimeout(function () {
          bookingMap.invalidateSize();
          placePin(lat, lng);
        }, 100);

        showStatus(addrStatus, 'success',
          '<i class="fas fa-check-circle"></i> Location found on map. <strong>Drag the pin</strong> to set the exact spot.');
      })
      .catch(function () {
        findAddrBtn.disabled  = false;
        findAddrBtn.innerHTML = '<i class="fas fa-search"></i> <span>Find on Map</span>';
        showStatus(addrStatus, 'error',
          '<i class="fas fa-exclamation-circle"></i> Could not connect. Check internet and try again.');
      });
  }

  /* Booking type radio — show location section for BOTH */
  function onBookingTypeChange() {
    var checked = document.querySelector('input[name="bookingFor"]:checked');
    bookingMode = checked ? checked.value : null;
    clearErr('err-booking-for');

    /* Reset */
    latInput.value = ''; lngInput.value = '';
    if (addrInput)  addrInput.value  = '';
    if (addrStatus) addrStatus.innerHTML = '';
    if (mapStatus)  mapStatus.innerHTML  = '';
    if (bookingMapDiv) bookingMapDiv.style.display = 'none';
    if (bookingMarker && bookingMap) { bookingMap.removeLayer(bookingMarker); bookingMarker = null; }
    setLocNext(false);

    if (bookingMode === 'self') {
      locationSec.style.display = 'block';
      document.querySelector('#loc-info-text strong').textContent = 'Enter your collection address';
      document.querySelector('#loc-info-text p').textContent = 'Type your address. The map will find it. Drag the pin to mark the exact location.';
    } else if (bookingMode === 'other') {
      locationSec.style.display = 'block';
      document.querySelector('#loc-info-text strong').textContent = "Enter patient's address";
      document.querySelector('#loc-info-text p').textContent = "Type the patient's address. The map will find it. Drag the pin to mark the exact location.";
    } else {
      locationSec.style.display = 'none';
    }
  }

  if (bookingSelf)  bookingSelf.addEventListener('change',  onBookingTypeChange);
  if (bookingOther) bookingOther.addEventListener('change', onBookingTypeChange);

  /* Find address button */
  if (findAddrBtn) {
    findAddrBtn.addEventListener('click', function () {
      geocodeAndPin(addrInput ? addrInput.value.trim() : '');
    });
  }

  /* Enter key on address input */
  if (addrInput) {
    addrInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); geocodeAndPin(this.value.trim()); }
    });
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
      if (!validateStep(currentStep)) return;
      /* If walk-in and going to step 3, skip to step 4 */
      if (next === 3) {
        var collVal = (document.querySelector('input[name="collection"]:checked') || {}).value || 'home';
        if (collVal === 'walkin') { next = 4; }
      }
      goToStep(next);
    });
  });

  document.querySelectorAll('.bk-back').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var back = parseInt(this.getAttribute('data-back'), 10);
      /* If walk-in and going back to step 3, skip to step 2 instead */
      if (back === 3) {
        var collVal = (document.querySelector('input[name="collection"]:checked') || {}).value || 'home';
        if (collVal === 'walkin') { back = 2; }
      }
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

      if (!name || name.length < 2) { showErr('err-name', 'Full name is required.'); ok = false; }
      else clearErr('err-name');

      if (!phone || !/^[0-9]{10}$/.test(phone)) {
        showErr('err-phone', 'Valid 10-digit phone number required.'); ok = false;
      } else clearErr('err-phone');
    }

    if (step === 2) {
      var date = document.getElementById('pt-date').value;
      var collVal = (document.querySelector('input[name="collection"]:checked') || {}).value || 'home';
      var time = document.getElementById('pt-time') ? document.getElementById('pt-time').value : '';

      if (!date) { showErr('err-date', 'Please select a preferred date.'); ok = false; }
      else clearErr('err-date');

      /* Time slot only required for home collection */
      if (collVal !== 'walkin') {
        if (!time) { showErr('err-time', 'Please select a time slot.'); ok = false; }
        else clearErr('err-time');
      } else {
        clearErr('err-time');
      }
    }

    if (step === 3) {
      var collVal3 = (document.querySelector('input[name="collection"]:checked') || {}).value || 'home';
      if (collVal3 === 'walkin') {
        /* Walk-in skips step 3 entirely — always valid */
      } else {
        if (!bookingMode) {
          showErr('err-booking-for', 'Please select who this booking is for.');
          ok = false;
        } else {
          clearErr('err-booking-for');
          var lat = latInput ? latInput.value.trim() : '';
          var lng = lngInput ? lngInput.value.trim() : '';
          if (!lat || !lng) {
            showStatus(mapStatus, 'error', '<i class="fas fa-exclamation-circle"></i> Please enter your address and find it on the map first.');
            ok = false;
          }
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
    var address    = document.getElementById('pt-address') ? document.getElementById('pt-address').value.trim() : '';
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
      + summaryRow('fas fa-user',          'Patient Name', name)
      + summaryRow('fas fa-phone',          'Phone',        '+91 ' + phone)
      + (email.trim() ? summaryRow('fas fa-envelope', 'Email', email.trim()) : '')
      + summaryRow('fas fa-home',           'Address',      address || '—')
      + summaryRow('fas fa-calendar',       'Date',         date)
      + summaryRow('fas fa-clock',          'Time',         time)
      + summaryRow('fas fa-truck',          'Collection',   collLabel)
      + summaryRow('fas fa-vials',          'Tests',        testsList)
      + summaryRow('fas fa-map-marker-alt', 'Booking For',  bookingMode === 'self' ? 'Myself' : 'Someone Else')
      + '<div class="summary-total"><span>Tests Total</span><span>₹' + testsTotal + '</span></div>'
      + '<div class="summary-total"><span>Home Collection</span><span>₹' + homeCharge + '</span></div>'
      + '<div class="summary-total summary-grand"><span>Grand Total</span><span>₹' + grandTotal + '</span></div>';
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
      if (cart.length < 1) {
  showToast('Choosing at least 1 test is necessary to book a home visit.', 'warning');
  return;
}
      if (!validateStep(3)) { goToStep(3); return; }

      var name      = document.getElementById('pt-name').value.trim();
      var phone     = document.getElementById('pt-phone').value.trim();
      var emailVal  = (document.getElementById('pt-email') || {}).value || '';
      var address   = document.getElementById('pt-address') ? document.getElementById('pt-address').value.trim() : '';
      var notes     = document.getElementById('pt-notes').value.trim();
      var lat       = latInput.value.trim();
      var lng       = lngInput.value.trim();
      var collection= (document.querySelector('input[name="collection"]:checked') || {}).value || 'home';
      var date      = document.getElementById('pt-date').value;
      var time      = document.getElementById('pt-time') ? document.getElementById('pt-time').value : '';
      var category  = '';
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
/* HERO SLIDER */

const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots = document.querySelectorAll('.hero-dot');

let currentHeroSlide = 0;

function showHeroSlide(index){

  heroSlides.forEach(slide=>{
    slide.classList.remove('active');
  });

  heroDots.forEach(dot=>{
    dot.classList.remove('active');
  });

  heroSlides[index].classList.add('active');
  heroDots[index].classList.add('active');

}

function nextHeroSlide(){

  currentHeroSlide++;

  if(currentHeroSlide >= heroSlides.length){
    currentHeroSlide = 0;
  }

  showHeroSlide(currentHeroSlide);

}

function prevHeroSlide(){

  currentHeroSlide--;

  if(currentHeroSlide < 0){
    currentHeroSlide = heroSlides.length - 1;
  }

  showHeroSlide(currentHeroSlide);

}

document.querySelector('.next-slide')
.addEventListener('click',nextHeroSlide);

document.querySelector('.prev-slide')
.addEventListener('click',prevHeroSlide);

heroDots.forEach((dot,index)=>{
  dot.addEventListener('click',()=>{
    currentHeroSlide = index;
    showHeroSlide(index);
  });
});

setInterval(nextHeroSlide,5000);
