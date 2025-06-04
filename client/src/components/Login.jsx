import React, { useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import Error from './Error';
import { Button } from './ui/button';
import { useFormik } from 'formik';
import  apiClient  from "./../api/index";
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { UserContext } from "../App";
import { storeInSession } from '@/common/session';
import { LogIn, LogInIcon } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { setUserAuth } = useContext(UserContext);

    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),
        password: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .required('Password is required'),
    });

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            const res = await apiClient.post('/auth/login', values);
            if (res.success) {
                console.log(res.data);
                const { token, user } = res.data.data;
                storeInSession('user', JSON.stringify(res.data.data));
                setUserAuth({ access_token: token, profile_img: user.profile_img, email: user.email });
                formik.resetForm();
                toast.success(res.message || 'Login Successful');
                navigate('/dashboard');
            } else {
                toast.error(res.message || 'Login failed. Please check your credentials.');
                // console.error('Login error:', res);
            }
        },
    });

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-500 rounded-full mb-4">
                    <LogInIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-slate-400">Sign in to your account to continue</p>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        required
                        className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl backdrop-blur-sm focus:bg-white/20 focus:border-blue-400 transition-all duration-300"
                    />
                    {formik.touched.email && formik.errors.email && (
                        <Error msg={formik.errors.email} />
                    )}
                </div>

                <div className="space-y-2">
                    <Input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        required
                        className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl backdrop-blur-sm focus:bg-white/20 focus:border-blue-400 transition-all duration-300"
                    />
                    {formik.touched.password && formik.errors.password && (
                        <Error msg={formik.errors.password} />
                    )}
                </div>

                <Button
                    disabled={formik.isSubmitting || !formik.isValid}
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300 border-0"
                >
                    {formik.isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Signing in...
                        </div>
                    ) : (
                        'Sign In'
                    )}
                </Button>

                <p className="text-center text-slate-400 mt-4">
                    <a href="/forgot-password" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-300">
                        Forgot password?
                    </a>
                </p>
            </form>
        </div>
    );
};

export default Login;