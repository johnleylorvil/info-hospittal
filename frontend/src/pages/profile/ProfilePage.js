import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { Save, User, Lock } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ nom: '', prenom: '', email: '', telephone: '', specialite: '' });
  const [pwForm, setPwForm] = useState({ password: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (user?.id) {
      api.get(`/users/${user.id}`)
        .then(res => setProfile({
          nom: res.data.nom || '',
          prenom: res.data.prenom || '',
          email: res.data.email || '',
          telephone: res.data.telephone || '',
          specialite: res.data.specialite || '',
        }))
        .catch(() => toast.error('Erreur lors du chargement du profil'));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/users/${user.id}`, profile);
      toast.success('Profil mis à jour');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (pwForm.password !== pwForm.confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (pwForm.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setSavingPw(true);
    try {
      await api.put(`/users/${user.id}`, { password: pwForm.password });
      toast.success('Mot de passe mis à jour');
      setPwForm({ password: '', confirm: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la mise à jour');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mon profil</h2>
          <p className="text-gray-600 mt-1">Gérer vos informations personnelles</p>
        </div>

        {/* Informations personnelles */}
        <form onSubmit={handleSaveProfile} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
              <input name="prenom" value={profile.prenom} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input name="nom" value={profile.nom} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" name="email" value={profile.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input name="telephone" value={profile.telephone} onChange={handleChange} placeholder="+221 77 XXX XX XX" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
            </div>
            {user?.role === 'médecin' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité</label>
                <input name="specialite" value={profile.specialite} onChange={handleChange} placeholder="Ex: Cardiologie, Pédiatrie..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
              </div>
            )}
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading} className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 shadow-lg disabled:opacity-50">
              <Save className="w-4 h-4" />
              <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </form>

        {/* Changement de mot de passe */}
        <form onSubmit={handleSavePassword} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Changer le mot de passe</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
              <input type="password" value={pwForm.password} onChange={e => setPwForm(p => ({ ...p, password: e.target.value }))} minLength={6} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="Min. 6 caractères" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
              <input type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="Répéter le mot de passe" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={savingPw || !pwForm.password} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 shadow-lg disabled:opacity-50">
              <Lock className="w-4 h-4" />
              <span>{savingPw ? 'Enregistrement...' : 'Modifier le mot de passe'}</span>
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
