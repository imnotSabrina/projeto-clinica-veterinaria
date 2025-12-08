import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, UserPlus, LogIn, Lock, Activity } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- ESTILO DO FUNDO DE PATINHAS ---
const petBackgroundStyle = {
    backgroundColor: '#f0f9ff', // Azul clarinho (blue-50)
    // Padrão SVG de patinhas sutil
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm-8.49 4.51c-.83.83-.83 2.17 0 3s2.17.83 3 0 .83-2.17 0-3-2.17-.83-3 0zm16.98 0c-.83-.83-2.17-.83-3 0s-.83 2.17 0 3 2.17.83 3 0 .83-2.17 0-3zm-6.36 4.24c-.83.83-.83 2.17 0 3s2.17.83 3 0 .83-2.17 0-3-2.17-.83-3 0zm-12.73 4.24c-.83.83-.83 2.17 0 3s2.17.83 3 0 .83-2.17 0-3-2.17-.83-3 0zm25.46 0c-.83-.83-2.17-.83-3 0s-.83 2.17 0 3 2.17.83 3 0 .83-2.17 0-3zm-6.36 4.25c-.83.83-.83 2.17 0 3s2.17.83 3 0 .83-2.17 0-3-2.17-.83-3 0zm-12.73 4.24c-.83.83-.83 2.17 0 3s2.17.83 3 0 .83-2.17 0-3-2.17-.83-3 0zm25.46 0c-.83-.83-2.17-.83-3 0s-.83 2.17 0 3 2.17.83 3 0 .83-2.17 0-3zm-2.12 4.24c-.83.83-.83 2.17 0 3s2.17.83 3 0 .83-2.17 0-3-2.17-.83-3 0zm-21.22 0c-.83.83-.83 2.17 0 3s2.17.83 3 0 .83-2.17 0-3-2.17-.83-3 0zm10.61 4.24c-.83.83-.83 2.17 0 3s2.17.83 3 0 .83-2.17 0-3-2.17-.83-3 0z' fill='%233b82f6' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E")`,
};

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [systemInitialized, setSystemInitialized] = useState(false);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
        try {
            const res = await fetch('http://localhost:3000/system-status');
            const data = await res.json();
            setSystemInitialized(data.initialized);
            if (data.initialized) setIsLogin(true);
        } catch (error) { console.error("Erro status"); } finally { setLoading(false); }
    };
    checkStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'http://localhost:3000/login' : 'http://localhost:3000/cadastro';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('isAdmin', data.isAdmin);
          localStorage.setItem('userName', data.name || "Usuário");
          toast.success("Bem-vindo de volta!");
          setTimeout(() => navigate('/dashboard'), 1000);
        } else {
          toast.success("Sistema configurado com sucesso.");
          setSystemInitialized(true); setIsLogin(true);
        }
      } else { toast.error(data.message || "Erro."); }
    } catch (error) { toast.error("Sem conexão."); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-blue-50 text-blue-500 font-bold font-sans" style={petBackgroundStyle}>Carregando...</div>;

  return (
    // APLICAÇÃO DO FUNDO AQUI NA DIV PRINCIPAL
    <div className="flex items-center justify-center h-screen font-sans" style={petBackgroundStyle}>
      <ToastContainer autoClose={3000} position="top-center" hideProgressBar theme="colored" />
      
      {/* Adicionado backdrop-blur para o card destacar do fundo texturizado */}
      <div className="w-full max-w-md p-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-blue-50 rounded-full mb-4 ring-1 ring-blue-100 shadow-sm animate-pulse-slow">
            <Activity className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">VetSystem</h1>
          <p className="text-blue-500 text-sm mt-1 font-medium">Gestão Clínica Animada</p>
        </div>

        {!systemInitialized && (
            <div className="flex mb-8 bg-blue-50 p-1 rounded-lg">
            <button className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isLogin ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-500 hover:text-blue-700'}`} onClick={() => setIsLogin(true)}>Entrar</button>
            <button className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isLogin ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-500 hover:text-blue-700'}`} onClick={() => setIsLogin(false)}>Configurar</button>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="animate-fade-in-up">
              <label className="block text-xs font-bold text-blue-700 uppercase mb-1">Nome Completo</label>
              <input className="w-full px-4 py-3 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition font-medium bg-blue-50/30" placeholder="Dr. Nome" value={name} onChange={e => setName(e.target.value)} required={!isLogin} />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-blue-700 uppercase mb-1">E-mail</label>
            <input type="email" className="w-full px-4 py-3 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition font-medium bg-blue-50/30" placeholder="usuario@clinica.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-blue-700 uppercase mb-1">Senha</label>
            <input type="password" className="w-full px-4 py-3 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition font-medium bg-blue-50/30" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className={`w-full py-3.5 mt-4 font-bold text-white rounded-lg transition-all shadow-md active:scale-95 flex justify-center items-center gap-2 ${isLogin ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            {isLogin ? <><LogIn size={18}/> Acessar</> : <><UserPlus size={18}/> Criar Admin</>}
          </button>
        </form>
        
        {systemInitialized && (
            <div className="mt-8 pt-6 border-t border-blue-50 text-center">
                <p className="text-xs text-blue-400 flex items-center justify-center gap-1.5 font-semibold">
                    <Lock size={12}/> Ambiente seguro.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}

export default Login;