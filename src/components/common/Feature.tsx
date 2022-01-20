
import styles from '../../styles/components/common/Feature.module.scss';


export default function Feature({children}){
   return (
      <div className={styles.feature}>
         {children}
      </div>
   )
}