// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyCtRN3QMnHxLQEKAAn0y3q8qRvjDs8BKJA",
    authDomain: "restaurant-orders-new.firebaseapp.com",
    projectId: "restaurant-orders-new",
    storageBucket: "restaurant-orders-new.appspot.com",
    messagingSenderId: "500015809437",
    appId: "1:500015809437:web:49d6b18dbea33114d06574",
    measurementId: "G-79XGTK3L3F"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
