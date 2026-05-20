import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, writeBatch, getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  PROFILES, BOOKS, TRAIL_NOTES, WRITING_TEMPLATES, BADGES_CONFIG, CATEGORIES
} from '../data/sampleData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [books, setBooks] = useState([]);
  const [trailNotes, setTrailNotes] = useState([]);
  const [writingTemplates, setWritingTemplates] = useState([]);
  const [categories] = useState(CATEGORIES);
  const [showCelebration, setShowCelebration] = useState(null);
  const [currentPage, setCurrentPage] = useState('welcome');
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [editingTrailNoteId, setEditingTrailNoteId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribers = [];

    const setup = async () => {
      // Seed Firestore with sample data if empty (first time only)
      const profileSnap = await getDocs(collection(db, 'profiles'));
      if (profileSnap.empty) {
        const batch = writeBatch(db);
        PROFILES.forEach(p => batch.set(doc(db, 'profiles', p.id), p));
        BOOKS.forEach(b => batch.set(doc(db, 'books', b.id), b));
        TRAIL_NOTES.forEach(n => batch.set(doc(db, 'trailNotes', n.id), n));
        WRITING_TEMPLATES.forEach(t => batch.set(doc(db, 'writingTemplates', t.id), t));
        await batch.commit();
      }

      // Real-time listeners — all family members see each other's updates instantly
      unsubscribers.push(
        onSnapshot(collection(db, 'profiles'), snap => {
          setProfiles(snap.docs.map(d => ({ ...d.data(), id: d.id })));
        }),
        onSnapshot(collection(db, 'books'), snap => {
          setBooks(snap.docs.map(d => ({ ...d.data(), id: d.id })));
        }),
        onSnapshot(collection(db, 'trailNotes'), snap => {
          setTrailNotes(snap.docs.map(d => ({ ...d.data(), id: d.id })));
        }),
        onSnapshot(collection(db, 'writingTemplates'), snap => {
          setWritingTemplates(snap.docs.map(d => ({ ...d.data(), id: d.id })));
          setLoading(false);
        }),
      );
    };

    setup().catch(err => {
      console.error('Firebase setup error:', err);
      setLoading(false);
    });

    return () => unsubscribers.forEach(u => u());
  }, []);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  const getBooksByReader = useCallback((readerId) =>
    books.filter(b => b.readerId === readerId), [books]);

  const getTrailNotesByBook = useCallback((bookId) =>
    trailNotes.filter(n => n.bookId === bookId).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [trailNotes]);

  const getTrailNotesByReader = useCallback((readerId) =>
    trailNotes.filter(n => n.readerId === readerId).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [trailNotes]);

  const getAllVocabularyByReader = useCallback((readerId) => {
    const notes = trailNotes.filter(n => n.readerId === readerId);
    return notes.flatMap(note =>
      (note.vocabularyWords || []).map(w => ({
        ...w,
        trailNoteId: note.id,
        bookId: note.bookId,
        date: note.date,
      }))
    );
  }, [trailNotes]);

  const getReaderStats = useCallback((readerId) => {
    const readerBooks = books.filter(b => b.readerId === readerId);
    const readerNotes = trailNotes.filter(n => n.readerId === readerId);
    const booksFinished = readerBooks.filter(b => b.status === 'finished').length;
    const booksStarted = readerBooks.filter(b => b.status === 'started').length;
    const totalPagesRead = readerNotes.reduce((sum, n) => sum + (n.totalPagesRead || 0), 0);
    const vocabularyWords = readerNotes.flatMap(n => n.vocabularyWords || []).length;
    const categoriesSet = new Set(readerBooks.filter(b => b.status === 'finished').map(b => b.category));
    const siblingRecs = readerNotes.filter(n => n.recommendToSibling).length;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const pagesThisWeek = readerNotes
      .filter(n => new Date(n.date) >= startOfWeek)
      .reduce((sum, n) => sum + (n.totalPagesRead || 0), 0);
    const pagesThisMonth = readerNotes
      .filter(n => new Date(n.date) >= startOfMonth)
      .reduce((sum, n) => sum + (n.totalPagesRead || 0), 0);

    return {
      booksFinished, booksStarted,
      totalBooks: readerBooks.length,
      totalPagesRead, pagesThisWeek, pagesThisMonth,
      trailNotes: readerNotes.length,
      vocabularyWords,
      categoriesRead: categoriesSet.size,
      siblingRecommendations: siblingRecs,
    };
  }, [books, trailNotes]);

  const computeBadges = useCallback((readerId) => {
    const stats = getReaderStats(readerId);
    return BADGES_CONFIG.filter(badge => {
      const condition = badge.condition;
      const match = condition.match(/(\w+)\s*(>=|>|===|==)\s*(\d+)/);
      if (!match) return false;
      const [, key, op, val] = match;
      const statVal = stats[key] || 0;
      const threshold = parseInt(val, 10);
      if (op === '>=' || op === '>') return statVal >= threshold;
      return statVal === threshold;
    });
  }, [getReaderStats]);

  // CRUD — optimistic local update + Firestore write in background
  const addBook = useCallback((bookData) => {
    const id = `b${Date.now()}`;
    const newBook = {
      ...bookData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBooks(prev => [...prev, newBook]);
    setDoc(doc(db, 'books', id), newBook).catch(console.error);
    return newBook;
  }, []);

  const updateBook = useCallback((bookId, updates) => {
    const updatedData = { ...updates, updatedAt: new Date().toISOString() };
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, ...updatedData } : b));
    updateDoc(doc(db, 'books', bookId), updatedData).catch(console.error);
    if (updates.status === 'finished') {
      setShowCelebration(bookId);
    }
  }, []);

  const deleteBook = useCallback((bookId) => {
    setBooks(prev => prev.filter(b => b.id !== bookId));
    setTrailNotes(prev => prev.filter(n => n.bookId !== bookId));
    const batch = writeBatch(db);
    batch.delete(doc(db, 'books', bookId));
    trailNotes.filter(n => n.bookId === bookId).forEach(n => {
      batch.delete(doc(db, 'trailNotes', n.id));
    });
    batch.commit().catch(console.error);
  }, [trailNotes]);

  const addTrailNote = useCallback((noteData) => {
    const id = `tn${Date.now()}`;
    const newNote = {
      ...noteData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTrailNotes(prev => [...prev, newNote]);
    setDoc(doc(db, 'trailNotes', id), newNote).catch(console.error);
    return newNote;
  }, []);

  const updateTrailNote = useCallback((noteId, updates) => {
    const updatedData = { ...updates, updatedAt: new Date().toISOString() };
    setTrailNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...updatedData } : n));
    updateDoc(doc(db, 'trailNotes', noteId), updatedData).catch(console.error);
  }, []);

  const deleteTrailNote = useCallback((noteId) => {
    setTrailNotes(prev => prev.filter(n => n.id !== noteId));
    deleteDoc(doc(db, 'trailNotes', noteId)).catch(console.error);
  }, []);

  const addHeartNote = useCallback((trailNoteId, text) => {
    const heartNote = {
      id: `hn${Date.now()}`,
      authorId: activeProfileId,
      text,
      createdAt: new Date().toISOString(),
    };
    setTrailNotes(prev => prev.map(n => {
      if (n.id !== trailNoteId) return n;
      const updatedNote = { ...n, heartNotes: [...(n.heartNotes || []), heartNote] };
      updateDoc(doc(db, 'trailNotes', trailNoteId), { heartNotes: updatedNote.heartNotes }).catch(console.error);
      return updatedNote;
    }));
  }, [activeProfileId]);

  const addWritingTemplate = useCallback((tplData) => {
    const id = `wt${Date.now()}`;
    const newTpl = {
      ...tplData,
      id,
      createdByAdmin: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWritingTemplates(prev => [...prev, newTpl]);
    setDoc(doc(db, 'writingTemplates', id), newTpl).catch(console.error);
  }, []);

  const updateWritingTemplate = useCallback((tplId, updates) => {
    const updatedData = { ...updates, updatedAt: new Date().toISOString() };
    setWritingTemplates(prev => prev.map(t => t.id === tplId ? { ...t, ...updatedData } : t));
    updateDoc(doc(db, 'writingTemplates', tplId), updatedData).catch(console.error);
  }, []);

  const deleteWritingTemplate = useCallback((tplId) => {
    setWritingTemplates(prev => prev.filter(t => t.id !== tplId));
    deleteDoc(doc(db, 'writingTemplates', tplId)).catch(console.error);
  }, []);

  const updateProfile = useCallback((profileId, updates) => {
    setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, ...updates } : p));
    updateDoc(doc(db, 'profiles', profileId), updates).catch(console.error);
  }, []);

  const navigate = useCallback((page, bookId = null, noteId = null) => {
    setCurrentPage(page);
    if (bookId !== null) setSelectedBookId(bookId);
    if (noteId !== null) setEditingTrailNoteId(noteId);
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #FFFBF5 0%, #FFF0E8 50%, #F0F4FF 100%)',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div style={{ fontSize: '3.5rem' }}>📚</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#8B5CF6' }}>
          Loading Book Trail...
        </div>
        <div style={{ fontSize: '0.9rem', color: '#A8A29E', fontWeight: 600 }}>
          正在连接云端数据...
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      activeProfileId, setActiveProfileId,
      activeProfile,
      profiles,
      books,
      trailNotes,
      writingTemplates,
      categories,
      showCelebration, setShowCelebration,
      currentPage, selectedBookId, editingTrailNoteId,
      setEditingTrailNoteId,
      navigate,
      getBooksByReader,
      getTrailNotesByBook,
      getTrailNotesByReader,
      getAllVocabularyByReader,
      getReaderStats,
      computeBadges,
      addBook, updateBook, deleteBook,
      addTrailNote, updateTrailNote, deleteTrailNote, addHeartNote,
      addWritingTemplate, updateWritingTemplate, deleteWritingTemplate,
      updateProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
