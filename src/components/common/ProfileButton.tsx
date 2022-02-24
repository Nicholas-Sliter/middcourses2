import { FaRegUserCircle } from "react-icons/fa";
import styles from "../../styles/components/common/ProfileButton.module.scss";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
} from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { FiLogOut, FiList, FiUser } from "react-icons/fi";
import { FaUserEdit } from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";

export default function ProfileButton({}) {
  const { data: session } = useSession();

  return (
    <>
      <Menu>
        <MenuButton as="button" className={styles.containerButton}>
          <Icon as={FaRegUserCircle} className={styles.icon} />
        </MenuButton>
        <MenuList
          style={{ backgroundColor: "#fcfcfc" }}
          className={styles.dropdownMenu}
        >
          <p className={styles.profileEmail}>{session?.user?.email}</p>
          <MenuItem icon={<FiUser />}>Edit Profile</MenuItem>
          <MenuItem icon={<FiList />}>View Reviews</MenuItem>
          <MenuItem onClick={() => signOut()} icon={<FiLogOut />}>
            {" "}
            Sign Out
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );

  //<p className={styles.profileEmail}>{session?.user?.email}</p>
}

/**        <button className={styles.containerButton}>
          <FaRegUserCircle />
        </button> */
