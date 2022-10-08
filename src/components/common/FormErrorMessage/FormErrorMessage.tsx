import { Alert, AlertIcon } from "@chakra-ui/react";
import { ErrorMessage } from "@hookform/error-message";
import styles from "./FormErrorMessage.module.scss";


function FormErrorMessage({ errors, name }) {
    return (
        <ErrorMessage
            errors={errors}
            name={name}
            render={({ message }) => (
                <Alert status="error" className={styles.formError}><AlertIcon />{message} </Alert>
            )}
        />
    );
}

export default FormErrorMessage;