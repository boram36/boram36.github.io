import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function YearPage() {
    const { year } = useParams();
    const [works, setWorks] = useState([]);

    useEffect(() => {
        fetchWorks();
    }, [year]);

    async function fetchWorks() {
        const { data, error } = await supabase
            .from("works")
            .select("*")
            .eq("year", year);

        if (error) console.log(error);
        else setWorks(data);
    }

    return (
        <div style={{ padding: "50px" }}>
            <h2>{year} Works</h2>
            {works.map((item) => (
                <div key={item.id} className="work-card">
                    <img src={item.image} alt={item.title} />
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                </div>
            ))}
            {works.length === 0 && <p>No data for {year}</p>}
        </div>
    );
}
