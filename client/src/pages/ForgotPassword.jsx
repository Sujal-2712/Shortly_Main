import React, { useState, useEffect } from 'react';
import { Input } from './../components/ui/input';
import Error from './../components/Error';
import { Button } from './../components/ui/button';
import { useFormik } from 'formik';
import apiClient from './../api/index';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Mail, Lock, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpExpired, setOtpExpired] = useState(false);
    const [timer, setTimer] = useState(300); // OTP expires in 5 minutes
    const [passwordReset, setPasswordReset] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (otpSent && timer > 0) {
            const countdown = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(countdown);
        }
        if (timer === 0) {
            setOtpExpired(true);
        }
    }, [otpSent, timer]);

    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email address').required('Email is required'),
    });

    const formikEmail = useFormik({
        initialValues: { email: '' },
        validationSchema,
        onSubmit: async (values) => {
            const res = await apiClient.post('/auth/forgot-password', { email: values.email });
            console.log(res);
            if (res.success) {
                setOtp(res.data.otp);
                setUserEmail(values.email);
                setOtpSent(true);
                toast.success(res.message || 'OTP sent to your email address');
                formikEmail.resetForm();
            } else {
                toast.error(res.message || 'Error occurred while sending OTP!');
                console.error('Forgot Password request failed:', res);
            }
        }
    });

    const validationOtpSchema = Yup.object({
        otp: Yup.string().length(6, 'OTP must be 6 digits').required('OTP is required'),
    });

    const formikOtp = useFormik({
        initialValues: { otp: '' },
        validationSchema: validationOtpSchema,
        onSubmit: async (values) => {
            try {
                if (otp == values.otp) {
                    setPasswordReset(true);
                    toast.success('OTP verified! You can now reset your password.');
                    formikOtp.resetForm();
                } else {
                    toast.error('Invalid OTP!');
                }
            } catch (err) {
                toast.error('Error occurred while verifying OTP!');
                console.error('OTP verification failed:', err);
            }
        },
    });

    const validationPasswordSchema = Yup.object({
        newPassword: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
            .required('Confirm Password is required'),
    });

    const formikPassword = useFormik({
        initialValues: { newPassword: '', confirmPassword: '' },
        validationSchema: validationPasswordSchema,
        onSubmit: async (values) => {
            const res = await apiClient.post('/auth/reset-password', {
                email: userEmail,
                password: values.newPassword,
            });

            if (res.success) {
                toast.success(res.message || 'Password reset successfully');
                setOtpSent(false);
                setPasswordReset(false);
                formikPassword.resetForm();
                navigate('/auth');
            } else {
                toast.error(res.message || 'Error occurred while resetting password!');
                console.error('Password reset failed:', res);
            }
        }
    });

    const handleBackToLogin = () => {
        navigate('/auth');
    };

    const getIcon = () => {
        if (passwordReset) return <Lock className="w-8 h-8 text-white" />;
        if (otpSent) return <KeyRound className="w-8 h-8 text-white" />;
        return <Mail className="w-8 h-8 text-white" />;
    };

    const getTitle = () => {
        if (passwordReset) return "Reset Password";
        if (otpSent) return "Enter OTP";
        return "Forgot Password";
    };

    const getDescription = () => {
        if (passwordReset) return "Enter your new password to complete the reset";
        if (otpExpired) return "OTP has expired. Please request a new one";
        if (otpSent) return "Enter the 6-digit OTP sent to your email";
        return "Enter your email to receive a password reset code";
    };

    return (
        <div className="w-full mt-8  flex items-center justify-center ">
            <div className='bg-white/10 border border-white/50 p-8 rounded-xl shadow-lg backdrop-blur-sm w-full max-w-md space-y-8'>
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-500 rounded-full mb-4">
                        {getIcon()}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">{getTitle()}</h2>
                    <p className="text-slate-400">{getDescription()}</p>
                </div>

                {/* Email Form */}
                {!otpSent && !passwordReset && (
                    <form onSubmit={formikEmail.handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formikEmail.values.email}
                                onChange={formikEmail.handleChange}
                                onBlur={formikEmail.handleBlur}
                                required
                                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl backdrop-blur-sm focus:bg-white/20 focus:border-blue-400 transition-all duration-300"
                            />
                            {formikEmail.touched.email && formikEmail.errors.email && (
                                <Error msg={formikEmail.errors.email} />
                            )}
                        </div>

                        <Button
                            disabled={formikEmail.isSubmitting || !formikEmail.isValid}
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300 border-0"
                        >
                            {formikEmail.isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Sending OTP...
                                </div>
                            ) : (
                                'Send OTP'
                            )}
                        </Button>

                        <p className="text-center text-slate-400 mt-4">
                            <button
                                type="button"
                                onClick={handleBackToLogin}
                                className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-300 flex items-center gap-2 mx-auto"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Sign In
                            </button>
                        </p>
                    </form>
                )}

                {/* OTP Form */}
                {otpSent && !passwordReset && !otpExpired && (
                    <form onSubmit={formikOtp.handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                name="otp"
                                placeholder="Enter 6-digit OTP"
                                value={formikOtp.values.otp}
                                onChange={formikOtp.handleChange}
                                onBlur={formikOtp.handleBlur}
                                required
                                maxLength="6"
                                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl backdrop-blur-sm focus:bg-white/20 focus:border-blue-400 transition-all duration-300 text-center text-lg tracking-widest"
                            />
                            {formikOtp.touched.otp && formikOtp.errors.otp && (
                                <Error msg={formikOtp.errors.otp} />
                            )}
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-slate-400 mb-4">
                                {timer > 0 ? (
                                    <>OTP expires in <span className="text-blue-400 font-semibold">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span></>
                                ) : (
                                    <span className="text-red-400">OTP expired</span>
                                )}
                            </p>
                        </div>

                        <Button
                            disabled={formikOtp.isSubmitting || !formikOtp.isValid}
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300 border-0"
                        >
                            {formikOtp.isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Verifying...
                                </div>
                            ) : (
                                'Verify OTP'
                            )}
                        </Button>

                        <p className="text-center text-slate-400 mt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setOtpSent(false);
                                    setTimer(600);
                                    setOtpExpired(false);
                                }}
                                className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-300"
                            >
                                Request new OTP
                            </button>
                        </p>
                    </form>
                )}

                {/* Password Reset Form */}
                {passwordReset && (
                    <form onSubmit={formikPassword.handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                name="newPassword"
                                placeholder="Enter new password"
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
                                placeholder="Confirm new password"
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
                                    Resetting...
                                </div>
                            ) : (
                                'Reset Password'
                            )}
                        </Button>
                    </form>
                )}

                {/* Expired OTP State */}
                {otpExpired && (
                    <div className="space-y-6">
                        <div className="text-center py-8">
                            <div className="text-red-400 mb-4">
                                <KeyRound className="w-12 h-12 mx-auto opacity-50" />
                            </div>
                            <p className="text-slate-300 mb-6">Your OTP has expired. Please request a new one.</p>
                            <Button
                                onClick={() => {
                                    setOtpSent(false);
                                    setOtpExpired(false);
                                    setTimer(600);
                                }}
                                className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300 border-0 px-8"
                            >
                                Request New OTP
                            </Button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default ForgotPassword;