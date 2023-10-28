import { MdAutoAwesome } from "react-icons/md";
import QuickLink from "./BaseQuickLink";

function RecommendationQuickLink() {
    return (
        <QuickLink
            icon={<MdAutoAwesome />}
            title="Recommendations"
            description="Get a personalized recommendations based on your interests."
            href="/browse/courses"
        />
    );

}

export default RecommendationQuickLink;