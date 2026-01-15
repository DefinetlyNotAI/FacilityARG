import { redirect } from "next/navigation";
import { Data } from "@/components/quests/all_quests";

export const dynamic = "force-static";

export default function QuestsJSONPage() {
    if (process.env.NODE_ENV !== "development") {
        redirect("/");
    }

    return (
        <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>
            {JSON.stringify(Data, null, 2)}
        </pre>
    );
}
