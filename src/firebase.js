import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCm2ELXjq3iojiqABhHXG7pBLya8J7NiJE",
  authDomain: "book-trail-16c2d.firebaseapp.com",
  projectId: "book-trail-16c2d",
  storageBucket: "book-trail-16c2d.firebasestorage.app",
  messagingSenderId: "162219628487",
  appId: "1:162219628487:web:005494cbc5deaf2fd5abe2"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
