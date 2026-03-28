export const getFirestore = jest.fn(() => ({}));
export const doc = jest.fn(() => ({}));
export const getDoc = jest.fn();
export const setDoc = jest.fn(() => Promise.resolve());
export const writeBatch = jest.fn(() => ({
  set: jest.fn(),
  commit: jest.fn(() => Promise.resolve()),
}));
export const collection = jest.fn(() => ({}));
export const query = jest.fn(() => ({}));
export const orderBy = jest.fn(() => ({}));
export const limit = jest.fn(() => ({}));
export const getDocs = jest.fn();
export const serverTimestamp = jest.fn(() => ({ _type: 'serverTimestamp' }));
