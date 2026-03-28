import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../../firebaseConfig';
import { defaultProgress } from './progressUtils';

export async function signUp(email: string, password: string, name: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  await sendEmailVerification(credential.user);

  await setDoc(doc(db, 'users', credential.user.uid), {
    uid: credential.user.uid,
    name,
    email,
    createdAt: serverTimestamp(),
  });

  const progress = defaultProgress(credential.user.uid, name);
  await setDoc(doc(db, 'userProgress', credential.user.uid), {
    ...progress,
    updatedAt: serverTimestamp(),
  });

  return credential.user;
}

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function sendPasswordReset(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function signOut() {
  await firebaseSignOut(auth);
}
