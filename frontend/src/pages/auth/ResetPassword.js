import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiLock, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { resetPassword, isLoading } = useAuthStore();
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        const result = await resetPassword(token, data.password);

        if (result.success) {
            setSuccess(true);
            toast.success('Your password has been successfully reset!');
        } else {
            toast.error(result.error || 'Failed to reset password');
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                            <FiCheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Password Reset Complete
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Your password has been successfully updated. You can now log in with your new password.
                        </p>
                        <div className="mt-6">
                            <Link
                                to="/login"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                            >
                                Go to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">K</span>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create New Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Please enter your new password below.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters',
                                        },
                                    })}
                                    type="password"
                                    className="input-field pl-10 block w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    placeholder="Enter new password"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm New Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('confirmPassword', {
                                        required: 'Please confirm your password',
                                        validate: (val) => {
                                            if (watch('password') != val) {
                                                return 'Passwords do no match';
                                            }
                                        },
                                    })}
                                    type="password"
                                    className="input-field pl-10 block w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    placeholder="Confirm new password"
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <LoadingSpinner size="small" />
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
                        >
                            <FiArrowLeft className="mr-2" />
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
