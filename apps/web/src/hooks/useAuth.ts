import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { LoginInput, RegisterInput } from '@catchapi/shared';
import { loginUser, registerUser, logoutUser } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { queryClient } from '@/lib/queryClient';
import { ROUTES } from '@/lib/constants';

export const useLogin = () => {
  const { setCredentials } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginInput) => loginUser(data),
    onSuccess: (responseData) => {
      setCredentials(responseData.token, {
        id: responseData._id,
        name: responseData.name,
        email: responseData.email,
      });
      navigate(ROUTES.DASHBOARD);
    },
  });
};

export const useRegister = () => {
  const { setCredentials } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterInput) => registerUser(data),
    onSuccess: (responseData) => {
      setCredentials(responseData.token, {
        id: responseData._id,
        name: responseData.name,
        email: responseData.email,
      });
      navigate(ROUTES.DASHBOARD);
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      // whether the API call succeeded or failed
      logout();
      queryClient.clear();
      navigate(ROUTES.LOGIN);
    },
  });
};
