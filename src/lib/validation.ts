/**
 * Validation regex patterns shared across the application.
 * These follow the exact rules enforced by the backend as of 2026-04-02.
 */

export const VALIDATION_REGEX = {
  // Mobile: Starts with 6, 7, 8, or 9 and has exactly 10 digits
  MOBILE: /^[6789]\d{9}$/,
  
  // Mobile (Profile): Starts with 6-9 and has exactly 10 digits
  MOBILE_PROFILE: /^[6-9]\d{9}$/,
  
  // Pincode: Exactly 6 digits
  PINCODE: /^\d{6}$/,
  
  // GST: 15 characters (State code, PAN, Entity code, Checksum)
  // Format: 22AAAAA0000A1Z5
  GST: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  
  // Email: Standard email pattern
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Complex Password (Student Sign-in): 
  // At least 8 chars, one uppercase, one lowercase, one number, one special character
  COMPLEX_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  // Names: Min 2, max 100 (for profile/enquiry names)
  NAME: /^[a-zA-Z\s]{2,100}$/,
};

/**
 * Validation Helpers
 */

export const isValidEmail = (email: string) => VALIDATION_REGEX.EMAIL.test(email);

export const isValidPhone = (phone: string) => VALIDATION_REGEX.MOBILE.test(phone);

export const isValidPhoneProfile = (phone: string) => VALIDATION_REGEX.MOBILE_PROFILE.test(phone);

export const isValidPincode = (pincode: string) => VALIDATION_REGEX.PINCODE.test(pincode);

export const isValidGst = (gst: string) => VALIDATION_REGEX.GST.test(gst);

export const isValidComplexPassword = (password: string) => VALIDATION_REGEX.COMPLEX_PASSWORD.test(password);

export const isValidLinkedInUrl = (value: string) => {
  if (!value) return false;
  const trimmed = value.trim();
  const urlPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-z0-9_%\-]{3,100}\/?(\?.*)?$/i;
  return urlPattern.test(trimmed);
};

export const isValidDateOfBirth = (value: string | Date | null) => {
  if (!value) return false;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }

  return age >= 16 && age <= 50;
};

export const validateCampusAmbassadorStep = (step: number, data: any) => {
  const errors: string[] = [];

  if (step === 1) {
    const firstName = (data.firstName || "").trim();
    const lastName = (data.lastName || "").trim();
    if (!firstName) errors.push("First name is required");
    if (firstName && (firstName.length < 2 || firstName.length > 50)) {
      errors.push("First name must be between 2 and 50 characters");
    }
    if (!lastName) errors.push("Last name is required");
    if (lastName && (lastName.length < 2 || lastName.length > 50)) {
      errors.push("Last name must be between 2 and 50 characters");
    }
    if (!data.educationLevel) errors.push("Education level is required");
    if (!data.department) errors.push("Department is required");
    if (!data.dateOfBirth) {
      errors.push("Date of birth is required");
    } else if (!isValidDateOfBirth(data.dateOfBirth)) {
      errors.push("Date of birth must be between ages 16 and 50");
    }
    if (!data.currentYear) errors.push("Current year is required");
    if (!data.linkedinProfile) {
      errors.push("LinkedIn profile is required");
    } else if (!isValidLinkedInUrl(data.linkedinProfile)) {
      errors.push("LinkedIn profile must be a valid LinkedIn URL");
    }
  } else if (step === 2) {
    if (!data.email) errors.push("Email is required");
    if (data.email && !isValidEmail(data.email)) errors.push("Invalid email format");
    if (!data.mobileNumber) errors.push("Mobile number is required");
    if (data.mobileNumber && !isValidPhone(data.mobileNumber)) {
      errors.push("Invalid mobile number (Starts with 6-9, 10 digits)");
    }
    if (!data.emailVerified) errors.push("Please complete email verification");
    if (!data.otpVerified) errors.push("Please complete OTP verification");
  } else if (step === 3) {
    const hasInstitution =
      (data.institutionName && data.institutionName !== "other") ||
      (data.manualInstitutionName && data.manualInstitutionName.trim());
    if (!hasInstitution) errors.push("Please select or enter your institution name");
    if (!data.city) errors.push("City is required");
  }

  return errors;
};

/**
 * Validates partner/institution details
 */
export const validatePartnerRegistrationStep = (step: number, data: any) => {
  if (step === 1) {
    if (!data.companyName) return "Company name is required";
    if (data.instructorName && (data.instructorName.length < 1 || data.instructorName.length > 50)) {
      return "Instructor name must be between 1 and 50 characters";
    }
    if (data.hasGst) {
      if (!data.gst) return "GST number is required when GST is enabled";
      if (!isValidGst(data.gst)) return "Invalid GST format (Example: 22AAAAA0000A1Z5)";
    }
  } else if (step === 2) {
    if (!data.city) return "City is required";
    if (!data.state) return "State is required";
    if (!data.pincode) return "Pincode is required";
    if (!isValidPincode(data.pincode)) return "Invalid pincode (Exactly 6 digits)";
    if (!data.addressLine1) return "Address line 1 is required";
  } else if (step === 3) {
    if (!data.email) return "Email is required";
    if (!isValidEmail(data.email)) return "Invalid email format";
    if (!data.phone) return "Phone number is required";
    if (!isValidPhone(data.phone)) return "Invalid mobile number (Starts with 6-9, 10 digits)";
    if (!data.password) return "Password is required";
    if (data.password.length < 6) return "Password must be at least 6 characters";
  }
  return null;
};
