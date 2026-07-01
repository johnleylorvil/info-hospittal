import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { Tag, Plus, X, Edit2, Save } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

const PharmacienCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ nom: '', description: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pharmacy/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/pharmacy/categories', form);
      toast.success('Catégorie créée');
      setForm({ nom: '', description: '' });
      setShowForm(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat) => {
    setEditId(cat.id);
    setEditForm({ nom: cat.nom, description: cat.description || '' });
  };

  const cancelEdit = () => { setEditId(null); };

  const saveEdit = async (id) => {
    try {
      await api.put(`/pharmacy/categories/${id}`, editForm);
      toast.success('Catégorie mise à jour');
      setEditId(null);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la mise à jour');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Catégories de médicaments</h2>
            <p className="text-gray-600 mt-1">Gérer les catégories du catalogue</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-sky-700 hover:to-emerald-700 transition-all flex items-center space-x-2 shadow-lg">
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <span>{showForm ? 'Fermer' : 'Nouvelle catégorie'}</span>
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Nouvelle catégorie</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} required placeholder="Ex: Antibiotiques, Analgésiques..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description optionnelle" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
                {saving ? 'Enregistrement...' : 'Créer la catégorie'}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div></div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune catégorie créée</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {editId === cat.id ? (
                        <input value={editForm.nom} onChange={e => setEditForm(p => ({ ...p, nom: e.target.value }))} className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 w-full" />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
                            <Tag className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-gray-900">{cat.nom}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {editId === cat.id ? (
                        <input value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 w-full" />
                      ) : (
                        cat.description || '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editId === cat.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => saveEdit(cat.id)} className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-800 text-sm font-medium"><Save className="w-4 h-4" /><span>Sauvegarder</span></button>
                          <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700 text-sm">Annuler</button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(cat)} className="flex items-center space-x-1 text-sky-600 hover:text-sky-800 text-sm font-medium ml-auto">
                          <Edit2 className="w-4 h-4" /><span>Modifier</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PharmacienCategoriesPage;
