import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { db, auth, secondaryAuth } from '../../lib/firebase';
import { AppUser } from '../../contexts/AuthContext';

export const FirebaseUsersService = {
  /**
   * Subscribe to all PRO users
   */
  subscribeToProUsers(callback: (users: AppUser[]) => void) {
    const q = query(collection(db, 'users'), where('role', '==', 'PRO'));
    return onSnapshot(q, (snapshot) => {
      const users: AppUser[] = [];
      snapshot.forEach(doc => {
        users.push(doc.data() as AppUser);
      });
      callback(users);
    });
  },

  /**
   * Get all active PRO users
   */
  async getPros() {
    const q = query(collection(db, 'users'), where('role', '==', 'PRO'), where('isActive', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as AppUser);
  },

  /**
   * Create a new PRO user and bidirectionally sync the temple assignment
   */
  async createProUser(data: { name: string; email: string; phone: string; templeId: string; password?: string }, adminUid: string) {
    if (!data.password) throw new Error("Password is required to create a PRO user.");
    
    let uid;
    try {
      // Create using secondary auth to avoid signing out the Admin
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, data.email, data.password);
      uid = userCredential.user.uid;
      
      // Sign out of secondary auth immediately
      await signOut(secondaryAuth);
    } catch (e: any) {
      throw new Error("Auth user creation failed: " + e.message);
    }

    // Create Firestore document
    const userDoc: AppUser = {
      uid,
      name: data.name,
      email: data.email,
      role: 'PRO',
      templeId: data.templeId,
      isActive: true,
      // Storing phone for UI purposes
      ...({ phone: data.phone } as any)
    };

    const now = new Date().toISOString();

    try {
      const batch = writeBatch(db);

      // 1. Create user doc
      batch.set(doc(db, 'users', uid), {
        ...userDoc,
        createdAt: now,
        updatedAt: now,
        createdBy: adminUid,
        updatedBy: adminUid,
        isDeleted: false
      });

      // 2. Bidirectional: update the assigned temple's proManager fields
      if (data.templeId) {
        batch.update(doc(db, 'temples', data.templeId), {
          proManagerId: uid,
          proManagerName: data.name,
          updatedAt: now,
          updatedBy: adminUid
        });
      }

      await batch.commit();
    } catch (e: any) {
      throw new Error("Firestore document creation failed: " + e.message);
    }

    return uid;
  },

  /**
   * Toggle active status
   */
  async toggleActiveStatus(uid: string, currentStatus: boolean) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      isActive: !currentStatus
    });
  },

  /**
   * Reset Password Email
   */
  async triggerPasswordReset(email: string) {
    await sendPasswordResetEmail(auth, email);
  },
  
  /**
   * Update PRO User details with bidirectional temple sync.
   * If templeId changes: clears old temple's proManagerId and sets it on the new temple.
   */
  async updateProUser(uid: string, data: { name: string; phone: string; templeId: string }, adminUid: string) {
    const now = new Date().toISOString();
    const userRef = doc(db, 'users', uid);
    const batch = writeBatch(db);

    // Get current user doc to detect templeId change
    const currentSnap = await getDoc(userRef);
    const currentData = currentSnap.exists() ? currentSnap.data() : null;
    const oldTempleId = currentData?.templeId;

    // 1. Update user doc
    batch.update(userRef, {
      name: data.name,
      phone: data.phone,
      templeId: data.templeId,
      updatedAt: now,
      updatedBy: adminUid
    });

    // 2. Bidirectional sync: clear old temple if reassigning
    if (oldTempleId && oldTempleId !== data.templeId) {
      batch.update(doc(db, 'temples', oldTempleId), {
        proManagerId: '',
        proManagerName: 'Unassigned',
        updatedAt: now,
        updatedBy: adminUid
      });
    }

    // 3. Set new temple's proManagerId
    if (data.templeId) {
      batch.update(doc(db, 'temples', data.templeId), {
        proManagerId: uid,
        proManagerName: data.name,
        updatedAt: now,
        updatedBy: adminUid
      });
    }

    await batch.commit();
  }
};
