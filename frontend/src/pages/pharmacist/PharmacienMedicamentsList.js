import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { Pill, Plus, X, Search, Edit2, Trash2, Save } from 'lucide-react';
import { Badge } from '../../components/common/Card';
import api from '../../services/api';
import { toast } from 'sonner';

const emptyMed = { nom: '', categorie_id: '', forme: '', dosage: '', prix_unitaire: 0, seuil_stock_min: 10, fabricant: '' };

const PharmacienMedicamentsList = () => {
  const [medicaments, setMedicaments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyMed);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(emptyMed);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [medRes, catRes] = await Promise.all([
        api.get('/pharmacy/medicaments'),
        api.get('/pharmacy/categories')
      ]);
      setMedicaments(medRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'prix_unitaire' || name === 'seuil_stock_min' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/pharmacy/medicaments', form);
      toast.success('Médicament ajouté');
      setForm(emptyMed);
      setShowForm(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'ajout');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (med) => {
    setEditId(med.id);
    setEditForm({ nom: med.nom || '', categorie_id: med.categorie_id || '', forme: med.forme || '', dosage: med.dosage || '', prix_unitaire: med.prix_unitaire || 0, seuil_stock_min: med.seuil_stock_min || 10, fabricant: med.fabricant || '' });
  };

  const saveEdit = async () => {
    setSavingEdit(true);
    try {
      await api.put(`/pharmacy/medicaments/${editId}`, editForm);
      toast.success('Médicament mis à jour');
      setEditId(null);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la mise à jour');
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteMed = async (id, nom) => {
    if (!window.confirm(`Supprimer le médicament "${nom}" ?`)) return;
    try {
      await api.delete(`/pharmacy/medicaments/${id}`);
      toast.success('Médicament supprimé');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  const filtered = medicaments.filter(m => !search || m.nom?.toLowerCase().includes(search.toLowerCase()));

  return (
    <MainLayout>
      <div className="space-y-6" data-testid="pharmacien-medicaments-page">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Médicaments</h2>
            <p className="text-gray-600 mt-1">Catalogue des médicaments</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-sky-700 hover:to-emerald-700 transition-all flex items-center space-x-2 shadow-lg" data-testid="toggle-med-form-btn">
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <span>{showForm ? 'Fermer' : 'Nouveau médicament'}</span>
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4" data-testid="med-form">
            <h3 className="text-lg font-semibold text-gray-900">Ajouter un médicament</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="nom" value={form.nom} onChange={handleChange} required placeholder="Nom *" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" data-testid="med-nom" />
              <select name="categorie_id" value={form.categorie_id} onChange={handleChange} required className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" data-testid="med-categorie">
                <option value="">Catégorie *</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
              <input name="forme" value={form.forme} onChange={handleChange} placeholder="Forme (comprimé, sirop...)" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
              <input name="dosage" value={form.dosage} onChange={handleChange} placeholder="Dosage (500mg...)" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
              <input name="fabricant" value={form.fabricant} onChange={handleChange} placeholder="Fabricant" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
              <input name="prix_unitaire" type="number" value={form.prix_unitaire} onChange={handleChange} placeholder="Prix unitaire (FCFA)" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
              <input name="seuil_stock_min" type="number" value={form.seuil_stock_min} onChange={handleChange} placeholder="Seuil stock min" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
            </div>
            <button type="submit" disabled={saving} className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50" data-testid="submit-med-btn">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Rechercher un médicament..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" data-testid="med-search-input" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucun médicament trouvé</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(med => (
                <div key={med.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-testid={`med-card-${med.id}`}>
                  {editId === med.id ? (
                    <div className="space-y-3">
                      <input value={editForm.nom} onChange={e => setEditForm(p => ({ ...p, nom: e.target.value }))} placeholder="Nom" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500" />
                      <select value={editForm.categorie_id} onChange={e => setEditForm(p => ({ ...p, categorie_id: e.target.value }))} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500">
                        <option value="">Catégorie</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <input value={editForm.forme} onChange={e => setEditForm(p => ({ ...p, forme: e.target.value }))} placeholder="Forme" className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500" />
                        <input value={editForm.dosage} onChange={e => setEditForm(p => ({ ...p, dosage: e.target.value }))} placeholder="Dosage" className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500" />
                        <input type="number" value={editForm.prix_unitaire} onChange={e => setEditForm(p => ({ ...p, prix_unitaire: Number(e.target.value) }))} placeholder="Prix" className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500" />
                        <input type="number" value={editForm.seuil_stock_min} onChange={e => setEditForm(p => ({ ...p, seuil_stock_min: Number(e.target.value) }))} placeholder="Seuil min" className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500" />
                      </div>
                      <div className="flex space-x-2 pt-1">
                        <button onClick={saveEdit} disabled={savingEdit} className="flex items-center space-x-1 text-sm font-medium text-emerald-600 hover:text-emerald-800"><Save className="w-4 h-4" /><span>Sauvegarder</span></button>
                        <button onClick={() => setEditId(null)} className="text-sm text-gray-500 hover:text-gray-700">Annuler</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2"><Pill className="w-5 h-5 text-sky-600" /><h3 className="font-semibold text-gray-900">{med.nom}</h3></div>
                        <Badge variant="info">{med.forme || 'N/A'}</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600">Dosage :</span><span className="font-medium">{med.dosage || 'N/A'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Prix :</span><span className="font-medium">{med.prix_unitaire} FCFA</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Seuil min :</span><span className="font-medium">{med.seuil_stock_min}</span></div>
                      </div>
                      <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-gray-100">
                        <button onClick={() => startEdit(med)} className="flex items-center space-x-1 text-sm text-sky-600 hover:text-sky-800"><Edit2 className="w-4 h-4" /><span>Modifier</span></button>
                        <button onClick={() => deleteMed(med.id, med.nom)} className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /><span>Supprimer</span></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PharmacienMedicamentsList;
