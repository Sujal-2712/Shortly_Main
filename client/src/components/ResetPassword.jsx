import React, { useState, useContext } from 'react';
import { Input } from './../components/ui/input';
import Error from './../components/Error';
import { Button } from './../components/ui/button';
import { useFormik } from 'formik';
import { UserContext } from "./../App";
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import apiClient from './../api/index';

const ResetPassword = () => {
    const { userAuth } = useContext(UserContext);
    const navigate = useNavigate();

    const validationPasswordSchema = Yup.object({
        newPassword: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
            .required('Confirm Password is required'),
    });

    if (userAuth.access_token == null) {
        navigate("/auth");
        return;
    }

    const formikPassword = useFormik({
        initialValues: { newPassword: '', confirmPassword: '' },
        validationSchema: validationPasswordSchema,
        onSubmit: async (values) => {
            const res = await apiClient.post('/auth/reset-password', { password: values.newPassword });
            if (res.success) {
                toast.success(res.message || 'Password reset successfully');
                formikPassword.resetForm();
                navigate('/auth');
            } else {
                toast.error(res.message || 'Error occurred while resetting password!');
                console.error('Password reset failed:', res);
            }
        }
    });

    return (
        <div className="w-full mt-8 flex items-center justify-center">
            <div className='bg-white/10 border border-white/50 p-8 rounded-xl shadow-lg backdrop-blur-sm w-full max-w-md space-y-8'>
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-500 rounded-full mb-4">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Reset Your Password</h2>
                    <p className="text-slate-400">Enter your new password to update your account</p>
                </div>

                <form onSubmit={formikPassword.handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Input
                            type="password"
                            name="newPassword"
                            placeholder="Enter your new password"
                            value={formikPassword.values.newPassword}
                            onChange={formikPassword.handleChange}
                            onBlur={formikPassword.handleBlur}
                            required
                            className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl backdrop-blur-sm focus:bg-white/20 focus:border-blue-400 transition-all duration-300"
                        />
                        {formikPassword.touched.newPassword && formikPassword.errors.newPassword && (
                            <Error msg={formikPassword.errors.newPassword} />
                        )}
                    </div>

                    <div className="space-y-2">
                        <Input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your new password"
                            value={formikPassword.values.confirmPassword}
                            onChange={formikPassword.handleChange}
                            onBlur={formikPassword.handleBlur}
                            required
                            className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl backdrop-blur-sm focus:bg-white/20 focus:border-blue-400 transition-all duration-300"
                        />
                        {formikPassword.touched.confirmPassword && formikPassword.errors.confirmPassword && (
                            <Error msg={formikPassword.errors.confirmPassword} />
                        )}
                    </div>

                    <Button
                        disabled={formikPassword.isSubmitting || !formikPassword.isValid}
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300 border-0"
                    >
                        {formikPassword.isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Resetting Password...
                            </div>
                        ) : (
                            'Reset Password'
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;