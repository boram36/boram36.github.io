// src/pages/Home.jsx
import YearList from '../components/YearList';

export default function Home() {
    return (
        <div className="big-year-list">
            <div className="year-wrap">
                <div className="container">
                    <div className="row">
                        {/* 데스크탑용 */}
                        <div className="col-sm-12 hidden-sm-down">
                            <YearList columns={2} />
                        </div>

                        {/* 모바일용 등 필요하면 따로 */}
                    </div>
                </div>
            </div>
        </div>
    );
}
