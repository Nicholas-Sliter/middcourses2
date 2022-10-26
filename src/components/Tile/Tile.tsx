import styles from "./Tile.module.scss";


function Tile({ children }) {

    return (

        <div className={styles.container}>
            {children}
        </div>


    );


}


export default Tile;