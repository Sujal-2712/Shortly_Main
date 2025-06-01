import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../App';

const ProtectedRoute = ({ element }) => {
  const { userAuth } = useContext(UserContext);
  if (userAuth.access_token===null) {
    return <Navigate to="/auth" />;
  }
  return element;
};

export default ProtectedRoute;
