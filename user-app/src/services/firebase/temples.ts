// @ts-nocheck
import { firestoreProvider as firestore } from '../../lib/firebaseProvider';
import { Temple } from '@devaseva/core/src/types/temple.types';

export const TemplesService = {
  async getTemples() {
    const snapshot = await firestore().collection('temples').where('isDeleted', '==', false).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Temple));
  },

  subscribeToTemples(callback: (temples: Temple[]) => void) {
    return firestore().collection('temples')
      .onSnapshot((snapshot: any) => {
        if (snapshot) {
          const list = snapshot.docs
            .map((doc: any) => ({ id: doc.id, ...doc.data() } as Temple))
            .filter((t: Temple) => t.isDeleted !== true);
          callback(list);
        }
      });
  },

  async getTempleById(id: string) {
    const doc = await firestore().collection('temples').doc(id).get();
    return doc.exists ? ({ id: doc.id, ...doc.data() } as Temple) : null;
  },

  subscribeToTempleById(id: string, callback: (temple: Temple | null) => void) {
    return firestore().collection('temples').doc(id)
      .onSnapshot((doc: any) => {
        if (doc && doc.exists) {
          callback({ id: doc.id, ...doc.data() } as Temple);
        } else {
          callback(null);
        }
      });
  },

  async searchTemples(query: string) {
    const snapshot = await firestore().collection('temples')
      .where('isDeleted', '==', false)
      .where('name', '>=', query)
      .where('name', '<=', query + '\uf8ff')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Temple));
  },

  async getNearbyTemples(city: string) {
    const snapshot = await firestore().collection('temples')
      .where('isDeleted', '==', false)
      .where('city', '==', city)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Temple));
  }
};
