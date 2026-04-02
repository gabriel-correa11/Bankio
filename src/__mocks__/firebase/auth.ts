export const getAuth = jest.fn(() => ({}));
export const createUserWithEmailAndPassword = jest.fn();
export const signInWithEmailAndPassword = jest.fn();
export const sendPasswordResetEmail = jest.fn();
export const sendEmailVerification = jest.fn(() => Promise.resolve());
export const updateProfile = jest.fn(() => Promise.resolve());
export const signOut = jest.fn(() => Promise.resolve());
export const onAuthStateChanged = jest.fn();
