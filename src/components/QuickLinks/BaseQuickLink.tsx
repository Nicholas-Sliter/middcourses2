import Link from "next/link";
import styles from "./BaseQuickLink.module.scss";
import { Tooltip, Badge } from "@chakra-ui/react";
import { combind } from "../../lib/frontend/utils";

interface QuickLinkProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    href: string;
    visible?: boolean;
    available?: boolean;
    isNew?: boolean;
}


function QuickLink({
    icon,
    title,
    description,
    href,
    visible = true,
    available = true,
    isNew = false,
}: QuickLinkProps) {

    if (!visible) {
        return null;
    }

    const TooltipWrapper = ({ children }: { children: React.ReactChildren | React.ReactNode | null }) => {
        if (!children) {
            return null;
        }
        if (available) {
            return (
                <Tooltip label={description} aria-label={description} placement="top">
                    {children}
                </Tooltip>
            );
        } else {
            return (
                <Tooltip label="Coming Soon!" aria-label="Coming Soon!" placement="top">
                    {children}
                </Tooltip>
            );
        }
    }

    const availableClass = available ? styles.available : styles.unavailable;
    const availableHref = available ? href : "/";

    return (
        <Link href={availableHref} passHref>
            <a className={combind([styles.quickLinkContainer, availableClass])} href={availableHref}>
                <TooltipWrapper>
                    <div>
                        <div className={styles.iconContainer}>
                            {icon}
                        </div>
                        <div className={styles.textContainer}>
                            <h3>{title}
                                {isNew && <Badge
                                    ml='1'
                                    colorScheme='green'>
                                    New
                                </Badge>}</h3>
                        </div>
                    </div>
                </TooltipWrapper>
            </a>

        </Link>
    );
}

export default QuickLink;