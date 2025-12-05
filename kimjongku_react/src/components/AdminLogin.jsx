import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';


export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav("/admin/works");
    });
  }, [nav]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(`로그인 실패: ${error.message}`);
    } else if (data.session) {
      setMessage("로그인 성공! 이동합니다...");
      nav("/admin/works");
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="inner">
        <h3 className="mb-4">관리자 로그인</h3>
        <form onSubmit={onSubmit} className="mb-3">
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-control" />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="form-control" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "로그인 중…" : "로그인"}
          </button>
        </form>
        {message && <p className={message.includes('실패') ? "mt-3 text-danger" : "mt-3 text-success"}>{message}</p>}
      </div>
    </div>
  );

}