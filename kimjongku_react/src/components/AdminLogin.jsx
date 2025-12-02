import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

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
        <h3>관리자 로그인</h3>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label><br />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label><br />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>{loading ? "로그인 중…" : "로그인"}</button>
      </form>
      {message && <p style={{ marginTop: 12 }}>{message}</p>}
      <p style={{ marginTop: 8, color: "#666" }}>
        Supabase Auth에서 관리자 계정을 먼저 생성하세요.
      </p>
        </div>
      
    </div>
  );
}
