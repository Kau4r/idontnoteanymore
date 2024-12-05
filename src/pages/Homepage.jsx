import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { PlusCircle, Pencil, Trash2, Loader2, X } from 'lucide-react';
import './hompag.css';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState(null);

  const fetchNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser(); // Correctly destructure user
      if (user) {
        const { data: notesData, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user', user.id) // Ensure you're using user.id
          .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        setNotes(notesData);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser(); // Get current user
      if (!user) throw new Error('User not authenticated');

      const noteData = {
        ...formData,
        user: user.id, // Use 'user.id' to store the correct user ID
      };

      if (isEditing) {
        const { error } = await supabase
          .from('notes')
          .update(noteData)
          .match({ id: currentNoteId });

        if (error) throw error;

        showToast('Note updated successfully!');
      } else {
        const { error } = await supabase.from('notes').insert([noteData]);

        if (error) throw error;

        showToast('New note created successfully!');
      }

      // Reset form and fetch updated notes
      setFormData({ title: '', content: '' });
      setIsEditing(false);
      setCurrentNoteId(null);
      await fetchNotes();
    } catch (error) {
      setError(error.message);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (note) => {
    setFormData({ title: note.title, content: note.content });
    setIsEditing(true);
    setCurrentNoteId(note.id);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('notes').delete().match({ id });
      if (error) throw error;

      await fetchNotes();
      showToast('Note deleted successfully!');
    } catch (error) {
      setError(error.message);
      showToast(error.message, 'error');
    }
  };

  const cancelEdit = () => {
    setFormData({ title: '', content: '' });
    setIsEditing(false);
    setCurrentNoteId(null);
  };

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  // Display loading spinner while fetching notes
  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card form-card">
        <h2>{isEditing ? 'Edit Note' : 'Create New Note'}</h2>
        <p className="card-description">
          {isEditing
            ? 'Update your note details below'
            : 'Add a new note to your collection'}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter note title"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea 
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Enter note content"
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? (
                <>
                  <Loader2 className="icon spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <PlusCircle className="icon" />
                  {isEditing ? 'Update Note' : 'Create Note'}
                </>
              )}
            </button>
            {isEditing && (
              <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                <X className="icon" />
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {error && <div className="alert error">{error}</div>}

      {/* Conditional rendering for notes */}
      {notes.length === 0 ? (
        <p>No notes available. Create your first note!</p>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <div key={note.id} className="card note-card">
              <h3>{note.title}</h3>
              <div className="note-content">
                <p>{note.content}</p>
              </div>
              <div className="card-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => handleEdit(note)}
                >
                  <Pencil className="icon" />
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(note.id)}
                >
                  <Trash2 className="icon" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}