// assets/stories.js
// Plain script – attaches story functions to window.
// Uses Firebase globals from firebase.js. No dependency on window.Timestamp.

(function() {
  'use strict';

  /**
   * Upload a new story (text, photo, or audio).
   */
  window.uploadStory = async function(user, type, content) {
    try {
      // Validate globals
      if (!window.storage) throw new Error('window.storage is not defined.');
      if (!window.storageRef) throw new Error('window.storageRef is not defined.');
      if (!window.uploadBytes) throw new Error('window.uploadBytes is not defined.');
      if (!window.getDownloadURL) throw new Error('window.getDownloadURL is not defined.');
      if (!window.db) throw new Error('window.db is not defined.');

      let finalContent = content;

      if (type === 'photo' || type === 'audio') {
        const path = `stories/${user.email}/${Date.now()}_${content.name}`;
        const fileRef = window.storageRef(window.storage, path);
        await window.uploadBytes(fileRef, content);
        finalContent = await window.getDownloadURL(fileRef);
      }

      // expiresAt as a plain Date object – Firestore will convert it.
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const storyData = {
        userId: user.email,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        userAvatar: user.avatar || '',
        type: type,
        content: finalContent,
        timestamp: window.serverTimestamp(), // this is a Firestore sentinel
        expiresAt: expiresAt, // plain Date
        views: [],
        viewCount: 0
      };

      const docRef = await window.addDoc(window.collection(window.db, 'stories'), storyData);
      return docRef.id;
    } catch (err) {
      console.error('[uploadStory] Error:', err);
      // Re-throw so the caller can catch it
      throw err;
    }
  };

  /**
   * Fetch all active stories, grouped by userId, newest first.
   */
  window.fetchActiveStories = async function() {
    try {
      const now = new Date(); // plain Date for comparison
      const q = window.query(
        window.collection(window.db, 'stories'),
        window.where('expiresAt', '>', now),
        window.orderBy('expiresAt', 'asc')
      );
      const snapshot = await window.getDocs(q);
      const stories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Group by userId
      const groups = {};
      stories.forEach(story => {
        const uid = story.userId;
        if (!groups[uid]) groups[uid] = [];
        groups[uid].push(story);
      });

      // Sort each user's stories by timestamp descending (newest first)
      Object.keys(groups).forEach(uid => {
        groups[uid].sort((a, b) => {
          // timestamp is a Firestore Timestamp; convert to milliseconds
          const aTime = a.timestamp && typeof a.timestamp.toMillis === 'function'
            ? a.timestamp.toMillis()
            : 0;
          const bTime = b.timestamp && typeof b.timestamp.toMillis === 'function'
            ? b.timestamp.toMillis()
            : 0;
          return bTime - aTime;
        });
      });

      return groups;
    } catch (err) {
      console.error('[fetchActiveStories] Error:', err);
      return {};
    }
  };

  /**
   * Mark a story as viewed by a specific user.
   */
  window.markStoryViewed = async function(storyId, userEmail) {
    try {
      const storyRef = window.doc(window.db, 'stories', storyId);
      await window.updateDoc(storyRef, {
        views: window.arrayUnion(userEmail),
        viewCount: window.increment(1)
      });
    } catch (err) {
      console.error('[markStoryViewed] Error:', err);
      throw err;
    }
  };

  /**
   * Delete all expired stories (expiresAt < now).
   */
  window.cleanupExpiredStories = async function() {
    try {
      const now = new Date();
      const q = window.query(
        window.collection(window.db, 'stories'),
        window.where('expiresAt', '<', now)
      );
      const snapshot = await window.getDocs(q);
      const deletions = snapshot.docs.map(doc => window.deleteDoc(doc.ref));
      await Promise.all(deletions);
    } catch (err) {
      console.error('[cleanupExpiredStories] Error:', err);
    }
  };

  /**
   * Delete a single story by ID (owner only).
   */
  window.deleteStory = async function(storyId) {
    try {
      await window.deleteDoc(window.doc(window.db, 'stories', storyId));
    } catch (err) {
      console.error('[deleteStory] Error:', err);
      throw err;
    }
  };
})();