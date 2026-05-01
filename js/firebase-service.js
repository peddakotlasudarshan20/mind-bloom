/* ============================================
   MindBloom — Firebase Service Layer
   Auth + Firestore CRUD for all app data
   ============================================ */

const FBService = {
  get _auth() { return window.auth; },
  get _db()   { return window.db; },
  uid: () => window.auth?.currentUser?.uid || null,
  userRef: () => window.db.collection('users').doc(FBService.uid()),
  col: (name) => FBService.userRef().collection(name),

  /* -------- AUTH -------- */
  async signUp(email, password, name) {
    const cred = await window.auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: name });
    await FBService.userRef().set({ name, email, createdAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return cred.user;
  },

  async signIn(email, password) {
    return window.auth.signInWithEmailAndPassword(email, password);
  },

  async signInGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const cred = await window.auth.signInWithPopup(provider);
    const name = cred.user.displayName || cred.user.email.split('@')[0];
    await FBService.userRef().set({ name, email: cred.user.email, createdAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return cred.user;
  },

  async signOut() {
    await window.auth.signOut();
  },

  onAuthChange(callback) {
    return window.auth.onAuthStateChanged(callback);
  },

  /* -------- PROFILE -------- */
  async saveProfile(profile) {
    await FBService.userRef().set({ profile, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    MB.store.set('profile', profile); // local cache
  },

  async getProfile() {
    const doc = await FBService.userRef().get();
    return doc.exists ? doc.data().profile : null;
  },

  async markOnboarded() {
    await FBService.userRef().set({ onboarded: true }, { merge: true });
    MB.store.set('onboarded', true);
  },

  async isOnboarded() {
    const doc = await FBService.userRef().get();
    return doc.exists && doc.data().onboarded === true;
  },

  /* -------- MOODS -------- */
  async saveMood(entry) {
    await FBService.col('moods').doc(entry.date).set({
      ...entry, updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    // Update local cache
    const moods = MB.store.get('moods', []);
    const idx = moods.findIndex(m => m.date === entry.date);
    if (idx > -1) moods[idx] = entry; else moods.push(entry);
    MB.store.set('moods', moods);
  },

  async getMoods() {
    const snap = await FBService.col('moods').orderBy('date', 'asc').get();
    const moods = snap.docs.map(d => d.data());
    MB.store.set('moods', moods); // sync to local
    return moods;
  },

  /* -------- JOURNALS -------- */
  async saveJournal(entry) {
    await FBService.col('journals').doc(entry.id).set({
      ...entry, savedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    const journals = MB.store.get('journals', []);
    journals.push(entry);
    MB.store.set('journals', journals);
  },

  async getJournals() {
    const snap = await FBService.col('journals').orderBy('timestamp', 'desc').get();
    const journals = snap.docs.map(d => d.data());
    MB.store.set('journals', journals);
    return journals;
  },

  async deleteJournal(id) {
    await FBService.col('journals').doc(id).delete();
    const journals = MB.store.get('journals', []).filter(j => j.id !== id);
    MB.store.set('journals', journals);
  },

  /* -------- MEDITATION COMPLETIONS -------- */
  async saveMedCompletion(completion) {
    const id = `${completion.id}_${completion.date}`;
    await FBService.col('med_completions').doc(id).set({
      ...completion, savedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    const completions = MB.store.get('med_completions', []);
    if (!completions.find(c => c.id === completion.id && c.date === completion.date)) {
      completions.push(completion);
      MB.store.set('med_completions', completions);
    }
  },

  async getMedCompletions() {
    const snap = await FBService.col('med_completions').get();
    const completions = snap.docs.map(d => d.data());
    MB.store.set('med_completions', completions);
    return completions;
  },

  /* -------- CBT RECORDS -------- */
  async saveCBTRecord(record) {
    await FBService.col('cbt_records').doc(record.id).set({
      ...record, savedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    const records = MB.store.get('cbt_records', []);
    records.push(record);
    MB.store.set('cbt_records', records);
  },

  async getCBTRecords() {
    const snap = await FBService.col('cbt_records').orderBy('timestamp', 'desc').get();
    const records = snap.docs.map(d => d.data());
    MB.store.set('cbt_records', records);
    return records;
  },

  /* -------- DAILY PLAN -------- */
  async savePlan(date, plan) {
    await FBService.userRef().collection('plans').doc(date).set({
      plan, date, savedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    MB.store.set('plan_' + date, plan);
  },

  async getPlan(date) {
    const doc = await FBService.userRef().collection('plans').doc(date).get();
    if (doc.exists) {
      MB.store.set('plan_' + date, doc.data().plan);
      return doc.data().plan;
    }
    return null;
  },

  /* -------- SAFETY PLAN -------- */
  async saveSafetyPlan(plan) {
    await FBService.userRef().set({ safetyPlan: plan }, { merge: true });
    MB.store.set('safety_plan', plan);
  },

  async getSafetyPlan() {
    const doc = await FBService.userRef().get();
    return doc.exists ? doc.data().safetyPlan : null;
  },

  /* -------- COMMUNITY POSTS -------- */
  async submitPost(post) {
    const ref = window.db.collection('community_posts').doc(post.id);
    await ref.set({ ...post, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    const posts = MB.store.get('community_posts', []);
    posts.unshift(post);
    MB.store.set('community_posts', posts);
  },

  async getCommunityPosts(channel = null, limit = 50) {
    let query = window.db.collection('community_posts').orderBy('createdAt', 'desc').limit(limit);
    if (channel && channel !== 'all') query = query.where('channel', '==', channel);
    const snap = await query.get();
    return snap.docs.map(d => ({ ...d.data(), time: FBService.relativeTime(d.data().createdAt?.toDate()) }));
  },

  async reactToPost(postId, reactionId, add) {
    const ref = window.db.collection('community_posts').doc(postId);
    const field = `reactions.${reactionId}`;
    await ref.update({ [field]: firebase.firestore.FieldValue.increment(add ? 1 : -1) });
  },

  /* -------- BUDDY SYSTEM -------- */
  async saveBuddyStatus(status) {
    await FBService.userRef().set({ buddyStatus: status }, { merge: true });
    MB.store.set('buddy_status', status);
  },

  async getBuddyStatus() {
    const doc = await FBService.userRef().get();
    return doc.exists ? doc.data().buddyStatus : null;
  },

  /* -------- HELPERS -------- */
  relativeTime(date) {
    if (!date) return '';
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  },

  /* -------- SYNC: pull all user data from Firestore on login -------- */
  async syncAll() {
    try {
      await Promise.all([
        FBService.getMoods(),
        FBService.getJournals(),
        FBService.getMedCompletions(),
        FBService.getCBTRecords(),
      ]);
      const profile = await FBService.getProfile();
      if (profile) MB.store.set('profile', profile);
      const safetyPlan = await FBService.getSafetyPlan();
      if (safetyPlan) MB.store.set('safety_plan', safetyPlan);
      const buddyStatus = await FBService.getBuddyStatus();
      if (buddyStatus) MB.store.set('buddy_status', buddyStatus);
    } catch (e) {
      console.warn('Sync error (using cached data):', e);
    }
  }
};

window.FBService = FBService;
