import { Link } from "react-router-dom";
import "../styles/AdminMenu.css";

const sections = [
  {
    title: "대시보드",
    description: "홈 메인 배경과 소개 문구를 빠르게 관리하세요.",
    actions: [{ label: "대시보드 이동", to: "/admin/main-bg" }],
  },
  {
    title: "Biography",
    description: "작가 이력과 전시 이미지를 업데이트합니다.",
    actions: [
      { label: "등록", to: "/admin/biography" },
      { label: "리스트", to: "/admin/biography/list", variant: "secondary" },
    ],
  },
  {
    title: "Publications",
    description: "출판 기록을 연도 순으로 정리합니다.",
    actions: [
      { label: "등록", to: "/admin/publications" },
      { label: "리스트", to: "/admin/publications/list", variant: "secondary" },
    ],
  },
  {
    title: "Public Art",
    description: "퍼블릭 아트 프로젝트 정보를 관리합니다.",
    actions: [
      { label: "등록", to: "/admin/public-art" },
      { label: "리스트", to: "/admin/public-art/list", variant: "secondary" },
    ],
  },
  {
    title: "Essays & Press",
    description: "기사와 에세이 자료를 최신으로 유지하세요.",
    actions: [
      { label: "등록", to: "/admin/essays" },
      { label: "리스트", to: "/admin/essays/list", variant: "secondary" },
    ],
  },
  {
    title: "Works",
    description: "작품 이미지를 등록하고 정렬합니다.",
    actions: [
      { label: "등록", to: "/admin/works" },
      { label: "리스트", to: "/admin/works/list", variant: "secondary" },
    ],
  },
  {
    title: "Video",
    description: "비디오 링크와 썸네일을 업데이트합니다.",
    actions: [
      { label: "등록", to: "/admin/video" },
      { label: "리스트", to: "/admin/video/list", variant: "secondary" },
    ],
  },
];

export default function AdminMenu() {
  return (
    <div className="container">
      <div className="inner">
        <div className="admin-menu">
          <h3>관리자 메뉴</h3>
          <div className="admin-menu-grid">
            {sections.map((section) => (
              <div key={section.title} className="admin-menu-card">
                <div>
                  <h4>{section.title}</h4>
                  {section.description && <p>{section.description}</p>}
                </div>
                <div className="admin-menu-actions">
                  {section.actions.map((action) => (
                    <Link
                      key={action.to}
                      to={action.to}
                      className={`admin-menu-button${action.variant === "secondary" ? " secondary" : ""}`}
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
