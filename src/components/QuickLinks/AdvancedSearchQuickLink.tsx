import QuickLink from "./BaseQuickLink";
import { MdOutlineManageSearch } from "react-icons/md";

function AdvancedSearchQuickLink() {
    return (
        <QuickLink
            icon={<MdOutlineManageSearch />}
            title="Advanced Search"
            description="Filter and sort upcoming courses to find the perfect one for you"
            href="/"
            available={false}
        />
    );

}

export default AdvancedSearchQuickLink;