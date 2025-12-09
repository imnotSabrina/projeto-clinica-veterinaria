import { useState, useEffect, useRef } from 'react'; // Adicionado useRef
import { useNavigate } from 'react-router-dom';
import { 
  Trash2, LogOut, Dog, Plus, Users, Shield, Stethoscope, Syringe, 
  Edit, Save, Calendar, Mail, CheckCircle, Search, Phone, 
  AlertTriangle, Check, ChevronLeft, ChevronRight, User, X, KeyRound
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- ESTILO ---
const petBackgroundStyle = {
    backgroundColor: '#f0f9ff',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm-8.49 4.51c-.83.83-.83 2.17 0 3s2.17.83 3 0 .83-2.17 0-3-2.17-.83-3 0zm16.98 0c-.83-.83-2.17-.83-3 0s-.83 2.17 0 3 2.17.83 3 0 .83-2.17 0-3zm-6.36 4.24c-.83.83-.83 2.17 0 3s2.17.83 3 0 .83-2.17 0-3-2.17-.83-3 0zm-12.73 4.24c-.83.83-.83 2.17 0 3s2.17.83 3 0 .83-2.17 0-3-2.17-.83-3 0zm25.46 0c-.83-.83-2.17-.83-3 0s-.83 2.17 0 3 2.17.83 3 0 .83-2.17 0-3zm-6.36 4.25c-.83.83-.83 2.17 0 3s2.17.83 3 0 .83-2.17 0-3-2.17-.83-3 0zm-12.73 4.24c-.83.83-.83 2.17 0 3s2.17.83 3 0 .83-2.17 0-3-2.17-.83-3 0zm25.46 0c-.83-.83-2.17-.83-3 0s-.83 2.17 0 3 2.17.83 3 0 .83-2.17 0-3zm-2.12 4.24c-.83.83-.83 2.17 0 3s2.17.83 3 0 .83-2.17 0-3-2.17-.83-3 0zm-21.22 0c-.83.83-.83 2.17 0 3s2.17.83 3 0 .83-2.17 0-3-2.17-.83-3 0zm10.61 4.24c-.83.83-.83 2.17 0 3s2.17.83 3 0 .83-2.17 0-3-2.17-.83-3 0z' fill='%233b82f6' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E")`,
};

// --- DADOS ---
const RACAS_CAES = ["Poodle", "Shih Tzu", "Yorkshire", "Bulldog", "Golden Retriever", "Labrador", "Pug", "Pinscher", "Pastor Alemão", "Outra"];
const RACAS_GATOS = ["Persa", "Siamês", "Maine Coon", "Angorá", "Sphynx", "Ragdoll", "Bengal", "Outra"];
const VACINAS_COMUNS = ["V8/V10 (Múltipla)", "Raiva", "Gripe", "Giárdia", "Leishmaniose", "Vermífugo", "Antipulgas"];

function Dashboard() {
  const [pets, setPets] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [buscaPet, setBuscaPet] = useState("");
  const [buscaUser, setBuscaUser] = useState("");
  const [paginaVacina, setPaginaVacina] = useState(1);
  const vacinasPorPagina = 10;

  // Refs para rolagem automática
  const petFormRef = useRef(null);
  const userFormRef = useRef(null);

  const initialForm = { 
    nome: '', raca: '', dataNascimento: '', 
    especie: 'Canina', especieOutro: '', 
    sexo: 'Macho',
    tutor: '', tutorTelefone: '', tutorEmail: '',
    vacinasTomadasSelection: [], agendamentos: [], 
    observacoes: '', idadeDesconhecida: false, idadeAnos: '', idadeMeses: ''
  };
  const [petForm, setPetForm] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const initialUserForm = { name: '', email: '', password: '' };
  const [userForm, setUserForm] = useState(initialUserForm);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUserId, setEditUserId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const loggedUserName = localStorage.getItem('userName') || "Usuário";
  const firstName = loggedUserName.split(' ')[0];

  const authFetch = (url, options = {}) => fetch(url, { ...options, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers } });

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    carregarPets();
    if (isAdmin) carregarUsuarios();
  }, []);

  // --- HELPERS SEGUROS ---
  const safeParse = (str) => { try { if (!str) return []; return JSON.parse(str); } catch (e) { return []; } };
  const validarTextoPuro = (texto) => /^[a-zA-ZÀ-ÿ\s]+$/.test(texto);
  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const calcularNascimentoPelaIdade = (anos, meses) => {
      const hoje = new Date();
      let novaData = new Date(hoje.getFullYear() - (anos || 0), hoje.getMonth() - (meses || 0), hoje.getDate());
      return novaData.toISOString().split('T')[0];
  };

  const calcularIdadeTexto = (dataNasc) => {
    if (!dataNasc) return "-";
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    if (isNaN(nasc.getTime())) return "-";
    let anos = hoje.getFullYear() - nasc.getFullYear();
    let meses = hoje.getMonth() - nasc.getMonth();
    if (meses < 0 || (meses === 0 && hoje.getDate() < nasc.getDate())) { anos--; meses += 12; }
    if (hoje.getDate() < nasc.getDate()) meses--;
    if (meses < 0) meses += 12;
    if (anos === 0 && meses === 0) return "Recém-nascido";
    if (anos === 0) return `${meses} meses`;
    return `${anos} anos, ${meses} meses`;
  };

  const formatarData = (dataString) => {
      if(!dataString) return "";
      const [ano, mes, dia] = dataString.split('-');
      return `${dia}/${mes}/${ano}`;
  };

  // --- PETS ACTIONS ---
  const carregarPets = async () => {
    try {
        const res = await authFetch('http://localhost:3000/pets');
        if (res.ok) {
            const data = await res.json();
            const petsSeguros = data.map(p => ({ ...p, agendamentos: safeParse(p.agendamentos) }));
            setPets(petsSeguros);
        } else if(res.status === 401) { logout(); }
    } catch (error) { console.error("Erro pets:", error); }
  };

  const handleEditarClick = (pet) => {
    const vacinasArr = pet.vacinasTomadas ? pet.vacinasTomadas.split(', ') : [];
    let especieSel = pet.especie;
    let especieOut = '';
    if (pet.especie !== 'Canina' && pet.especie !== 'Felina') { especieSel = 'Outro'; especieOut = pet.especie; }

    setPetForm({
        ...pet, especie: especieSel, especieOutro: especieOut,
        vacinasTomadasSelection: vacinasArr, 
        agendamentos: Array.isArray(pet.agendamentos) ? pet.agendamentos : [],
        idadeDesconhecida: pet.idadeEstimada || false, idadeAnos: '', idadeMeses: ''
    });
    setIsEditing(true); setEditId(pet.id);
    
    // ROLA ATÉ O FORMULÁRIO SUAVEMENTE
    setTimeout(() => {
        petFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const cancelarEdicao = () => { setPetForm(initialForm); setIsEditing(false); setEditId(null); };

  const salvarPet = async (e) => {
    e.preventDefault();
    if (!validarTextoPuro(petForm.nome)) return toast.warning("Nome do Pet: Apenas letras.");
    if (!validarTextoPuro(petForm.tutor)) return toast.warning("Nome do Tutor: Apenas letras.");
    if (petForm.tutorEmail && !validarEmail(petForm.tutorEmail)) return toast.warning("Email inválido.");

    let especieFinal = petForm.especie === 'Outro' ? (petForm.especieOutro || 'Outro') : petForm.especie;
    let dataNascFinal = petForm.dataNascimento;
    if (petForm.idadeDesconhecida) {
        if (!petForm.idadeAnos && !petForm.idadeMeses) return toast.warning("Informe a idade aproximada.");
        dataNascFinal = calcularNascimentoPelaIdade(petForm.idadeAnos, petForm.idadeMeses);
    }

    const hoje = new Date().toISOString().split('T')[0];
    for (let item of petForm.agendamentos) {
        if(!item.vacina || !item.data) return toast.warning("Preencha vacina e data.");
        if(item.data < hoje) return toast.warning("Agendamento não pode ser no passado.");
    }

    const payload = {
        ...petForm, especie: especieFinal, dataNascimento: dataNascFinal,
        idadeEstimada: petForm.idadeDesconhecida,
        vacinasTomadas: petForm.vacinasTomadasSelection.join(', '),
        agendamentos: JSON.stringify(petForm.agendamentos)
    };

    const url = isEditing ? `http://localhost:3000/pets/${editId}` : 'http://localhost:3000/pets';
    const res = await authFetch(url, { method: isEditing ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    if (res.ok) {
      toast.success(isEditing ? "Atualizado com sucesso." : "Cadastro realizado.");
      setPetForm(initialForm); setIsEditing(false); setEditId(null); carregarPets();
    } else { const erro = await res.json(); toast.warning(erro.message); }
  };

  const toggleVacina = (vacina) => {
      setPetForm(prev => {
          const exists = prev.vacinasTomadasSelection.includes(vacina);
          return { ...prev, vacinasTomadasSelection: exists ? prev.vacinasTomadasSelection.filter(v => v !== vacina) : [...prev.vacinasTomadasSelection, vacina] };
      });
  };

  const agendamentoActions = {
      add: () => setPetForm(prev => ({ ...prev, agendamentos: [...prev.agendamentos, { vacina: '', data: '' }] })),
      remove: (idx) => setPetForm(prev => ({ ...prev, agendamentos: prev.agendamentos.filter((_, i) => i !== idx) })),
      change: (idx, field, val) => {
          const novos = [...petForm.agendamentos]; novos[idx][field] = val;
          setPetForm({ ...petForm, agendamentos: novos });
      }
  };

  const handleConfirmarVacina = (pet, idx) => {
      const vacina = pet.agendamentos[idx];
      const ConfirmVacinaToast = ({ closeToast }) => (
        <div>
          <h4 className="font-bold text-sm mb-2 text-gray-800">Confirmar aplicação: {vacina.vacina}?</h4>
          <div className="flex gap-2">
            <button onClick={() => { aplicarVacinaReal(pet, idx); closeToast(); }} className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-emerald-700">Confirmar</button>
            <button onClick={closeToast} className="bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded font-bold hover:bg-gray-300">Cancelar</button>
          </div>
        </div>
      );
      toast(<ConfirmVacinaToast />, { autoClose: false, closeButton: false });
  };

  const aplicarVacinaReal = async (pet, idx) => {
      const vacina = pet.agendamentos[idx];
      const dataHoje = new Date().toLocaleDateString('pt-BR');
      let novasTomadas = pet.vacinasTomadas ? pet.vacinasTomadas.split(', ') : [];
      novasTomadas.push(`${vacina.vacina} (${dataHoje})`);
      const novosAgendamentos = pet.agendamentos.filter((_, i) => i !== idx);
      const payload = { vacinasTomadas: novasTomadas.join(', '), agendamentos: JSON.stringify(novosAgendamentos) };
      const res = await authFetch(`http://localhost:3000/pets/${pet.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      if(res.ok) { toast.success("Imunização registrada no histórico!"); carregarPets(); }
  };

  // --- USERS ACTIONS ---
  const carregarUsuarios = async () => { const res = await authFetch('http://localhost:3000/usuarios'); if (res.ok) setUsers(await res.json()); };
  
  const handleEditarUsuario = (u) => {
      setUserForm({ name: u.name, email: u.email, password: '' });
      setIsEditingUser(true);
      setEditUserId(u.id);
      // ROLA ATÉ O FORMULÁRIO DE USUÁRIO
      setTimeout(() => {
        userFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
  };

  const cancelarEdicaoUser = () => { setUserForm(initialUserForm); setIsEditingUser(false); setEditUserId(null); };

  const salvarUsuario = async (e) => {
    e.preventDefault();
    const url = isEditingUser ? `http://localhost:3000/usuarios/${editUserId}` : 'http://localhost:3000/usuarios';
    const method = isEditingUser ? 'PUT' : 'POST';
    
    if (!isEditingUser && userForm.password.length < 8) return toast.warning("Senha min: 8 caracteres.");
    if (isEditingUser && userForm.password && userForm.password.length < 8) return toast.warning("Nova senha muito curta.");

    const res = await authFetch(url, { method, body: JSON.stringify(userForm) });
    if (res.ok) { 
        toast.success(isEditingUser ? "Dados atualizados." : "Funcionário adicionado."); 
        setUserForm(initialUserForm); setIsEditingUser(false); setEditUserId(null); carregarUsuarios(); 
    } else { const erro = await res.json(); toast.error(erro.message); }
  };

  const excluirPet = async (id) => { 
      const ConfirmDelete = ({ closeToast }) => (<div><h4 className="font-bold text-gray-800 text-sm mb-2">Excluir prontuário?</h4><div className="flex gap-2"><button onClick={()=>{removerPetReal(id);closeToast()}} className="bg-red-600 text-white text-xs px-3 py-1 rounded">Sim</button><button onClick={closeToast} className="bg-gray-200 text-xs px-3 py-1 rounded">Não</button></div></div>);
      toast(<ConfirmDelete/>, {autoClose:false}); 
  };
  const removerPetReal = async (id) => { const res = await authFetch(`http://localhost:3000/pets/${id}`, { method: 'DELETE' }); if (res.ok) { toast.success("Removido."); carregarPets(); } };

  const removerUsuario = async (id) => { 
      const ConfirmUser = ({ closeToast }) => (<div><h4 className="font-bold text-gray-800 text-sm mb-2">Demitir funcionário?</h4><div className="flex gap-2"><button onClick={()=>{removerUserReal(id);closeToast()}} className="bg-red-600 text-white text-xs px-3 py-1 rounded">Sim</button><button onClick={closeToast} className="bg-gray-200 text-xs px-3 py-1 rounded">Não</button></div></div>);
      toast(<ConfirmUser/>, {autoClose:false});
  };
  const removerUserReal = async (id) => { await authFetch(`http://localhost:3000/usuarios/${id}`, { method: 'DELETE' }); carregarUsuarios(); };
  
  const logout = () => { localStorage.clear(); navigate('/'); };

  const inputClass = (disabled) => `w-full px-3 py-2.5 border ${disabled ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 ring-blue-600 focus:border-transparent'} rounded-lg text-sm transition-all outline-none font-medium shadow-sm`;
  const labelClass = "block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5";

  // Listas
  const usuariosFiltrados = users.filter(u => u.name.toLowerCase().includes(buscaUser.toLowerCase()));
  const petsFiltrados = pets.filter(p => p.nome.toLowerCase().includes(buscaPet.toLowerCase()) || p.tutor.toLowerCase().includes(buscaPet.toLowerCase()));
  
  const todasVacinasPendentes = [];
  pets.forEach(p => {
      if (Array.isArray(p.agendamentos)) {
          p.agendamentos.forEach((ag, idx) => { todasVacinasPendentes.push({ ...ag, petId: p.id, petNome: p.nome, petEspecie: p.especie, tutor: p.tutor, tutorTel: p.tutorTelefone, idx }); });
      }
  });
  todasVacinasPendentes.sort((a, b) => new Date(a.data) - new Date(b.data));
  const vacinasAtuais = todasVacinasPendentes.slice((paginaVacina - 1) * vacinasPorPagina, paginaVacina * vacinasPorPagina);

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans text-gray-900" style={petBackgroundStyle}>
      <ToastContainer position="top-right" hideProgressBar theme="colored" />
      
      {/* NAVBAR */}
      <nav className="bg-blue-800/95 backdrop-blur-sm border-b border-blue-900 sticky top-0 z-30 shadow-md">
        <div className="container px-6 py-3 mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 text-white">
            <div className="bg-white/20 p-1.5 rounded-lg"><Dog size={24} /></div>
            <span className="text-xl font-extrabold tracking-tight">VetSystem</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-blue-700/50">
                <div className="text-right hidden sm:block text-white">
                    <p className="text-sm font-bold">{firstName}</p>
                    <p className="text-[10px] uppercase font-semibold text-blue-200 tracking-wider">{isAdmin ? "Admin" : "Funcionário"}</p>
                </div>
                <div className="bg-blue-700 p-2 rounded-full text-blue-100 border border-blue-600"><User size={20}/></div>
            </div>
            <button onClick={logout} className="text-blue-300 hover:text-white hover:bg-blue-700 p-2 rounded transition" title="Sair"><LogOut size={20} /></button>
          </div>
        </div>
      </nav>

      <main className="container px-6 mx-auto mt-8 space-y-8">
        
        {/* ALERTAS VACINA */}
        <section className="bg-white/95 backdrop-blur-sm border-l-4 border-orange-500 rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-orange-50/80 flex justify-between items-center">
                <h2 className="text-base font-bold text-orange-900 flex items-center gap-2"><AlertTriangle size={20} className="text-orange-600"/> Próximas Vacinações</h2>
                <span className="text-xs font-bold bg-white text-orange-700 px-3 py-1 rounded-full border border-orange-200 shadow-sm">{todasVacinasPendentes.length} pendentes</span>
            </div>
            {vacinasAtuais.length === 0 ? (
                <div className="p-8 text-center text-gray-400"><CheckCircle className="mx-auto mb-3 text-emerald-500" size={40}/><p className="font-medium text-gray-600">Agenda em dia! Nenhuma vacina pendente.</p></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/80 text-gray-600 font-bold uppercase text-xs">
                            <tr><th className="px-6 py-3 text-left">Data</th><th className="px-6 py-3 text-left">Vacina</th><th className="px-6 py-3 text-left">Pet</th><th className="px-6 py-3 text-left">Tutor</th><th className="px-6 py-3 text-center">Ação</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {vacinasAtuais.map((item, i) => (
                                <tr key={i} className="hover:bg-orange-50/50 transition-colors">
                                    <td className="px-6 py-3 font-bold text-orange-700">{formatarData(item.data)}</td>
                                    <td className="px-6 py-3 font-medium text-gray-800">{item.vacina}</td>
                                    <td className="px-6 py-3 font-bold text-gray-800">{item.petNome}</td>
                                    <td className="px-6 py-3 text-gray-600"><div className="flex flex-col"><span className="font-medium">{item.tutor}</span><div className="flex gap-2 text-xs mt-0.5 opacity-80">{item.tutorTel && <span className="flex items-center gap-1"><Phone size={10}/> {item.tutorTel}</span>}</div></div></td>
                                    <td className="px-6 py-3 text-center"><button onClick={() => handleConfirmarVacina(pets.find(p=>p.id===item.petId), item.idx)} className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-1.5 rounded shadow-sm text-xs font-bold transition-all">Confirmar</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>

        {/* TEAM SECTION */}
        {isAdmin && (
          <section className="bg-white/95 backdrop-blur-sm border-l-4 border-indigo-600 rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Shield size={24} className="text-indigo-600"/> Equipe da Clínica</h2>
                <div className="relative"><Search className="absolute left-3 top-2.5 text-gray-400" size={16}/><input className="pl-9 pr-4 py-2 text-sm bg-gray-50/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-64 font-medium" placeholder="Buscar funcionário..." value={buscaUser} onChange={e=>setBuscaUser(e.target.value)}/></div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
                {/* FORMULARIO COM REF */}
                <form ref={userFormRef} onSubmit={salvarUsuario} className="bg-gray-50/80 p-4 rounded-lg border border-gray-200 space-y-3 w-full md:w-1/3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-sm text-gray-800 uppercase">{isEditingUser ? "Editar Membro" : "Novo Acesso"}</h3>
                        {isEditingUser && <button onClick={cancelarEdicaoUser} className="text-xs text-red-500 underline">Cancelar</button>}
                    </div>
                    <input placeholder="Nome" className={inputClass(false)} value={userForm.name} onChange={e=>setUserForm({...userForm, name: e.target.value})} required/>
                    <input placeholder="Email" className={inputClass(false)} value={userForm.email} onChange={e=>setUserForm({...userForm, email: e.target.value})} required/>
                    <div className="relative">
                        <input placeholder={isEditingUser ? "Nova Senha (opcional)" : "Senha"} type="password" className={inputClass(false)} value={userForm.password} onChange={e=>setUserForm({...userForm, password: e.target.value})} required={!isEditingUser}/>
                        {isEditingUser && <KeyRound size={14} className="absolute right-3 top-3 text-gray-400"/>}
                    </div>
                    <button className={`w-full py-2.5 text-white text-sm font-bold rounded-lg shadow-md transition-colors ${isEditingUser ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-700 hover:bg-indigo-800'}`}>
                        {isEditingUser ? "Salvar Alterações" : "Adicionar Membro"}
                    </button>
                </form>
                
                <div className="w-full md:w-2/3 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 content-start">
                    {usuariosFiltrados.map(u => (
                        <div key={u.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`w-8 h-8 min-w-[2rem] rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${u.isAdmin ? 'bg-indigo-600' : 'bg-gray-500'}`}>{u.name.charAt(0)}</div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-gray-800 leading-tight truncate">{u.name}</p>
                                    <p className="text-[10px] font-semibold text-gray-500 uppercase mt-0.5">{u.isAdmin ? 'Admin' : 'Funcionário'}</p>
                                    <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <button onClick={()=>handleEditarUsuario(u)} className="text-gray-300 hover:text-indigo-600 transition"><Edit size={14}/></button>
                                {u.id !== 1 && <button onClick={()=>removerUsuario(u.id)} className="text-gray-300 hover:text-red-600 transition"><Trash2 size={14}/></button>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </section>
        )}

        {/* PRONTUÁRIOS */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
             <div><h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-3"><Stethoscope size={32} className="text-blue-700"/> Prontuários</h2><p className="text-blue-900/70 text-sm mt-1 font-medium bg-blue-50/50 px-2 py-1 rounded inline-block">Gestão completa de pets e histórico clínico.</p></div>
             <div className="relative w-full md:w-96"><Search className="absolute left-3 top-3 text-gray-400" size={18}/><input className="pl-10 pr-4 py-2.5 w-full bg-white/90 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-600 outline-none font-medium" placeholder="Buscar por Pet ou Tutor..." value={buscaPet} onChange={e=>setBuscaPet(e.target.value)}/></div>
          </div>
          
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-4">
                {/* CARD DE FORMULÁRIO COM REF */}
                <div ref={petFormRef} className={`bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-md border-t-4 sticky top-24 transition-all ${isEditing ? 'border-amber-500 ring-1 ring-amber-500' : 'border-blue-600'}`}>
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">{isEditing ? <><Edit size={20} className="text-amber-600"/> Editar Pet</> : <><Plus size={20} className="text-blue-700"/> Cadastrar Pet</>}</h3>
                        {isEditing && <button onClick={cancelarEdicao} className="text-xs font-bold text-red-600 hover:underline">Cancelar</button>}
                    </div>
                    <form onSubmit={salvarPet} className="space-y-6">
                        <div className="space-y-3">
                            <label className={labelClass}>Identificação</label>
                            <input placeholder="Nome do Pet" className={inputClass(isEditing)} value={petForm.nome} onChange={e=>setPetForm({...petForm, nome: e.target.value})} required disabled={isEditing} />
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative"><select className={`${inputClass(isEditing)} appearance-none`} value={petForm.especie} onChange={e=>setPetForm({...petForm, especie: e.target.value})} disabled={isEditing}><option value="Canina">Canina</option><option value="Felina">Felina</option><option value="Outro">Outro</option></select></div>
                                <div className="flex items-center gap-4 px-3 border border-gray-300 rounded-lg bg-white/80 h-[42px]"><label className="flex items-center gap-1.5 cursor-pointer text-sm font-bold text-gray-600"><input type="radio" name="sexo" value="Macho" checked={petForm.sexo === 'Macho'} onChange={e=>setPetForm({...petForm, sexo: e.target.value})} disabled={isEditing} className="accent-blue-700"/> M</label><label className="flex items-center gap-1.5 cursor-pointer text-sm font-bold text-gray-600"><input type="radio" name="sexo" value="Fêmea" checked={petForm.sexo === 'Fêmea'} onChange={e=>setPetForm({...petForm, sexo: e.target.value})} disabled={isEditing} className="accent-blue-700"/> F</label></div>
                            </div>
                            {petForm.especie === 'Outro' && <input placeholder="Especifique a espécie" className={inputClass(isEditing)} value={petForm.especieOutro} onChange={e=>setPetForm({...petForm, especieOutro: e.target.value})} disabled={isEditing}/>}
                            <div className="grid grid-cols-2 gap-3">
                                <div><select className={inputClass(isEditing || petForm.raca === 'SRD')} value={petForm.raca} onChange={e=>setPetForm({...petForm, raca: e.target.value})} disabled={isEditing || petForm.raca === 'SRD'}><option value="">Raça...</option>{(petForm.especie==='Canina'?RACAS_CAES:RACAS_GATOS).map(r=><option key={r} value={r}>{r}</option>)}</select>{!isEditing && <label className="flex items-center gap-1.5 mt-1.5 text-xs font-bold text-gray-500 cursor-pointer"><input type="checkbox" checked={petForm.raca === 'SRD'} onChange={() => setPetForm(prev => ({...prev, raca: prev.raca === 'SRD' ? '' : 'SRD'}))} className="accent-blue-700"/> É SRD?</label>}</div>
                                <div>{!petForm.idadeDesconhecida ? (<input type="date" className={inputClass(isEditing)} value={petForm.dataNascimento} onChange={e=>setPetForm({...petForm, dataNascimento: e.target.value})} disabled={isEditing} />) : (<div className="flex gap-1"><input type="number" placeholder="Anos" className={inputClass(isEditing)} value={petForm.idadeAnos} onChange={e=>setPetForm({...petForm, idadeAnos: e.target.value})} disabled={isEditing}/><input type="number" placeholder="Mes" className={inputClass(isEditing)} value={petForm.idadeMeses} onChange={e=>setPetForm({...petForm, idadeMeses: e.target.value})} disabled={isEditing}/></div>)}{!isEditing && <label className="flex items-center gap-1.5 mt-1.5 text-xs font-bold text-gray-500 cursor-pointer"><input type="checkbox" checked={petForm.idadeDesconhecida} onChange={e=>setPetForm({...petForm, idadeDesconhecida: e.target.checked})} className="accent-blue-700"/> Calcular</label>}</div>
                            </div>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                            <label className={labelClass}>Responsável</label>
                            <input placeholder="Nome do Tutor" className={inputClass(false)} value={petForm.tutor} onChange={e=>setPetForm({...petForm, tutor: e.target.value})} required />
                            <div className="grid grid-cols-2 gap-3"><input placeholder="Telefone" className={inputClass(false)} value={petForm.tutorTelefone} onChange={e=>setPetForm({...petForm, tutorTelefone: e.target.value})} /><input placeholder="Email" className={inputClass(false)} value={petForm.tutorEmail} onChange={e=>setPetForm({...petForm, tutorEmail: e.target.value})} /></div>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                            <label className={labelClass}>Vacinas & Histórico</label>
                            <div className="flex flex-wrap gap-2">{VACINAS_COMUNS.map(vacina => (<button key={vacina} type="button" onClick={() => toggleVacina(vacina)} className={`text-xs px-2.5 py-1.5 rounded font-bold border transition-all ${petForm.vacinasTomadasSelection.includes(vacina) ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white/80 border-gray-300 text-gray-500 hover:bg-gray-50'}`}>{vacina}</button>))}</div>
                            <label className={`${labelClass} mt-4 flex justify-between`}><span>Agendamentos</span><button type="button" onClick={agendamentoActions.add} className="text-blue-700 hover:underline text-[11px] font-bold">+ NOVO ITEM</button></label>
                            <div className="space-y-2">{petForm.agendamentos.map((ag, i) => (<div key={i} className="flex gap-2"><input placeholder="Vacina" className={`${inputClass(false)} w-1/2`} value={ag.vacina} onChange={e=>agendamentoActions.change(i, 'vacina', e.target.value)}/><input type="date" className={`${inputClass(false)} w-1/3`} value={ag.data} onChange={e=>agendamentoActions.change(i, 'data', e.target.value)}/><button type="button" onClick={()=>agendamentoActions.remove(i)} className="text-gray-400 hover:text-red-600"><X size={18}/></button></div>))}</div>
                            <label className={`${labelClass} mt-4`}>Observações</label>
                            <textarea className={`${inputClass(false)} h-24 resize-none`} value={petForm.observacoes} onChange={e=>setPetForm({...petForm, observacoes: e.target.value})}></textarea>
                        </div>
                        <button className={`w-full py-3.5 font-bold text-white rounded-lg shadow-md transition-all active:scale-95 flex justify-center items-center gap-2 ${isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-700 hover:bg-blue-800'}`}>{isEditing ? <><Save size={18}/> Salvar Alterações</> : <> Adicionar Pet</>}</button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-6 content-start">
                {petsFiltrados.map(pet => (
                    <div key={pet.id} className="bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3"><div className={`p-2.5 rounded-full border ${pet.especie === 'Felina' ? 'bg-purple-50 border-purple-100 text-purple-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}><Dog size={20}/></div><div><h3 className="font-extrabold text-gray-800 text-lg leading-none">{pet.nome}</h3><span className="text-xs font-semibold text-gray-500">{pet.raca}</span></div></div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => handleEditarClick(pet)} className="p-1.5 text-gray-400 hover:text-blue-700 hover:bg-blue-50 rounded transition"><Edit size={18}/></button>{isAdmin && <button onClick={() => excluirPet(pet.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"><Trash2 size={18}/></button>}</div>
                            </div>
                            <div className="space-y-3 mb-4">
                                <div className="text-xs flex gap-2"><span className="px-2.5 py-1 rounded bg-gray-100 text-gray-700 font-bold border border-gray-200">{pet.sexo === 'Macho' ? 'Macho' : 'Fêmea'}</span><span className="px-2.5 py-1 rounded bg-gray-100 text-gray-700 font-bold border border-gray-200">{calcularIdadeTexto(pet.dataNascimento)}</span></div>
                                <div className="text-sm text-gray-600 border-t border-gray-100 pt-3"><p className="font-bold text-gray-800">{pet.tutor}</p><div className="flex flex-col gap-1 text-xs text-gray-500 mt-1">{pet.tutorTelefone && <span className="flex items-center gap-2"><Phone size={12}/> {pet.tutorTelefone}</span>}{pet.tutorEmail && <span className="flex items-center gap-2"><Mail size={12}/> {pet.tutorEmail}</span>}</div></div>
                            </div>
                            <div className="bg-gray-50/80 rounded-lg p-3 text-xs space-y-3 border border-gray-200">
                                <div><span className="font-bold text-gray-600 uppercase text-[10px] block mb-1">Histórico</span><p className="text-gray-700 leading-relaxed font-medium">{pet.vacinasTomadas || <span className="text-gray-400 italic font-normal">Nenhum registro.</span>}</p></div>
                                {Array.isArray(pet.agendamentos) && pet.agendamentos.length > 0 && (<div className="pt-2 border-t border-gray-200"><span className="font-bold text-orange-600 uppercase text-[10px] block mb-1">Próximas Doses</span>{pet.agendamentos.map((ag, i) => (<div key={i} className="flex justify-between text-gray-700 mt-1"><span>{ag.vacina}</span><span className="font-bold">{formatarData(ag.data)}</span></div>))}</div>)}
                            </div>
                        </div>
                    </div>
                ))}
                {petsFiltrados.length === 0 && <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">Nenhum pet encontrado.</div>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;