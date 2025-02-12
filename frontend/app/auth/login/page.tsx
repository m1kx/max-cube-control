import LoginForm from "@/app/components/LoginForm";
import styles from "./page.module.scss";

const Login = async () => {
  return (
    <div className={styles.formContainer}>
      <LoginForm />
    </div>
  );
};

export default Login;
