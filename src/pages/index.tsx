import PageTitle from "../components/common/PageTitle";

import styles from "../styles/pages/Home.module.scss";

import Message from "../components/common/Message";
import TextInput  from "../components/common/TextInput";

export default function Home() {
  return (
    <>
      <PageTitle pageTitle="Home" />
      <div className={styles.pageTop}>
        <Message type="error" message="Error message" />
        <Message type="info" message="Info message" />
        <Message type="success" message="Success message" />
        <Message type="warning" message="Warning message" />
        <Message
          type="error"
          message="This is a really really long error message beacuse I want to test what happens when we given an entire error message to the component"
        />
        <TextInput value="test value" setValue={() => {}} />
      </div>
    </>
  );
}
