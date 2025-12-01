import { useParams } from "react-router-dom";

export default function Work() {
  const { year } = useParams();
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Works for {year}</h2>
      <p>해당 연도의 작품 정보를 여기에 표시하세요.</p>
    </div>
  );
}
