import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import styles from './signup.module.css';
import { useNavigate, Link } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../firebase';
import Cookies from 'js-cookie';
import { API_URL } from '../../service/url';
import axios from 'axios';
const Signup = () => {
    const navigate = useNavigate();
    const generateRecaptcha = () => {
        window.recaptchaVerifier = new RecaptchaVerifier(
            'recaptcha',
            {
                size: 'invisible',
                callback: (response) => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                    // ...
                },
            },
            auth,
        );
    };

    const verifyOtp = (data) => {
        let otp = data.otp;

        // Update the condition based on your OTP verification logic
        if (otp.length === 6) {
            let confirmationResult = window.confirmationResult;
            confirmationResult
                .confirm(otp)
                .then((result) => {
                    let user = result.user;
                    console.log(user);

                    // Post phone number and username to the signup API
                    axios
                        .post(`${API_URL}/auth/register`, {
                            to: `+91${data.phone}`,
                            adminName: data.username,
                        })
                        .then((response) => {
                            // Assuming the response contains a token
                            console.log('response', response);
                            let token = response.data.token;

                            // Set the token in cookies or another secure storage method
                            Cookies.set('token', token);
                            console.log(Cookies.get('token'));
                            navigate('/');
                            // Reload the page or redirect to a new page
                        })
                        .catch((error) => {
                            console.error('Error in signup API:', error);
                            alert("User couldn't sign up. Please try again.");
                        });
                })
                .catch((error) => {
                    alert("User couldn't sign in (bad verification code?)");
                });
        } else {
            alert('Incorrect OTP');
        }
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const [otpSent, setOtpSent] = useState(false);

    const onSubmit = (data) => {
        if (otpSent) {
            // Log the OTP when submitted
            console.log('OTP:', data.otp);
            verifyOtp(data);

            // TODO: Add logic to verify OTP (you might make an API call here)
        } else {
            // Log the form data when submitted
            console.log('Form Data:', data);
            generateRecaptcha(); // Generate recaptchaVerifier
            const appVerifier = window.recaptchaVerifier;

            // Use the international format for the phone number
            const phoneNumber = `+91${data.phone}`;

            signInWithPhoneNumber(auth, phoneNumber, appVerifier)
                .then((confirmationResult) => {
                    window.confirmationResult = confirmationResult;
                })
                .catch((error) => {
                    console.log(error);
                });
            // Update state to indicate that OTP has been sent
            setOtpSent(true);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.login}>
                <div className="">
                    <div className={styles.overlap_group}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div
                                className={`${styles.input_field} ${styles.input_field_instance}`}
                            >
                                <div className={styles.frame}>
                                    <div className={styles.input_field_name}>
                                        User name
                                    </div>
                                </div>

                                <div className={styles.input_field_2}>
                                    <input
                                        type="text"
                                        className={styles.div_wrapper}
                                        {...register('username', {
                                            required: true,
                                        })}
                                        placeholder="Enter username"
                                    />
                                    {errors.username && (
                                        <span className={styles.error}>
                                            This field is required
                                        </span>
                                    )}
                                </div>

                                <div className={styles.frame}>
                                    <div className={styles.input_field_name}>
                                        Phone
                                    </div>
                                </div>

                                <div className={styles.input_field_2}>
                                    <input
                                        type="tel"
                                        className={styles.div_wrapper}
                                        {...register('phone', {
                                            required: true,
                                            pattern: /^[0-9]{10}$/,
                                        })}
                                        placeholder="Enter phone number (10 digits)"
                                    />
                                    {errors.phone && (
                                        <span className={styles.error}>
                                            Enter a valid 10-digit phone number
                                        </span>
                                    )}

                                    <div id="recaptcha"></div>
                                </div>

                                {otpSent && (
                                    <div className={styles.frame}>
                                        <div
                                            className={styles.input_field_name}
                                        >
                                            Enter OTP
                                        </div>
                                    </div>
                                )}

                                <div className={styles.input_field_2}>
                                    {otpSent ? (
                                        <input
                                            type="text"
                                            className={styles.div_wrapper}
                                            {...register('otp', {
                                                required: true,
                                                pattern: /^[0-9]{6}$/,
                                            })}
                                            placeholder="Enter OTP received on your phone"
                                        />
                                    ) : null}
                                    {errors.otp && (
                                        <span className={styles.error}>
                                            Enter a valid 6-digit OTP
                                        </span>
                                    )}
                                </div>

                                <button
                                    className={styles.button_signup}
                                    type="submit"
                                >
                                    {otpSent ? 'Verify OTP' : 'Send OTP'}
                                </button>
                                {/* Link to the Login page */}
                                <p>
                                    Already have an account?{' '}
                                    <Link to="/">
                                        <a>Login here</a>
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
