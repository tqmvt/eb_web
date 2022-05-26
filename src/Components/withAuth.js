import { useRouter } from 'next/router';
import { Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';

const withAuth = (Component) => {
  const Auth = (props) => {
    const router = useRouter();
    const walletAddress = useSelector((state) => state.user.address);
    const authInitFinished = useSelector((state) => state.appInitialize.authInitFinished);

    if (!authInitFinished) {
      return (
        <div className="col-lg-12 text-center justify-content-center align-items-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }

    if (!walletAddress) {
      router.push('/');
      return <></>;
    }

    // If user is logged in, return original component
    return <Component {...props} />;
  };

  // Copy getInitial props so it will run as well
  if (Component.getInitialProps) {
    Auth.getInitialProps = Component.getInitialProps;
  }

  return Auth;
};

export default withAuth;
