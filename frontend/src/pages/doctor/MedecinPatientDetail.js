import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { ArrowLeft, User, Calendar, Stethoscope, FileText } from 'lucide-react';
import { Badge } from '../../components/common/Card';
import api from '../../services/api';

const MedecinPatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, aRes, cRes, prRes] = await Promise.all([
        api.get(`/patients/${id}`),
        api.get('/appointments', { params: { patient_id: id } }),
        api.get('/consultations', { params: { patient_id: id } }),
        api.get('/consultations/prescriptions/', { params: { patient_id: id } }),
      ]);
      setPatient(pRes.data);
      setAppointments(aRes.data);
      setConsultations(cRes.data);
      setPrescriptions(prRes.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const statutVariant = (s) => ({ planifié: 'info', confirmé: 'success', terminé: 'default', annulé: 'error', en_attente: 'warning' }[s] || 'default');

  if (loading) return <MainLayout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div></div></MainLayout>;
  if (!patient) return <MainLayout><p className="text-center text-gray-500 py-12">Patient introuvable</p></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/medecin/patients')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dossier {patient.numero_dossier}</h2>
            <p className="text-gray-600 mt-1">Vue complète du patient</p>
          </div>
        </div>

        {/* Infos patient */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{patient.numero_dossier}</h3>
              {patient.groupe_sanguin && <Badge variant="info">{patient.groupe_sanguin}</Badge>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between border-b border-gray-100 py-2"><span className="text-gray-600">Sexe</span><span className="font-medium">{patient.sexe}</span></div>
            <div className="flex justify-between border-b border-gray-100 py-2"><span className="text-gray-600">Date de naissance</span><span className="font-medium">{new Date(patient.date_naissance).toLocaleDateString('fr-FR')}</span></div>
            <div className="flex justify-between border-b border-gray-100 py-2"><span className="text-gray-600">Adresse</span><span className="font-medium">{patient.adresse || 'N/A'}</span></div>
            <div className="flex justify-between border-b border-gray-100 py-2"><span className="text-gray-600">Contact urgence</span><span className="font-medium">{patient.contact_urgence_nom || 'N/A'} {patient.contact_urgence_tel || ''}</span></div>
            <div className="flex justify-between border-b border-gray-100 py-2 md:col-span-2"><span className="text-gray-600">Allergies</span><span className="font-medium text-red-600">{patient.allergies || 'Aucune'}</span></div>
            {patient.historique_medical && (
              <div className="md:col-span-2 py-2"><span className="text-gray-600 block mb-1">Historique médical</span><p className="text-sm text-gray-800 bg-gray-50 rounded p-2">{patient.historique_medical}</p></div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rendez-vous */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2 text-sky-600" />Rendez-vous ({appointments.length})</h3>
            {appointments.length === 0 ? <p className="text-gray-500 text-sm">Aucun rendez-vous</p> : (
              <div className="space-y-2">
                {appointments.slice(0, 5).map(rdv => (
                  <div key={rdv.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{new Date(rdv.date_rdv).toLocaleDateString('fr-FR')}</p>
                      <p className="text-xs text-gray-500">{rdv.motif || rdv.type_rdv}</p>
                    </div>
                    <Badge variant={statutVariant(rdv.statut)}>{rdv.statut}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Consultations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center"><Stethoscope className="w-5 h-5 mr-2 text-emerald-600" />Consultations ({consultations.length})</h3>
            {consultations.length === 0 ? <p className="text-gray-500 text-sm">Aucune consultation</p> : (
              <div className="space-y-2">
                {consultations.slice(0, 5).map(c => (
                  <div key={c.id} className="py-2 border-b border-gray-100 last:border-0">
                    <p className="text-sm font-medium text-gray-900">{new Date(c.date_consultation).toLocaleDateString('fr-FR')}</p>
                    <p className="text-xs text-gray-600">Motif : {c.motif || 'N/A'}</p>
                    {c.diagnostic && <p className="text-xs text-sky-700">Diag. : {c.diagnostic}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prescriptions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center"><FileText className="w-5 h-5 mr-2 text-purple-600" />Ordonnances ({prescriptions.length})</h3>
            {prescriptions.length === 0 ? <p className="text-gray-500 text-sm">Aucune prescription</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50"><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Médicaments</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {prescriptions.slice(0, 5).map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                        <td className="px-4 py-3">{p.medicaments?.map(m => m.nom).join(', ') || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-500">{p.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MedecinPatientDetail;
