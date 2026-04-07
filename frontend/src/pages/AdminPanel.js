import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '../contexts/AuthContext';
import { ArrowLeft, Plus, Pencil, Trash } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { token, isAdmin } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({
    articleNumber: '',
    institution: 'Legislature',
    originalText: '',
    simplifiedText: '',
    example: '',
    difficulty: 'Easy',
    language: 'en'
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchArticles();
  }, [isAdmin]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${API}/articles`);
      setArticles(response.data);
    } catch (error) {
      toast.error('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingArticle) {
        await axios.put(
          `${API}/admin/articles/${editingArticle.id}`,
          { ...formData, articleNumber: parseInt(formData.articleNumber) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Article updated successfully');
      } else {
        await axios.post(
          `${API}/admin/articles`,
          { ...formData, articleNumber: parseInt(formData.articleNumber) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Article created successfully');
      }
      resetForm();
      fetchArticles();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save article');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    
    try {
      await axios.delete(`${API}/admin/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Article deleted successfully');
      fetchArticles();
    } catch (error) {
      toast.error('Failed to delete article');
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      articleNumber: article.articleNumber,
      institution: article.institution,
      originalText: article.originalText,
      simplifiedText: article.simplifiedText,
      example: article.example,
      difficulty: article.difficulty,
      language: article.language
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      articleNumber: '',
      institution: 'Legislature',
      originalText: '',
      simplifiedText: '',
      example: '',
      difficulty: 'Easy',
      language: 'en'
    });
    setEditingArticle(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <header className="bg-[#FDFBF7] border-b-2 border-[#1A237E] sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <button
            data-testid="back-to-dashboard-btn"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[#1A237E] font-bold hover:text-[#FF6B35] transition-colors"
          >
            <ArrowLeft size={24} weight="bold" />
            Back to Dashboard
          </button>
          <button
            data-testid="add-article-btn"
            onClick={() => setShowForm(!showForm)}
            className="neo-btn-primary flex items-center gap-2"
          >
            <Plus size={20} weight="bold" />
            Add Article
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl sm:text-5xl font-black text-[#1A237E] mb-8 font-heading">
          Admin Panel
        </h1>

        {showForm && (
          <div className="neo-card mb-8">
            <h2 className="text-2xl font-bold text-[#1A237E] mb-6 font-heading">
              {editingArticle ? 'Edit Article' : 'Add New Article'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-[0.2em] text-[#1A237E]/70 mb-2">Article Number</label>
                  <input
                    data-testid="article-number-input"
                    type="number"
                    value={formData.articleNumber}
                    onChange={(e) => setFormData({ ...formData, articleNumber: e.target.value })}
                    className="neo-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-[0.2em] text-[#1A237E]/70 mb-2">Institution</label>
                  <select
                    data-testid="institution-select"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="neo-input w-full"
                  >
                    <option value="Legislature">Legislature</option>
                    <option value="Executive">Executive</option>
                    <option value="Judiciary">Judiciary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-[0.2em] text-[#1A237E]/70 mb-2">Difficulty</label>
                  <select
                    data-testid="difficulty-select"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="neo-input w-full"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-[0.2em] text-[#1A237E]/70 mb-2">Language</label>
                  <select
                    data-testid="language-select"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="neo-input w-full"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-[0.2em] text-[#1A237E]/70 mb-2">Original Text</label>
                <textarea
                  data-testid="original-text-input"
                  value={formData.originalText}
                  onChange={(e) => setFormData({ ...formData, originalText: e.target.value })}
                  className="neo-input w-full h-24"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-[0.2em] text-[#1A237E]/70 mb-2">Simplified Text</label>
                <textarea
                  data-testid="simplified-text-input"
                  value={formData.simplifiedText}
                  onChange={(e) => setFormData({ ...formData, simplifiedText: e.target.value })}
                  className="neo-input w-full h-24"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-[0.2em] text-[#1A237E]/70 mb-2">Example</label>
                <textarea
                  data-testid="example-input"
                  value={formData.example}
                  onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                  className="neo-input w-full h-24"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" data-testid="submit-article-btn" className="neo-btn-primary flex-1">
                  {editingArticle ? 'Update Article' : 'Create Article'}
                </button>
                <button type="button" onClick={resetForm} className="neo-btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="neo-card">
          <h2 className="text-2xl font-bold text-[#1A237E] mb-6 font-heading">All Articles ({articles.length})</h2>
          {loading ? (
            <p className="text-center py-8 text-[#1A237E]">Loading...</p>
          ) : (
            <div className="space-y-3">
              {articles.map((article) => (
                <div key={article.id} className="bg-[#F0EFEA] border-2 border-[#1A237E] rounded-lg p-4 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl font-black text-[#FF6B35] font-heading">Art. {article.articleNumber}</span>
                      <span className="bg-[#29B6F6] text-white font-bold text-xs px-3 py-1 rounded-full border-2 border-[#1A237E]">
                        {article.institution}
                      </span>
                      <span className="bg-[#FFD54F] text-[#1A237E] font-bold text-xs px-3 py-1 rounded-full border-2 border-[#1A237E]">
                        {article.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-[#1A237E]/80 line-clamp-2">{article.simplifiedText}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      data-testid={`edit-article-${article.articleNumber}`}
                      onClick={() => handleEdit(article)}
                      className="bg-[#29B6F6] text-white p-2 rounded-lg border-2 border-[#1A237E] hover:shadow-[3px_3px_0px_#1A237E] transition-all"
                    >
                      <Pencil size={20} weight="bold" />
                    </button>
                    <button
                      data-testid={`delete-article-${article.articleNumber}`}
                      onClick={() => handleDelete(article.id)}
                      className="bg-[#FF6B35] text-white p-2 rounded-lg border-2 border-[#1A237E] hover:shadow-[3px_3px_0px_#1A237E] transition-all"
                    >
                      <Trash size={20} weight="bold" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
