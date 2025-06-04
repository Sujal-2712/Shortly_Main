import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Input } from './ui/input';
import Error from './Error';
import { Button } from './ui/button';
import apiClient from './../api/index';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

const validationSchema = Yup.object({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
});

const Signup = ({ setIsCreated }) => {
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            const { email, password } = values;
            const res = await apiClient.post('/auth/signup', { email, password });
             
            if (res.success) {
                toast.success(res.message || "Account created successfully!");
                setIsCreated(true);
                formik.resetForm();
            } else {
                toast.error(res.message || "Failed to create account. Please try again.");
                console.error("Signup error:", res);
            }
            setLoading(false);
        },
    });

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-500 rounded-full mb-4">
                    <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-slate-400">Join us to start shortening your URLs</p>
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
                        className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl backdrop-blur-sm focus:bg-white/20 focus:border-green-400 transition-all duration-300"
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
                        className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl backdrop-blur-sm focus:bg-white/20 focus:border-green-400 transition-all duration-300"
                    />
                    {formik.touched.password && formik.errors.password && (
                        <Error msg={formik.errors.password} />
                    )}
                </div>

                <div className="space-y-2">
                    <Input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        required
                        className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl backdrop-blur-sm focus:bg-white/20 focus:border-green-400 transition-all duration-300"
                    />
                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                        <Error msg={formik.errors.confirmPassword} />
                    )}
                </div>

                <Button
                    disabled={loading || formik.isSubmitting}
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300 border-0"
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Creating account...
                        </div>
                    ) : (
                        'Create Account'
                    )}
                </Button>
            </form>
        </div>
    );
};

export default Signup;