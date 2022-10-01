import styles from "./HideWithoutPermission.module.scss";

interface HideWithoutPermissionProps {
    permission?: boolean;
    message?: string;
    children: React.ReactNode;
    className?: string;
}

function HideWithoutPermission({ children, className, message, permission = false }: HideWithoutPermissionProps) {

    if (!permission) {
        return (
            <div className={`${className} ${styles.missingPermission}`}>
                {message}
            </div>
        )
    }

    return (
        <div className={className}>
            {children}
        </div>
    );
}


export default HideWithoutPermission;