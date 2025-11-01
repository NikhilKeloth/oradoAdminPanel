// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBtgvtkBj1aruNIL5KJJGIyO911hsZY5Qk",
  authDomain: "oradosaleapp.firebaseapp.com",
  projectId: "oradosaleapp",
  storageBucket: "oradosaleapp.appspot.com",
  messagingSenderId: "908590403140",
  appId: "1:908590403140:web:860a272a880d59c3c0f611"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message: ", payload);
  const { title, body } = payload.notification;

  self.registration.showNotification(title, {
    body,
  });
});
