
import Link from 'next/link';
import styles from '../../styles/components/common/Feature.module.scss';


export default function Feature({ children, link = "" }) {
   return (
      <Link href={link} passHref>
         <div className={styles.feature}>
            {children}
         </div>
      </Link>
   )
}