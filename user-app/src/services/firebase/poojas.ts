// @ts-nocheck
import { firestoreProvider as firestore } from '../../lib/firebaseProvider';
import { Pooja } from '@devaseva/core/src/types/pooja.types';

export const PoojasService = {
  async getPoojas() {
    const snapshot = await firestore().collection('poojas').where('isDeleted', '==', false).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pooja));
  },

  subscribeToPoojas(callback: (poojas: Pooja[]) => void) {
    return firestore().collection('poojas')
      .onSnapshot((snapshot: any) => {
        if (snapshot) {
          const list = snapshot.docs
            .map((doc: any) => ({ id: doc.id, ...doc.data() } as Pooja))
            .filter((p: Pooja) => p.isDeleted !== true);
          callback(list);
        }
      });
  },

  async getPoojaById(id: string) {
    const doc = await firestore().collection('poojas').doc(id).get();
    return doc.exists ? ({ id: doc.id, ...doc.data() } as Pooja) : null;
  },

  subscribeToPoojaById(id: string, callback: (pooja: Pooja | null) => void) {
    return firestore().collection('poojas').doc(id)
      .onSnapshot((doc: any) => {
        if (doc && doc.exists) {
          callback({ id: doc.id, ...doc.data() } as Pooja);
        } else {
          callback(null);
        }
      });
  },

  async searchPoojas(query: string) {
    const snapshot = await firestore().collection('poojas')
      .where('isDeleted', '==', false)
      .where('name', '>=', query)
      .where('name', '<=', query + '\uf8ff')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pooja));
  },

  async getTemplePoojas(templeId: string) {
    const snapshot = await firestore().collection('poojas')
      .where('isDeleted', '==', false)
      .where('templeId', '==', templeId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pooja));
  }
};
