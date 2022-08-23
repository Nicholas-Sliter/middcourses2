import styles from "./FeaturedCard.module.scss";


function FeaturedCard({ }) {
    const imageUrl = "/images/blur.svg";

    return (
        <div className={styles.featuredCard} style={{ backgroundImage: `url(${imageUrl})` }}>
            <div className={styles.content}></div>
        </div>
    )


}


export default FeaturedCard;