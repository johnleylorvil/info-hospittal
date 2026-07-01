import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { Droplet, Plus, AlertTriangle, User, X } from 'lucide-react';
import { Badge } from '../../components/common/Card';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { GROUPES_SANGUINS } from '../../utils/constants';
import { toast } from 'sonner';

const emptyPoche = { groupe_sanguin: 'O+', quantite_ml: 450, numero_poche: '', date_collecte: '', date_expiration: '', donneur_id: '' };

const BloodBankPage = () => {
  const [donneurs, setDonneurs] = useState([]);
  const [stockSummary, setStockSummary] = useState({});
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('donneurs');
  const [showPocheForm, setShowPocheForm] = useState(false);
  const [poche, setPoche] = useState(emptyPoche);
  const [savingPoche, setSavingPoche] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [donneursRes, summaryRes, stocksRes] = await Promise.all([
        api.get('/blood-bank/donneurs'),
        api.get('/blood-bank/stock/summary'),
        api.get('/blood-bank/stock'),
      ]);
      setDonneurs(donneursRes.data);
      setStockSummary(summaryRes.data);
      setStocks(stocksRes.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePocheChange = (e) => {
    const { name, value } = e.target;
    setPoche(prev => ({ ...prev, [name]: name === 'quantite_ml' ? Number(value) : value }));
  };

  const handlePocheSubmit = async (e) => {
    e.preventDefault();
    setSavingPoche(true);
    try {
      await api.post('/blood-bank/stock', poche);
      toast.success('Poche de sang ajoutée');
      setPoche(emptyPoche);
      setShowPocheForm(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'ajout');
    } finally {
      setSavingPoche(false);
    }
  };

  const updateStockStatut = async (id, statut) => {
    try {
      await api.put(`/blood-bank/stock/${id}`, { statut });
      toast.success(`Statut mis à jour : ${statut}`);
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getStockColor = (statut) => {
    if (statut === 'critique') return 'text-red-600 bg-red-50';
    if (statut === 'faible') return 'text-amber-600 bg-amber-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Banque de sang</h2>
            <p className="text-gray-600 mt-1">Gestion des donneurs et stocks de sang</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/admin/blood-bank/donneurs/new')}
              className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-sky-700 hover:to-emerald-700 transition-all flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Nouveau donneur</span>
            </button>
            <button
              onClick={() => setShowPocheForm(!showPocheForm)}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all flex items-center space-x-2 shadow-lg"
            >
              {showPocheForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              <span>{showPocheForm ? 'Fermer' : 'Nouvelle poche'}</span>
            </button>
          </div>
        </div>

        {/* Formulaire ajout poche */}
        {showPocheForm && (
          <form onSubmit={handlePocheSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Ajouter une poche de sang</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Groupe sanguin *</label>
                <select name="groupe_sanguin" value={poche.groupe_sanguin} onChange={handlePocheChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500">
                  {GROUPES_SANGUINS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de poche *</label>
                <input name="numero_poche" value={poche.numero_poche} onChange={handlePocheChange} required placeholder="Ex: P-2024-001" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantité (ml) *</label>
                <input type="number" name="quantite_ml" value={poche.quantite_ml} onChange={handlePocheChange} required min={1} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de collecte *</label>
                <input type="date" name="date_collecte" value={poche.date_collecte} onChange={handlePocheChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date d'expiration *</label>
                <input type="date" name="date_expiration" value={poche.date_expiration} onChange={handlePocheChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Donneur</label>
                <select name="donneur_id" value={poche.donneur_id} onChange={handlePocheChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500">
                  <option value="">Anonyme</option>
                  {donneurs.map(d => <option key={d.id} value={d.id}>{d.nom} {d.prenom} ({d.groupe_sanguin})</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={savingPoche} className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
                {savingPoche ? 'Enregistrement...' : 'Ajouter la poche'}
              </button>
            </div>
          </form>
        )}

        {/* Stock Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {GROUPES_SANGUINS.map(groupe => {
            const stock = stockSummary[groupe];
            return (
              <div key={groupe} className={`rounded-xl p-4 border-2 transition-all hover:shadow-md ${
                stock ? getStockColor(stock.statut) : 'bg-gray-50 text-gray-400'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <Droplet className="w-5 h-5" />
                  <span className="text-xs font-medium">{stock?.nombre_poches || 0} poches</span>
                </div>
                <div className="text-2xl font-bold mb-1">{groupe}</div>
                <div className="text-sm">{stock?.quantite_ml || 0} ml</div>
              </div>
            );
          })}
        </div>

        {/* Alertes critiques */}
        {Object.values(stockSummary).some(s => s.statut === 'critique') && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Alertes critiques</h3>
                <p className="text-sm text-red-800">
                  {Object.entries(stockSummary).filter(([_, s]) => s.statut === 'critique').map(([g]) => g).join(', ')} : Stock critique - Contacter les donneurs
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('donneurs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'donneurs'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Donneurs ({donneurs.length})
              </button>
              <button
                onClick={() => setActiveTab('poches')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'poches'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Poches ({stocks.length})
              </button>
              <button
                onClick={() => setActiveTab('stock')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'stock'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Stocks par groupe
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
              </div>
            ) : activeTab === 'donneurs' ? (
              <div className="overflow-x-auto">
                {donneurs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Aucun donneur enregistré</p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Groupe sanguin</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernière donation</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {donneurs.map(donneur => (
                        <tr key={donneur.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <User className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="font-medium text-gray-900">{donneur.nom} {donneur.prenom}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="info">{donneur.groupe_sanguin}</Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{donneur.telephone}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {donneur.date_derniere_donation ? new Date(donneur.date_derniere_donation).toLocaleDateString('fr-FR') : 'Jamais'}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={donneur.eligible ? 'success' : 'error'}>
                              {donneur.eligible ? 'Éligible' : 'Non éligible'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => navigate(`/admin/blood-bank/donneurs/${donneur.id}/edit`)} className="text-sm text-sky-600 hover:text-sky-800">Modifier</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : activeTab === 'poches' ? (
              <div className="overflow-x-auto">
                {stocks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Aucune poche enregistrée</p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Poche</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Groupe</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collecte</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stocks.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.numero_poche}</td>
                          <td className="px-6 py-4"><Badge variant="info">{s.groupe_sanguin}</Badge></td>
                          <td className="px-6 py-4 text-sm text-gray-600">{s.quantite_ml} ml</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{new Date(s.date_collecte).toLocaleDateString('fr-FR')}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{new Date(s.date_expiration).toLocaleDateString('fr-FR')}</td>
                          <td className="px-6 py-4">
                            <Badge variant={{ disponible: 'success', 'utilisé': 'default', 'expiré': 'error' }[s.statut] || 'default'}>{s.statut}</Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {s.statut === 'disponible' && (
                                <button onClick={() => updateStockStatut(s.id, 'utilisé')} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">Utilisé</button>
                              )}
                              {s.statut !== 'expiré' && (
                                <button onClick={() => updateStockStatut(s.id, 'expiré')} className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200">Expiré</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(stockSummary).map(([groupe, data]) => (
                  <div key={groupe} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Droplet className="w-6 h-6 text-red-600" />
                        <h3 className="text-xl font-bold text-gray-900">{groupe}</h3>
                      </div>
                      <Badge variant={data.statut === 'critique' ? 'error' : data.statut === 'faible' ? 'warning' : 'success'}>
                        {data.statut}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantité totale:</span>
                        <span className="font-semibold">{data.quantite_ml} ml</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nombre de poches:</span>
                        <span className="font-semibold">{data.nombre_poches}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BloodBankPage;