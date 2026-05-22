/* ================================================================
   ROOSIA PATHOLOGY — firebase.js
   Firebase Firestore integration using CDN compat SDK (v8 style).
   No ES modules — works directly in plain HTML <script> tags.
   
   Loaded AFTER the Firebase compat scripts in index.html.
   Exposes:
     window.saveBookingToFirebase(bookingData) → Promise<docId|null>
     window.updateBookingStatus(docId, status) → Promise<boolean>
================================================================ */

(function () {

  /* ── Firebase Config ─────────────────────────────────────── */
  var firebaseConfig = {
    apiKey           : "AIzaSyDj80lLjEhDg6kyQfw-iIHe1fUhN9fVn-o",
    authDomain       : "roosia-pathology.firebaseapp.com",
    projectId        : "roosia-pathology",
    storageBucket    : "roosia-pathology.firebasestorage.app",
    messagingSenderId: "314581074001",
    appId            : "1:314581074001:web:6e1ffc72aa15211d04f870"
  };

  /* ── Initialize (guard against double-init) ─────────────── */
  var app;
  try {
    app = firebase.app(); /* returns existing app if already initialised */
  } catch (e) {
    app = firebase.initializeApp(firebaseConfig);
  }

  var db = firebase.firestore();

  /* ──────────────────────────────────────────────────────────
     Save a new booking to Firestore
     Returns the new document ID on success, null on failure.
  ────────────────────────────────────────────────────────── */
  window.saveBookingToFirebase = function (bookingData) {
    return db.collection('bookings').add({
      patientName    : bookingData.patientName    || '',
      phone          : bookingData.phone          || '',
      email          : bookingData.email          || '',
      address        : bookingData.address        || '',
      bookingFor     : bookingData.bookingFor     || '',
      selectedTests  : bookingData.selectedTests  || '',
      testCategory   : bookingData.testCategory   || '',
      notes          : bookingData.notes          || '',
      preferredDate  : bookingData.preferredDate  || '',
      preferredTime  : bookingData.preferredTime  || '',
      collectionType : bookingData.collectionType || '',
      paymentMethod  : bookingData.paymentMethod  || '',
      testsTotal     : bookingData.testsTotal     || '₹0',
      homeCharge     : bookingData.homeCharge     || '₹0',
      totalAmount    : bookingData.totalAmount    || '₹0',
      latitude       : bookingData.latitude       || 0,
      longitude      : bookingData.longitude      || 0,
      distanceFromLab: bookingData.distanceFromLab|| '',
      googleMapsLink : bookingData.googleMapsLink || '',
      bookingStatus  : 'pending',
      createdAt      : firebase.firestore.FieldValue.serverTimestamp()
    }).then(function (docRef) {
      console.log('[Firebase] Booking saved. ID:', docRef.id);
      return docRef.id;
    }).catch(function (err) {
      console.error('[Firebase] Save error:', err);
      return null;
    });
  };

  /* ──────────────────────────────────────────────────────────
     Update booking status (used by admin dashboard)
     status: 'approved' | 'rejected'
  ────────────────────────────────────────────────────────── */
  window.updateBookingStatus = function (docId, status) {
    return db.collection('bookings').doc(docId).update({
      bookingStatus: status,
      updatedAt    : firebase.firestore.FieldValue.serverTimestamp()
    }).then(function () {
      console.log('[Firebase] Status updated:', docId, '->', status);
      return true;
    }).catch(function (err) {
      console.error('[Firebase] Update error:', err);
      return false;
    });
  };

  /* ──────────────────────────────────────────────────────────
     Listen to all bookings in real time (used by admin)
     callback(bookings[]) is called on every change
  ────────────────────────────────────────────────────────── */
  window.listenToBookings = function (callback) {
    return db.collection('bookings')
      .orderBy('createdAt', 'desc')
      .onSnapshot(function (snapshot) {
        var bookings = [];
        snapshot.forEach(function (doc) {
          bookings.push(Object.assign({ id: doc.id }, doc.data()));
        });
        callback(bookings);
      }, function (err) {
        console.error('[Firebase] Listener error:', err);
      });
  };

  console.log('[Firebase] firebase.js loaded and ready.');

})();
