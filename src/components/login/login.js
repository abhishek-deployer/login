import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import styles from "./login.module.css";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../firebase";
import Cookies from "js-cookie";
import axios from "axios";
import { API_URL } from "../../service/url";
import { toast } from "react-toastify";

const Login = () => {
  const generateRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha",
      {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          // ...
        },
      },
      auth
    );
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [otpSent, setOtpSent] = useState(false);

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

          // Assuming you have a login API endpoint
          axios
            .post(`${API_URL}/auth/login`, {
              to: `+91${data.phone}`, // assuming your login API expects the phone number
            })
            .then((response) => {
              // Assuming the response contains a token
              if (response.data.message === "Login successfully.") {
                let token = response.data.token;

                // Set the token in cookies or another secure storage method
                Cookies.set("token", token);
                console.log("Login successful. Token:", token);

                // Reload the page or redirect to a new page
                window.location.reload("/");
              } else {
                // alert('Invalid credenitals');

                toast.error(response.data.message);
              }
            })
            .catch((error) => {
              console.error("Error in login API:", error);
              alert("User couldn't log in. Please try again.");
            });
        })
        .catch((error) => {
          alert("User couldn't sign in (bad verification code?)");
        });
    } else {
      alert("Incorrect OTP");
    }
  };

  const onSubmit = async (data) => {
    if (otpSent) {
      console.log("OTP:", data.otp);
      verifyOtp(data);
    } else {
      console.log("Phone Number:", data.phone);
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

      setOtpSent(true);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.login}>
        <div className="">
          <div className={styles.overlap_group}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.input_field}>
                <div className={styles.frame}>
                  <div className={styles.input_field_name}>Phone Number</div>
                </div>

                <div className={styles.input_field_2}>
                  <input
                    type="tel"
                    className={styles.div_wrapper}
                    {...register("phone", {
                      required: true,
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Enter a valid 10-digit phone number",
                      },
                    })}
                    placeholder="Enter phone number (10 digits)"
                  />
                  {errors.phone && (
                    <span className={styles.error}>
                      {errors.phone.message ||
                        "Enter a valid 10-digit phone number"}
                    </span>
                  )}
                </div>
                <div id="recaptcha"></div>
              </div>

              {otpSent && (
                <div className={styles.input_field}>
                  <div className={styles.frame}>
                    <div className={styles.input_field_name}>Enter OTP</div>
                  </div>

                  <div className={styles.input_field_2}>
                    <input
                      type="text"
                      className={styles.div_wrapper}
                      {...register("otp", {
                        required: true,
                        pattern: {
                          value: /^[0-9]{6}$/,
                          message: "Enter a valid 6-digit OTP",
                        },
                      })}
                      placeholder="Enter OTP received on your phone"
                    />
                    {errors.otp && (
                      <span className={styles.error}>
                        {errors.otp.message || "Enter a valid 6-digit OTP"}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button className={styles.button_login} type="submit">
                {otpSent ? "Verify OTP" : "Send OTP"}
              </button>
              {/* Link to the Signup page */}
              <p className="mt-2">
                Don't have an account?{" "}
                <Link to="/signup">
                  <a>Sign up here</a>
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
